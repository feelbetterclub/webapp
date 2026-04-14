import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { locations } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";

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

    // Use raw SQL to avoid Drizzle sending explicit null for autoincrement id
    await db.run(sql`INSERT INTO locations (name, url) VALUES (${name}, ${url || null})`);
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
