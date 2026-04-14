import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { instructors } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const result = await db.select().from(instructors);
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { name, email, phone } = await req.json();
  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  await db.insert(instructors).values({
    name,
    email: email || null,
    phone: phone || null,
  });

  return NextResponse.json({ success: true }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

  await db.delete(instructors).where(eq(instructors.id, Number(id)));
  return NextResponse.json({ success: true });
}
