import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const clean = (v: any) => String(v ?? "").trim();
const upper = (v: any, fallback: string) => clean(v || fallback).toUpperCase();

const noStoreHeaders = { "Cache-Control": "no-store, max-age=0" };

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const shipmentId = clean(body.shipmentId);
    const invoiceId = body.invoiceId ? clean(body.invoiceId) : null;

    const amount = Number(body.amount);
    const method = upper(body.method, "UPI");
    const status = upper(body.status, "PENDING");

    if (!shipmentId) {
      return NextResponse.json({ message: "shipmentId is required" }, { status: 400 });
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ message: "amount must be > 0" }, { status: 400 });
    }

    // ensure shipment exists + grab default currency
    const shipment = await prisma.shipment.findUnique({
      where: { id: shipmentId },
      select: {
        id: true,
        currency: { select: { currencyCode: true } },
        customer: { select: { currency: true } },
      },
    });
    if (!shipment) {
      return NextResponse.json({ message: "Invalid shipmentId" }, { status: 400 });
    }

    // if invoiceId is provided, validate it belongs to this shipment
    let invoiceCurrency: string | null = null;
    if (invoiceId) {
      const inv = await prisma.shipmentInvoice.findUnique({
        where: { id: invoiceId },
        select: { id: true, shipmentId: true, currency: true },
      });
      if (!inv) return NextResponse.json({ message: "Invalid invoiceId" }, { status: 400 });
      if (inv.shipmentId !== shipmentId) {
        return NextResponse.json({ message: "invoiceId does not belong to this shipment" }, { status: 400 });
      }
      invoiceCurrency = inv.currency;
    }

    const currency =
      clean(body.currency) ||
      invoiceCurrency ||
      shipment.currency?.currencyCode ||
      (shipment.customer?.currency as any) ||
      "INR";

    const created = await prisma.payment.create({
      data: {
        shipmentId,
        // ✅ key point: pass null ONLY if DB column is nullable (after migration)
        invoiceId: invoiceId ?? null,

        amount,
        currency: currency.toUpperCase(),
        method: method as any,
        transactionNum: clean(body.transactionNum) ? clean(body.transactionNum) : null,
        date: body.date ? new Date(body.date) : new Date(),
        notes: clean(body.notes) ? clean(body.notes) : null,
        status: status as any,
      },
      select: { id: true },
    });

    return NextResponse.json(created, { headers: noStoreHeaders });
  } catch (e: any) {
    console.error("POST /api/payments failed:", e);
    return NextResponse.json({ message: e?.message || "Payment create failed" }, { status: 500 });
  }
}
