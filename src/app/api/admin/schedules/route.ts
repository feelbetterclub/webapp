import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { schedules, classes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifySession } from "@/lib/auth";

export async function GET() {
  const isAdmin = await verifySession();
  if (!isAdmin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const result = db
    .select({
      id: schedules.id,
      classId: schedules.classId,
      dayOfWeek: schedules.dayOfWeek,
      startTime: schedules.startTime,
      instructor: schedules.instructor,
      className: classes.name,
    })
    .from(schedules)
    .innerJoin(classes, eq(schedules.classId, classes.id))
    .all();

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const isAdmin = await verifySession();
  if (!isAdmin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const { classId, dayOfWeek, startTime, instructor } = body;

  if (!classId || !dayOfWeek || !startTime) {
    return NextResponse.json(
      { error: "Clase, día y hora son obligatorios" },
      { status: 400 }
    );
  }

  const result = db
    .insert(schedules)
    .values({
      classId,
      dayOfWeek,
      startTime,
      instructor: instructor || null,
    })
    .run();

  return NextResponse.json(
    { success: true, id: result.lastInsertRowid },
    { status: 201 }
  );
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

  db.delete(schedules).where(eq(schedules.id, Number(id))).run();
  return NextResponse.json({ success: true });
}
