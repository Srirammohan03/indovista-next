import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Role = "SUPER_ADMIN" | "ADMIN" | "OPERATOR" | "FINANCE" | "DOCUMENTOR";

function normalizeRole(v: any): Role {
  const x = String(v || "").toUpperCase();
  if (x === "SUPER_ADMIN") return "SUPER_ADMIN";
  if (x === "ADMIN") return "ADMIN";
  if (x === "FINANCE") return "FINANCE";
  if (x === "DOCUMENTOR") return "DOCUMENTOR";
  return "OPERATOR";
}

// ✅ Next 15 compatible params handling
async function getIdFromContext(ctx: any): Promise<number | null> {
  const params = await Promise.resolve(ctx?.params);
  const raw = params?.id;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

export async function GET(_: Request, ctx: any) {
  try {
    const id = await getIdFromContext(ctx);
    if (!id) return NextResponse.json({ message: "Invalid user id" }, { status: 400 });

    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, loginId: true, name: true, email: true, role: true, createdAt: true },
    });

    if (!user) return NextResponse.json({ message: "Not found" }, { status: 404 });

    return NextResponse.json({ ...user, createdAt: user.createdAt.toISOString() });
  } catch (e: any) {
    return NextResponse.json({ message: e?.message || "Failed to fetch user" }, { status: 500 });
  }
}

export async function PUT(req: Request, ctx: any) {
  try {
    const id = await getIdFromContext(ctx);
    if (!id) return NextResponse.json({ message: "Invalid user id" }, { status: 400 });

    const body = await req.json().catch(() => ({}));

    const loginId = String(body?.loginId || "").trim();
    const name = String(body?.name || "").trim();

    if (!loginId) return NextResponse.json({ message: "loginId is required" }, { status: 400 });
    if (!name) return NextResponse.json({ message: "name is required" }, { status: 400 });

    const role = normalizeRole(body.role);
    const email = body.email ? String(body.email).trim() : null;

    const data: any = { loginId, name, email, role };

    // Optional password reset
    if (body.password && String(body.password).length > 0) {
      data.password = await bcrypt.hash(String(body.password), 10);
    }

    const updated = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, loginId: true, name: true, email: true, role: true, createdAt: true },
    });

    return NextResponse.json({ ...updated, createdAt: updated.createdAt.toISOString() });
  } catch (e: any) {
    if (e?.code === "P2025") return NextResponse.json({ message: "User not found" }, { status: 404 });
    if (e?.code === "P2002") return NextResponse.json({ message: "loginId already exists" }, { status: 409 });
    return NextResponse.json({ message: e?.message || "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(_: Request, ctx: any) {
  try {
    const id = await getIdFromContext(ctx);
    if (!id) return NextResponse.json({ message: "Invalid user id" }, { status: 400 });

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    if (e?.code === "P2025") return NextResponse.json({ message: "User not found" }, { status: 404 });
    return NextResponse.json({ message: e?.message || "Failed to delete user" }, { status: 500 });
  }
}
