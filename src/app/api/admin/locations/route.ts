import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@libsql/client";
import { requireAdmin } from "@/lib/auth";

function getClient() {
  return createClient({
    url: process.env.TURSO_DATABASE_URL || "file:feel-better.db",
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
}

async function ensureTable(client: ReturnType<typeof getClient>) {
  await client.execute(
    "CREATE TABLE IF NOT EXISTS locations (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, url TEXT)"
  );
}

export async function GET() {
  try {
    const denied = await requireAdmin();
    if (denied) return denied;

    const client = getClient();
    await ensureTable(client);
    const result = await client.execute("SELECT * FROM locations ORDER BY name");
    return NextResponse.json(result.rows);
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
    await ensureTable(client);
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

    const client = getClient();
    await client.execute({ sql: "DELETE FROM locations WHERE id = ?", args: [Number(id)] });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Internal error", detail: String(err) }, { status: 500 });
  }
}
