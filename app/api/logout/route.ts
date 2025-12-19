// app/api/logout/route.ts
import { NextResponse } from "next/server";

function clearCookie() {
  const res = NextResponse.json({ message: "Logout successful" });
  res.cookies.set({
    name: "token",
    value: "",
    path: "/",
    maxAge: 0,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  return res;
}

export async function GET() {
  return clearCookie();
}

export async function POST() {
  return clearCookie();
}
