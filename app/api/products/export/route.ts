import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: { category: { select: { id: true, name: true } } },
      orderBy: { createdAt: "asc" },
    });

    const rows = products.map((p) => ({
      ID: p.id,
      Name: p.name,
      "Category ID": p.categoryId,
      "Category Name": p.category?.name || "",
      Type: p.type,
      "HS Code": p.hsCode || "",
      Temperature: p.temperature || "",
      "Pack Size": p.packSize || "",
      "Shelf Life": p.shelfLife || "",
      "Units Per Carton": p.unitsPerCarton ?? "",
      "Cartons Per Pallet": p.cartonsPerPallet ?? "",
      Notes: p.notes || "",
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Products");

    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="products.xlsx"',
      },
    });
  } catch (error) {
    console.error("[GET /api/products/export] Error:", error);
    return NextResponse.json({ message: "Failed to export products" }, { status: 500 });
  }
}
