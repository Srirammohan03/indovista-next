import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export function proxy(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const pathname = req.nextUrl.pathname;

  const isDashboard = pathname.startsWith("/dashboard");

  // No token → redirect to login
  if (!token && isDashboard) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

      // Role-protected route
      if (pathname.startsWith("/dashboard/settings")) {
        if (!["SUPER_ADMIN", "ADMIN"].includes(decoded.role)) {
          return NextResponse.redirect(new URL("/dashboard", req.url));
        }
      }
    } catch (err) {
      // Invalid token → force login
      if (isDashboard) {
        return NextResponse.redirect(new URL("/login", req.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
