import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

type RouteCtx = { params: Promise<{ id: string }> | { id: string } };
const clean = (v: any) => String(v ?? "").trim();

async function getParamId(ctx: RouteCtx) {
  const p: any = ctx?.params;
  const obj = typeof p?.then === "function" ? await p : p;
  return decodeURIComponent(clean(obj?.id || ""));
}

type Doc = InstanceType<typeof PDFDocument>;

function buildPdfBuffer(make: (doc: Doc) => void) {
  return new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 28, left: 32, right: 32, bottom: 28 },
    });

    const chunks: Buffer[] = [];
    doc.on("data", (c: Buffer) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    make(doc as Doc);
    doc.end();
  });
}

function exists(p: string) {
  try {
    return fs.existsSync(p);
  } catch {
    return false;
  }
}

function fmtNumber(val: number, decimals = 2) {
  const v = Number(val || 0);
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(v);
}

function moneyCode(currency: string, val: number) {
  // SAFE for PDFKit built-in fonts: ASCII only (no ₹, no special bullets)
  return `${currency} ${fmtNumber(val, 2)}`;
}

function fmtDate(d?: Date | null) {
  if (!d) return "-";
  return d.toISOString().slice(0, 10);
}

function kv(doc: Doc, label: string, value: string, x: number, y: number, w: number) {
  doc.font("Helvetica-Bold").fontSize(8.5).fillColor("#374151").text(label, x, y, { width: w });
  doc.font("Helvetica").fontSize(10).fillColor("#111827").text(value || "-", x, y + 12, { width: w });
}

function sectionBar(doc: Doc, title: string, x: number, y: number, w: number) {
  doc.save();
  doc.fillColor("#F3F4F6").rect(x, y, w, 20).fill();
  doc.fillColor("#111827").font("Helvetica-Bold").fontSize(10.5).text(title, x + 10, y + 5);
  doc.restore();
  return y + 26;
}

function clampPercent(n: any) {
  const v = Number(n || 0);
  if (!Number.isFinite(v)) return 0;
  return Math.max(0, Math.min(100, v));
}

function computeTax(subtotal: number, taxPercent: number, taxesIncluded: boolean) {
  const pct = clampPercent(taxPercent);
  const r = pct / 100;
  if (!r || subtotal <= 0) return { pct, taxAmount: 0, total: subtotal };

  if (taxesIncluded) {
    const base = subtotal / (1 + r);
    const taxAmount = subtotal - base;
    return { pct, taxAmount, total: subtotal };
  }

  const taxAmount = subtotal * r;
  return { pct, taxAmount, total: subtotal + taxAmount };
}

function clampTextToHeight(doc: Doc, text: string, width: number, maxHeight: number) {
  let t = text || "";
  if (!t) return "-";
  while (t.length > 0) {
    const h = doc.heightOfString(t, { width });
    if (h <= maxHeight) return t;
    t = t.slice(0, -10).trim();
  }
  return "-";
}

export async function GET(req: Request, ctx: RouteCtx) {
  try {
    const id = await getParamId(ctx);

    const q = await prisma.quote.findUnique({
      where: { id },
      include: { charges: { orderBy: { createdAt: "asc" } } },
    });

    if (!q) return new NextResponse(`Quote not found: ${id}`, { status: 404 });

    const pdf = await buildPdfBuffer((doc) => {
      const pageW = doc.page.width;
      const pageH = doc.page.height;
      const x = doc.page.margins.left;
      const yTop = doc.page.margins.top;
      const w = pageW - doc.page.margins.left - doc.page.margins.right;
      const maxY = pageH - doc.page.margins.bottom;

      const logoPath = path.join(process.cwd(), "public", "indo-logo.jpeg");
      const watermarkPath = path.join(process.cwd(), "public", "water.png");
      const paperPath = path.join(process.cwd(), "public", "paper-bg.png");

      // Background
      doc.save();
      doc.fillColor("#FFFEFB").rect(0, 0, pageW, pageH).fill();
      doc.restore();

      if (exists(paperPath)) {
        doc.save();
        // @ts-ignore
        doc.opacity(0.12);
        doc.image(paperPath, 0, 0, { width: pageW, height: pageH });
        doc.restore();
      }

      if (exists(watermarkPath)) {
        doc.save();
        // @ts-ignore
        doc.opacity(0.06);
        doc.rotate(-12, { origin: [pageW / 2, pageH / 2] });
        const wmW = pageW * 0.78;
        const wmX = (pageW - wmW) / 2;
        const wmY = pageH * 0.22;
        doc.image(watermarkPath, wmX, wmY, { width: wmW });
        doc.restore();
      }

      const dense = (q.charges?.length || 0) > 10;
      const titleSize = dense ? 16 : 18;
      const bodyFont = dense ? 9.5 : 10;

      // Header
      let y = yTop;
      const logoW = 60;
      const headerH = 56;

      if (exists(logoPath)) {
        doc.image(logoPath, x, y, { width: logoW });
      } else {
        doc.font("Helvetica-Bold").fontSize(14).fillColor("#111827").text("COMPANY", x, y + 8);
      }

      doc.font("Helvetica-Bold")
        .fontSize(titleSize)
        .fillColor("#111827")
        .text("SHIPPING QUOTATION", x, y + 8, { width: w, align: "center" });

      y += headerH;
      doc.save();
      doc.strokeColor("#E5E7EB").lineWidth(1);
      doc.moveTo(x, y).lineTo(x + w, y).stroke();
      doc.restore();
      y += 14;

      // Meta grid
      const colGap = 16;
      const colW = (w - colGap) / 2;
      const leftX = x;
      const rightX = x + colW + colGap;

      kv(doc, "Date", fmtDate(q.quoteDate), leftX, y, colW);
      kv(doc, "Validity", q.validityDays ? `${q.validityDays} Days` : "-", rightX, y, colW);
      y += 34;

      kv(doc, "Quote Reference", q.id, leftX, y, colW);
      kv(doc, "Status", String(q.status || "-"), rightX, y, colW);
      y += 44;

      // 1. Client info
      y = sectionBar(doc, "1. Client & General Information", x, y, w);

      const box1H = 78;
      doc.save();
      doc.strokeColor("#E5E7EB").rect(x, y, w, box1H).stroke();
      doc.strokeColor("#E5E7EB").moveTo(x + w / 2, y).lineTo(x + w / 2, y + box1H).stroke();
      doc.restore();

      kv(doc, "Customer Name", q.customerName || "-", x + 12, y + 10, w / 2 - 18);
      kv(
        doc,
        "Email / Contact",
        [q.contactPerson, q.email, q.phone].filter(Boolean).join(" | ") || "-",
        x + w / 2 + 12,
        y + 10,
        w / 2 - 18
      );

      kv(
        doc,
        "Origin",
        `${q.originCity}, ${q.originCountry}${q.originPortCode ? ` (${q.originPortCode})` : ""}`.trim(),
        x + 12,
        y + 42,
        w / 2 - 18
      );
      kv(
        doc,
        "Destination",
        `${q.destCity}, ${q.destCountry}${q.destPortCode ? ` (${q.destPortCode})` : ""}`.trim(),
        x + w / 2 + 12,
        y + 42,
        w / 2 - 18
      );

      y += box1H + 14;

      // 2. Cargo details
      y = sectionBar(doc, "2. Cargo Details", x, y, w);

      const box2H = 86;
      doc.save();
      doc.strokeColor("#E5E7EB").rect(x, y, w, box2H).stroke();
      doc.strokeColor("#E5E7EB").moveTo(x + w / 2, y).lineTo(x + w / 2, y + box2H).stroke();
      doc.restore();

      doc.font("Helvetica").fontSize(bodyFont).fillColor("#111827");

      const leftLines = [
        `Commodity: ${q.commodity || "-"}`,
        `Mode: ${q.mode || "-"}`,
        `Incoterm: ${q.incotermCode || "-"}`,
        `Container: ${q.containerTypeCode || "-"}${q.containersCount ? ` | ${q.containersCount}` : ""}`,
      ];

      const rightLines = [
        `Weight: ${fmtNumber(Number(q.totalWeightKg || 0), 2)} Kg`,
        `Volume: ${fmtNumber(Number(q.totalVolumeCbm || 0), 2)} CBM`,
        `Packages: ${q.packagesCount ?? 0}`,
        `Temperature: ${q.temperatureRange || "-"}`,
      ];

      let ly = y + 10;
      for (const line of leftLines) {
        doc.text(`- ${line}`, x + 12, ly, { width: w / 2 - 18 });
        ly += 18;
      }

      let ry = y + 10;
      for (const line of rightLines) {
        doc.text(`- ${line}`, x + w / 2 + 12, ry, { width: w / 2 - 18 });
        ry += 18;
      }

      y += box2H + 14;

      // 3. Cost breakdown
      y = sectionBar(doc, "3. Cost Breakdown (Estimated)", x, y, w);

      const currency = q.currencyCode || "INR";

      const totalsH = 62;
      const notesTitleH = 26;
      const notesH = 64;
      const signatureH = 40;
      const reserved = totalsH + notesTitleH + notesH + signatureH + 10;

      const rowH = 18;
      const headerH2 = 22;
      const availableForTable = Math.max(80, maxY - y - reserved);

      const maxRows = Math.max(2, Math.floor((availableForTable - headerH2 - 10) / rowH));
      const charges = q.charges || [];

      let displayRows = charges.length;
      let hidden = 0;

      if (charges.length > maxRows) {
        displayRows = Math.max(1, maxRows - 1);
        hidden = charges.length - displayRows;
      }

      // Table column widths (fix wrapping)
      const qtyW = 52;
      const rateW = 118;
      const amtW = 132;
      const padding = 10;

      const descW = w - (qtyW + rateW + amtW) - padding * 2;

      const colDescX = x + padding;
      const colQtyX = colDescX + descW;
      const colRateX = colQtyX + qtyW;
      const colAmtX = colRateX + rateW;

      doc.save();
      doc.fillColor("#F3F4F6").rect(x, y, w, headerH2).fill();
      doc.restore();

      doc.font("Helvetica-Bold").fontSize(9).fillColor("#374151");
      doc.text("Item Description", colDescX, y + 6, { width: descW });
      doc.text("Qty", colQtyX, y + 6, { width: qtyW, align: "right" });
      doc.text(`Rate (${currency})`, colRateX, y + 6, { width: rateW, align: "right" });
      doc.text(`Amount (${currency})`, colAmtX, y + 6, { width: amtW, align: "right" });

      y += headerH2 + 6;

      doc.font("Helvetica").fontSize(bodyFont).fillColor("#111827");

      for (let i = 0; i < displayRows; i++) {
        const c = charges[i];
        const qty = Number(c.quantity ?? 1);
        const rate = Number(c.amount || 0);
        const amt = qty * rate;

        doc.text(String(c.name || "Charge"), colDescX, y, { width: descW, lineBreak: false });

        doc.text(String(qty), colQtyX, y, { width: qtyW, align: "right", lineBreak: false });

        const rateLabel =
          c.chargeType === "PER_UNIT"
            ? `${fmtNumber(rate, 2)}${c.unitLabel ? ` / ${c.unitLabel}` : ""}`
            : fmtNumber(rate, 2);

        doc.text(rateLabel, colRateX, y, { width: rateW, align: "right", lineBreak: false });
        doc.text(fmtNumber(amt, 2), colAmtX, y, { width: amtW, align: "right", lineBreak: false });

        y += rowH;

        doc.save();
        doc.strokeColor("#E5E7EB");
        doc.moveTo(x, y - 5).lineTo(x + w, y - 5).stroke();
        doc.restore();
      }

      if (hidden > 0) {
        doc.font("Helvetica-Oblique").fontSize(9).fillColor("#6B7280");
        doc.text(`... +${hidden} more charge(s) not shown (single-page mode)`, x + 10, y, { width: w - 20 });
        y += rowH;
      }

      y += 6;

      // Totals (Tax % + Included/Excluded) — no special bullet chars
      const subtotal = Number(q.subtotal || 0);

      const storedPercent = (q as any).taxPercent;
      const pct = clampPercent(storedPercent);
      const taxesIncluded = Boolean(q.taxesIncluded);

      const { taxAmount, total } = computeTax(subtotal, pct, taxesIncluded);

      const totalsY = y;
      doc.save();
      doc.fillColor("#F9FAFB").rect(x, totalsY, w, totalsH).fill();
      doc.strokeColor("#E5E7EB").rect(x, totalsY, w, totalsH).stroke();
      doc.restore();

      // Right aligned label/value columns (prevents wrapping)
      const boxW = 330;
      const boxX = x + w - boxW - 10;
      const labelW = 190;
      const valueW = boxW - labelW;

      const line1Y = totalsY + 10;
      const line2Y = totalsY + 28;
      const line3Y = totalsY + 46;

      doc.font("Helvetica").fontSize(10).fillColor("#111827");

      doc.text("Subtotal:", boxX, line1Y, { width: labelW, align: "right", lineBreak: false });
      doc.text(moneyCode(currency, subtotal), boxX + labelW, line1Y, { width: valueW, align: "right", lineBreak: false });

      const taxLabel =
        pct > 0
          ? `Tax (${taxesIncluded ? "Included" : "Excluded"}, ${pct.toFixed(2)}%):`
          : `Tax (${taxesIncluded ? "Included" : "Excluded"}):`;

      doc.text(taxLabel, boxX, line2Y, { width: labelW, align: "right", lineBreak: false });
      doc.text(moneyCode(currency, taxAmount), boxX + labelW, line2Y, { width: valueW, align: "right", lineBreak: false });

      doc.font("Helvetica-Bold").fontSize(12);
      doc.text("Total:", boxX, line3Y, { width: labelW, align: "right", lineBreak: false });
      doc.text(moneyCode(currency, total), boxX + labelW, line3Y, { width: valueW, align: "right", lineBreak: false });

      y += totalsH + 12;

      // Notes
      y = sectionBar(doc, "4. Notes", x, y, w);

      const notesBoxY = y;
      doc.save();
      doc.strokeColor("#E5E7EB").rect(x, notesBoxY, w, notesH).stroke();
      doc.restore();

      const notesParts = [
        q.notesIncluded ? `Included: ${q.notesIncluded}` : null,
        q.notesExcluded ? `Excluded: ${q.notesExcluded}` : null,
        q.disclaimer ? `Disclaimer: ${q.disclaimer}` : null,
      ].filter(Boolean) as string[];

      const notesText = notesParts.length ? notesParts.join("\n") : "—";

      doc.font("Helvetica").fontSize(9.5).fillColor("#111827");
      const clamped = clampTextToHeight(doc, notesText, w - 24, notesH - 16);
      doc.text(clamped, x + 12, notesBoxY + 10, { width: w - 24 });

      y = notesBoxY + notesH + 10;

      // Signature
      const sigY = Math.min(y + 6, maxY - signatureH);
      doc.font("Helvetica").fontSize(10).fillColor("#111827");
      doc.text("Authorized Signature", x, sigY + 6);

      doc.save();
      doc.strokeColor("#9CA3AF");
      doc.moveTo(x, sigY + 26).lineTo(x + 240, sigY + 26).stroke();
      doc.restore();
    });

    const url = new URL(req.url);
    const download = url.searchParams.get("download") === "1";

    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${q.id}.pdf"`,
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (e: any) {
    console.error("GET /api/quotes/[id]/pdf failed:", e);
    return new NextResponse(e?.message || "PDF generation failed", { status: 500 });
  }
}
