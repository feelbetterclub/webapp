import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { classes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { DEFAULTS } from "@/lib/constants";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const result = await db.select().from(classes);
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { name, description, durationMinutes, maxCapacity, icon, location, locationUrl } = await req.json();
  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  await db.insert(classes).values({
    name,
    description: description || null,
    durationMinutes: durationMinutes || DEFAULTS.durationMinutes,
    maxCapacity: maxCapacity || DEFAULTS.maxCapacity,
    icon: icon || DEFAULTS.icon,
    location: location || null,
    locationUrl: locationUrl || null,
  });

  return NextResponse.json({ success: true }, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id, name, description, durationMinutes, maxCapacity, icon, location, locationUrl } = await req.json();
  if (!id || !name) return NextResponse.json({ error: "ID and name are required" }, { status: 400 });

  await db.update(classes).set({
    name,
    description: description || null,
    durationMinutes: durationMinutes || DEFAULTS.durationMinutes,
    maxCapacity: maxCapacity || DEFAULTS.maxCapacity,
    icon: icon || DEFAULTS.icon,
    location: location || null,
    locationUrl: locationUrl || null,
  }).where(eq(classes.id, id));

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

  await db.delete(classes).where(eq(classes.id, Number(id)));
  return NextResponse.json({ success: true });
}
