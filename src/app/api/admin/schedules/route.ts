import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { schedules, classes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const result = await db
    .select({
      id: schedules.id,
      classId: schedules.classId,
      dayOfWeek: schedules.dayOfWeek,
      startTime: schedules.startTime,
      instructor: schedules.instructor,
      className: classes.name,
    })
    .from(schedules)
    .innerJoin(classes, eq(schedules.classId, classes.id));

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { classId, dayOfWeek, startTime, instructor } = await req.json();
  if (!classId || !dayOfWeek || !startTime) {
    return NextResponse.json({ error: "Clase, día y hora son obligatorios" }, { status: 400 });
  }

  await db.insert(schedules).values({
    classId, dayOfWeek, startTime, instructor: instructor || null,
  });

  return NextResponse.json({ success: true }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID es obligatorio" }, { status: 400 });

  await db.delete(schedules).where(eq(schedules.id, Number(id)));
  return NextResponse.json({ success: true });
}
