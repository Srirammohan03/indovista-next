// app/api/login/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createToken } from "@/lib/jwt";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const identifier = String(body?.loginId || body?.email || body?.identifier || "").trim();
    const password = String(body?.password || "");

    if (!identifier || !password) {
      return NextResponse.json({ message: "Missing loginId/email or password" }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ loginId: identifier }, { email: identifier }],
      },
    });

    if (!user) {
      return NextResponse.json({ message: "Invalid login credentials" }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ message: "Invalid login credentials" }, { status: 401 });
    }

    const token = createToken({
      id: user.id,
      loginId: user.loginId,
      role: user.role,
    });

    const response = NextResponse.json({
      message: "Login Success",
      user: { id: user.id, name: user.name, role: user.role, loginId: user.loginId, email: user.email },
    });

    // ✅ IMPORTANT: secure must be false in dev/localhost or cookie won't set
    response.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
