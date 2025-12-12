import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type StorageType = "AMBIENT" | "CHILLED" | "FROZEN";

function normalizeStorageType(value: any): StorageType {
  if (value === "CHILLED") return "CHILLED";
  if (value === "FROZEN") return "FROZEN";
  return "AMBIENT";
}

async function generateCategoryId(): Promise<string> {
  const last = await prisma.category.findFirst({
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });

  if (!last) return "CAT-001";

  const match = last.id.match(/CAT-(\d+)/);
  if (!match) return "CAT-001";

  const num = parseInt(match[1], 10) + 1;
  return `CAT-${num.toString().padStart(3, "0")}`;
}

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.error("[GET /api/categories] Error:", error);
    return NextResponse.json({ message: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    if (!body?.name || typeof body.name !== "string") {
      return NextResponse.json({ message: "Category name is required" }, { status: 400 });
    }

    const id =
      typeof body.id === "string" && body.id.trim()
        ? body.id.trim()
        : await generateCategoryId();

    const created = await prisma.category.create({
      data: {
        id,
        name: body.name,
        hsCode: body.hsCode || null,
        temperature: body.temperature || null,
        storageType: normalizeStorageType(body.storageType),
        documents: body.documents || null,
        notes: body.notes || null,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("[POST /api/categories] Error:", error);
    return NextResponse.json({ message: "Failed to create category" }, { status: 500 });
  }
}
