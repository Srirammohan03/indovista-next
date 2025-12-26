export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { uploadShipmentDocument } from "@/lib/uploadShipmentDocument";

export async function POST(req: Request) {
  try {
    console.log("VERCEL:", process.env.VERCEL, "VERCEL_ENV:", process.env.VERCEL_ENV);
    console.log("HAS_BLOB_TOKEN:", Boolean(process.env.BLOB_READ_WRITE_TOKEN));

    const form = await req.formData();
    const shipmentId = String(form.get("shipmentId") || "");
    const file = form.get("file") as File | null;

    if (!shipmentId) return new NextResponse("shipmentId missing", { status: 400 });
    if (!file) return new NextResponse("file missing", { status: 400 });

    const result = await uploadShipmentDocument(shipmentId, file);
    return NextResponse.json(result);
  } catch (e: any) {
    return new NextResponse(e?.message || "Upload failed", { status: 500 });
  }
}
