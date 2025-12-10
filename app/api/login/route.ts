import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createToken } from "@/lib/jwt";

export async function POST(req: Request) {
  try {
    const { loginId, password } = await req.json();

    if (!loginId || !password) {
      return NextResponse.json(
        { message: "Missing loginId or password" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { loginId },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Invalid login credentials" },
        { status: 401 }
      );
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return NextResponse.json(
        { message: "Invalid login credentials" },
        { status: 401 }
      );
    }
    const token= createToken({
      id: user.id,
      loginId: user.loginId,
      role: user.role,
    });

    const response = NextResponse.json({
      message: "Login Success",
      user: { id: user.id, name: user.name, role: user.role },
    });

    // Store token in HttpOnly cookie
    response.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24, // 7 days
    });

    return response;
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
