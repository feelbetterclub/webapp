import { NextRequest, NextResponse } from "next/server";
import { client } from "@/db";
import { rawInsert } from "@/db/helpers";
import { requireAdmin } from "@/lib/auth";
import { DEFAULTS } from "@/lib/constants";

export async function GET() {
  try {
    const denied = await requireAdmin();
    if (denied) return denied;
    const result = await client.execute("SELECT * FROM classes ORDER BY name");
    return NextResponse.json(result.rows);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const denied = await requireAdmin();
    if (denied) return denied;
    const { name, description, durationMinutes, maxCapacity, queueCapacity, icon, location, locationUrl } = await req.json();
    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });
    await rawInsert("classes", {
      name,
      description: description || null,
      duration_minutes: durationMinutes || DEFAULTS.durationMinutes,
      max_capacity: maxCapacity || DEFAULTS.maxCapacity,
      queue_capacity: queueCapacity ?? DEFAULTS.queueCapacity,
      icon: icon || DEFAULTS.icon,
      location: location || null,
      location_url: locationUrl || null,
    });
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const denied = await requireAdmin();
    if (denied) return denied;
    const { id, name, description, durationMinutes, maxCapacity, queueCapacity, icon, location, locationUrl } = await req.json();
    if (!id || !name) return NextResponse.json({ error: "ID and name required" }, { status: 400 });
    await client.execute({
      sql: "UPDATE classes SET name=?, description=?, duration_minutes=?, max_capacity=?, queue_capacity=?, icon=?, location=?, location_url=? WHERE id=?",
      args: [name, description || null, durationMinutes || DEFAULTS.durationMinutes, maxCapacity || DEFAULTS.maxCapacity, queueCapacity ?? DEFAULTS.queueCapacity, icon || DEFAULTS.icon, location || null, locationUrl || null, id],
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
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
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
