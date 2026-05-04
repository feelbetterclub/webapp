import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { SECRET, COOKIE_NAME } from "@/lib/auth";

const REDIRECTS: Record<string, string> = {
  "/reservar": "/book",
  "/admin/clases": "/admin/classes",
  "/admin/alumnos": "/admin/students",
  "/admin/instructores": "/admin/instructors",
};

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Legacy Spanish URL redirects
  const redirect = REDIRECTS[pathname];
  if (redirect) {
    const url = req.nextUrl.clone();
    url.pathname = redirect;
    return NextResponse.redirect(url, 308);
  }

  if (pathname === "/admin/login" || pathname === "/api/admin/login") {
    return NextResponse.next();
  }

  const token = req.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  try {
    await jwtVerify(token, SECRET);
    return NextResponse.next();
  } catch {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Sesión expirada" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/admin/:path*", "/reservar"],
};
