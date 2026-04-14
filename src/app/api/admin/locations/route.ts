import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { locations } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const result = await db.select().from(locations);
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { name, url } = await req.json();
  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  await db.insert(locations).values({ name, url: url || null });
  return NextResponse.json({ success: true }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

  await db.delete(locations).where(eq(locations.id, Number(id)));
  return NextResponse.json({ success: true });
}
