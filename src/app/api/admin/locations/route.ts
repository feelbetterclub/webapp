import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@libsql/client";
import { db } from "@/db";
import { locations } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";

function getClient() {
  return createClient({
    url: process.env.TURSO_DATABASE_URL || "file:feel-better.db",
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
}

export async function GET() {
  try {
    const denied = await requireAdmin();
    if (denied) return denied;

    const result = await db.select().from(locations);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: "Internal error", detail: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const denied = await requireAdmin();
    if (denied) return denied;

    const { name, url } = await req.json();
    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    const client = getClient();
    await client.execute({
      sql: "INSERT INTO locations (name, url) VALUES (?, ?)",
      args: [name, url || null],
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Internal error", detail: String(err) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const denied = await requireAdmin();
    if (denied) return denied;

    const id = new URL(req.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    await db.delete(locations).where(eq(locations.id, Number(id)));
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Internal error", detail: String(err) }, { status: 500 });
  }
}
