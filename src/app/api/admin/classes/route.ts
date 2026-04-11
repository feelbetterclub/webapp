import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { classes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifySession } from "@/lib/auth";

export async function GET() {
  const isAdmin = await verifySession();
  if (!isAdmin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const result = db.select().from(classes).all();
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const isAdmin = await verifySession();
  if (!isAdmin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const { name, description, durationMinutes, maxCapacity, icon } = body;

  if (!name) {
    return NextResponse.json({ error: "Nombre es obligatorio" }, { status: 400 });
  }

  const result = db
    .insert(classes)
    .values({
      name,
      description: description || null,
      durationMinutes: durationMinutes || 60,
      maxCapacity: maxCapacity || 15,
      icon: icon || "Sun",
    })
    .run();

  return NextResponse.json(
    { success: true, id: result.lastInsertRowid },
    { status: 201 }
  );
}

export async function PUT(req: NextRequest) {
  const isAdmin = await verifySession();
  if (!isAdmin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const { id, name, description, durationMinutes, maxCapacity, icon } = body;

  if (!id || !name) {
    return NextResponse.json({ error: "ID y nombre son obligatorios" }, { status: 400 });
  }

  db.update(classes)
    .set({
      name,
      description: description || null,
      durationMinutes: durationMinutes || 60,
      maxCapacity: maxCapacity || 15,
      icon: icon || "Sun",
    })
    .where(eq(classes.id, id))
    .run();

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const isAdmin = await verifySession();
  if (!isAdmin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID es obligatorio" }, { status: 400 });
  }

  db.delete(classes).where(eq(classes.id, Number(id))).run();
  return NextResponse.json({ success: true });
}
