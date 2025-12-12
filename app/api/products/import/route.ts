import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function pick(row: any, keys: string[]) {
  for (const k of keys) {
    if (row[k] !== undefined && row[k] !== null && String(row[k]).trim() !== "") return row[k];
  }
  return undefined;
}

function normalizeType(value: any): "FROZEN" | "SPICE" {
  const v = String(value || "").toUpperCase();
  return v === "SPICE" ? "SPICE" : "FROZEN";
}

async function getNextProductIdCounter() {
  const last = await prisma.product.findFirst({
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });
  if (!last) return 1;
  const m = last.id.match(/PROD-(\d+)/);
  return m ? parseInt(m[1], 10) + 1 : 1;
}

export async function POST(req: Request) {
  try {
    const fd = await req.formData();
    const file = fd.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ message: "file is required (multipart/form-data, key: file)" }, { status: 400 });
    }

    const ab = await file.arrayBuffer();
    const wb = XLSX.read(ab, { type: "array" });
    const sheetName = wb.SheetNames[0];
    if (!sheetName) return NextResponse.json({ message: "No sheet found in Excel file" }, { status: 400 });

    const ws = wb.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(ws, { defval: "" }) as any[];

    const categories = await prisma.category.findMany({ select: { id: true, name: true } });
    const catById = new Map(categories.map((c) => [c.id, c]));
    const catByName = new Map(categories.map((c) => [c.name.toLowerCase(), c]));

    let created = 0;
    let updated = 0;
    const errors: { row: number; message: string }[] = [];

    let counter = await getNextProductIdCounter();

    await prisma.$transaction(async (tx) => {
      for (let i = 0; i < rows.length; i++) {
        const r = rows[i];
        const rowNum = i + 2; // assuming header row is 1

        const name = pick(r, ["Name", "name"]);
        if (!name) {
          errors.push({ row: rowNum, message: "Missing Name" });
          continue;
        }

        const rawType = pick(r, ["Type", "type"]);
        const type = normalizeType(rawType);

        const categoryIdValue = pick(r, ["Category ID", "CategoryId", "categoryId"]);
        const categoryNameValue = pick(r, ["Category Name", "Category", "category"]);

        let categoryId: string | undefined;

        if (categoryIdValue) {
          const cid = String(categoryIdValue).trim();
          if (catById.has(cid)) categoryId = cid;
        }
        if (!categoryId && categoryNameValue) {
          const cn = String(categoryNameValue).trim().toLowerCase();
          const c = catByName.get(cn);
          if (c) categoryId = c.id;
        }

        if (!categoryId) {
          errors.push({ row: rowNum, message: "Invalid Category (use Category ID or Category Name that exists)" });
          continue;
        }

        const incomingId = pick(r, ["ID", "Id", "id"]);
        const id = incomingId ? String(incomingId).trim() : "";

        const data = {
          name: String(name).trim(),
          type,
          categoryId,

          hsCode: pick(r, ["HS Code", "HSCode", "hsCode"]) ? String(pick(r, ["HS Code", "HSCode", "hsCode"])).trim() : null,
          temperature: pick(r, ["Temperature", "temperature"]) ? String(pick(r, ["Temperature", "temperature"])).trim() : null,
          packSize: pick(r, ["Pack Size", "PackSize", "packSize"]) ? String(pick(r, ["Pack Size", "PackSize", "packSize"])).trim() : null,
          shelfLife: pick(r, ["Shelf Life", "ShelfLife", "shelfLife"]) ? String(pick(r, ["Shelf Life", "ShelfLife", "shelfLife"])).trim() : null,

          unitsPerCarton: pick(r, ["Units Per Carton", "unitsPerCarton"]) !== undefined && String(pick(r, ["Units Per Carton", "unitsPerCarton"])).trim() !== ""
            ? Number(pick(r, ["Units Per Carton", "unitsPerCarton"]))
            : null,

          cartonsPerPallet: pick(r, ["Cartons Per Pallet", "cartonsPerPallet"]) !== undefined && String(pick(r, ["Cartons Per Pallet", "cartonsPerPallet"])).trim() !== ""
            ? Number(pick(r, ["Cartons Per Pallet", "cartonsPerPallet"]))
            : null,

          notes: pick(r, ["Notes", "notes"]) ? String(pick(r, ["Notes", "notes"])).trim() : null,
        };

        if (id) {
          const exists = await tx.product.findUnique({ where: { id }, select: { id: true } });
          if (exists) {
            await tx.product.update({ where: { id }, data });
            updated++;
            continue;
          }
        }

        const newId = `PROD-${String(counter).padStart(3, "0")}`;
        counter++;

        await tx.product.create({
          data: { id: newId, ...data },
        });
        created++;
      }
    });

    return NextResponse.json({ success: true, created, updated, errors });
  } catch (error) {
    console.error("[POST /api/products/import] Error:", error);
    return NextResponse.json({ message: "Failed to import products" }, { status: 500 });
  }
}
