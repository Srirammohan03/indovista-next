import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type StorageType = "AMBIENT" | "CHILLED" | "FROZEN";

function normalizeStorageType(value: any): StorageType {
  if (value === "CHILLED") return "CHILLED";
  if (value === "FROZEN") return "FROZEN";
  return "AMBIENT";
}

// ✅ Next 15+ may provide params as a Promise in some builds.
// This works for BOTH cases: params object OR Promise(params).
type RouteContext = {
  params: { id: string } | Promise<{ id: string }>;
};

export async function PUT(req: Request, context: RouteContext) {
  const { id } = await Promise.resolve(context.params);

  try {
    const body = await req.json().catch(() => ({}));

    if (!id) {
      return NextResponse.json({ message: "Missing category id" }, { status: 400 });
    }
    if (!body?.name || typeof body.name !== "string") {
      return NextResponse.json({ message: "Category name is required" }, { status: 400 });
    }

    const updated = await prisma.category.update({
      where: { id },
      data: {
        name: body.name,
        hsCode: body.hsCode || null,
        temperature: body.temperature || null,
        storageType: normalizeStorageType(body.storageType),
        documents: body.documents || null,
        notes: body.notes || null,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("[PUT /api/categories/:id] Error:", error);

    // Prisma "Record not found"
    if (error?.code === "P2025") {
      return NextResponse.json({ message: "Category not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  const { id } = await Promise.resolve(context.params);

  try {
    if (!id) {
      return NextResponse.json({ message: "Missing category id" }, { status: 400 });
    }

    await prisma.category.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[DELETE /api/categories/:id] Error:", error);

    if (error?.code === "P2025") {
      return NextResponse.json({ message: "Category not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Failed to delete category" }, { status: 500 });
  }
}
