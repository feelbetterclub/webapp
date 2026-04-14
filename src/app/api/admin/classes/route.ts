import { NextRequest, NextResponse } from "next/server";
import { client } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { DEFAULTS } from "@/lib/constants";

export async function GET() {
  try {
    const denied = await requireAdmin();
    if (denied) return denied;

    const result = await client.execute("SELECT * FROM classes ORDER BY name");
    return NextResponse.json(result.rows);
  } catch (err) {
    return NextResponse.json({ error: "Internal error", detail: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const denied = await requireAdmin();
    if (denied) return denied;

    const { name, description, durationMinutes, maxCapacity, icon, location, locationUrl } = await req.json();
    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    await client.execute({
      sql: "INSERT INTO classes (name, description, duration_minutes, max_capacity, icon, location, location_url) VALUES (?, ?, ?, ?, ?, ?, ?)",
      args: [
        name,
        description || null,
        durationMinutes || DEFAULTS.durationMinutes,
        maxCapacity || DEFAULTS.maxCapacity,
        icon || DEFAULTS.icon,
        location || null,
        locationUrl || null,
      ],
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Internal error", detail: String(err) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const denied = await requireAdmin();
    if (denied) return denied;

    const { id, name, description, durationMinutes, maxCapacity, icon, location, locationUrl } = await req.json();
    if (!id || !name) return NextResponse.json({ error: "ID and name are required" }, { status: 400 });

    await client.execute({
      sql: "UPDATE classes SET name=?, description=?, duration_minutes=?, max_capacity=?, icon=?, location=?, location_url=? WHERE id=?",
      args: [
        name,
        description || null,
        durationMinutes || DEFAULTS.durationMinutes,
        maxCapacity || DEFAULTS.maxCapacity,
        icon || DEFAULTS.icon,
        location || null,
        locationUrl || null,
        id,
      ],
    });

    return NextResponse.json({ success: true });
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

    await client.execute({ sql: "DELETE FROM classes WHERE id = ?", args: [Number(id)] });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Internal error", detail: String(err) }, { status: 500 });
  }
}
