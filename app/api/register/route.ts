// app/api/register/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

type Role = "SUPER_ADMIN" | "ADMIN" | "OPERATOR" | "FINANCE" | "DOCUMENTOR";

function normalizeRole(v: any): Role {
  const x = String(v || "").toUpperCase();
  if (x === "SUPER_ADMIN") return "SUPER_ADMIN";
  if (x === "ADMIN") return "ADMIN";
  if (x === "FINANCE") return "FINANCE";
  if (x === "DOCUMENTOR") return "DOCUMENTOR";
  return "OPERATOR";
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const loginId = String(body?.loginId || "").trim();
    const password = String(body?.password || "");
    const name = String(body?.name || "").trim();
    const email = body?.email ? String(body.email).trim() : null;
    const role = normalizeRole(body?.role);

    if (!loginId || !password || !name) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { loginId } });
    if (existing) {
      return NextResponse.json({ message: "User already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { loginId, password: hashedPassword, role, name, email },
      select: { id: true, loginId: true, role: true, name: true, email: true, createdAt: true },
    });

    return NextResponse.json({ message: "User registered successfully", user }, { status: 201 });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
