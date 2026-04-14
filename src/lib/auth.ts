import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const SECRET = new TextEncoder().encode(
  process.env.ADMIN_SECRET || "feel-better-club-secret-change-me"
);
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
export const COOKIE_NAME = "fbc-admin";

export async function createSession(): Promise<string> {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("24h")
    .setIssuedAt()
    .sign(SECRET);
}

export function checkPassword(password: string): boolean {
  return password === ADMIN_PASSWORD;
}

export async function verifySession(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return false;
    await jwtVerify(token, SECRET);
    return true;
  } catch {
    return false;
  }
}

export async function requireAdmin(): Promise<NextResponse | null> {
  const isAdmin = await verifySession();
  if (!isAdmin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  return null;
}
