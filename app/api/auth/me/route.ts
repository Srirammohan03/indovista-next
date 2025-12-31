//app\api\auth\me\route.ts
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  if (!token) return NextResponse.json({ user: null }, { status: 401 });

  try {
    if (!process.env.JWT_SECRET) {
      return NextResponse.json({ user: null, message: "JWT_SECRET not set" }, { status: 500 });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET) as any;

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, loginId: true, email: true, role: true, name: true },
    });

    return NextResponse.json({ user: user ?? null });
  } catch {
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
