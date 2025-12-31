import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    // Support either: { loginId, password } or { email, password } or { identifier, password }
    const identifier =
      String(body?.identifier || body?.loginId || body?.email || "").trim();

    const password = String(body?.password || "");

    if (!identifier || !password) {
      return NextResponse.json({ message: "Missing credentials" }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ loginId: identifier }, { email: identifier }],
      },
    });

    if (!user) return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });

    if (!process.env.JWT_SECRET) {
      return NextResponse.json({ message: "JWT_SECRET not set" }, { status: 500 });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email, loginId: user.loginId },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const res = NextResponse.json({
      user: { id: user.id, loginId: user.loginId, email: user.email, role: user.role, name: user.name },
    });

    res.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hrs 
    });

    return res;
  } catch (err) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}