import { NextRequest, NextResponse } from "next/server";
import { client } from "@/db";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const result = await client.execute("SELECT key, value FROM settings");
    const settings: Record<string, string> = {};
    for (const row of result.rows) {
      settings[row.key as string] = row.value as string;
    }
    return NextResponse.json(settings);
  } catch {
    return NextResponse.json({});
  }
}

export async function PUT(req: NextRequest) {
  try {
    const denied = await requireAdmin();
    if (denied) return denied;
    const { key, value } = await req.json();
    if (!key) return NextResponse.json({ error: "key required" }, { status: 400 });
    await client.execute({
      sql: "INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)",
      args: [key, String(value)],
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
