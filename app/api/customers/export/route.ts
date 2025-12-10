// app/api/customers/export/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest) {
  try {
    // For now we only have Customer in the schema.
    // When you add Shipment, we can add `include: { shipments: true }` here.
    const customers = await prisma.customer.findMany({
      orderBy: { createdAt: "desc" },
    });

    const res = NextResponse.json(customers);

    // Make it behave like a file download
    res.headers.set(
      "Content-Disposition",
      'attachment; filename="customers-export.json"'
    );
    res.headers.set("Content-Type", "application/json; charset=utf-8");

    return res;
  } catch (error) {
    console.error("[GET /api/customers/export] Error:", error);
    return NextResponse.json(
      { message: "Server error while exporting customers" },
      { status: 500 }
    );
  }
}
