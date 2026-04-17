import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";

const isProd = process.env.NODE_ENV === "production";

function getSecret(): Uint8Array {
  const raw = process.env.ADMIN_SECRET;
  if (!raw && isProd) {
    throw new Error("ADMIN_SECRET env var is required in production");
  }
  return new TextEncoder().encode(raw || "dev-only-secret-do-not-use-in-prod");
}

function getAdminPassword(): string {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw && isProd) {
    throw new Error("ADMIN_PASSWORD env var is required in production");
  }
  return pw || "dev-local-only";
}

export const SECRET = getSecret();
export const COOKIE_NAME = "fbc-admin";

export async function createSession(): Promise<string> {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("24h")
    .setIssuedAt()
    .sign(SECRET);
}

/**
 * Timing-safe password comparison to prevent timing attacks.
 */
export function checkPassword(password: string): boolean {
  const expected = getAdminPassword();
  if (password.length !== expected.length) return false;
  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  return timingSafeEqual(a, b);
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
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
