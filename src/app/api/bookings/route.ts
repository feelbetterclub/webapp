import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { bookings, schedules, classes } from "@/db/schema";
import { eq, and, count } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const scheduleId = searchParams.get("scheduleId");

  let query = db
    .select({
      id: bookings.id,
      scheduleId: bookings.scheduleId,
      date: bookings.date,
      userName: bookings.userName,
      userEmail: bookings.userEmail,
      userPhone: bookings.userPhone,
      status: bookings.status,
      createdAt: bookings.createdAt,
      className: classes.name,
      startTime: schedules.startTime,
      dayOfWeek: schedules.dayOfWeek,
      instructor: schedules.instructor,
    })
    .from(bookings)
    .innerJoin(schedules, eq(bookings.scheduleId, schedules.id))
    .innerJoin(classes, eq(schedules.classId, classes.id));

  const conditions = [];
  if (date) conditions.push(eq(bookings.date, date));
  if (scheduleId) conditions.push(eq(bookings.scheduleId, Number(scheduleId)));

  const results =
    conditions.length > 0
      ? query.where(and(...conditions)).all()
      : query.all();

  return NextResponse.json(results);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { scheduleId, date, userName, userEmail, userPhone } = body;

  if (!scheduleId || !date || !userName || !userEmail) {
    return NextResponse.json(
      { error: "Faltan campos obligatorios" },
      { status: 400 }
    );
  }

  // Validate email
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail)) {
    return NextResponse.json({ error: "Email inválido" }, { status: 400 });
  }

  // Check schedule exists
  const schedule = db
    .select()
    .from(schedules)
    .where(eq(schedules.id, scheduleId))
    .get();

  if (!schedule) {
    return NextResponse.json(
      { error: "Horario no encontrado" },
      { status: 404 }
    );
  }

  // Check capacity
  const classInfo = db
    .select()
    .from(classes)
    .where(eq(classes.id, schedule.classId))
    .get();

  const bookingCount = db
    .select({ count: count() })
    .from(bookings)
    .where(
      and(
        eq(bookings.scheduleId, scheduleId),
        eq(bookings.date, date),
        eq(bookings.status, "confirmed")
      )
    )
    .get();

  if (classInfo && bookingCount && bookingCount.count >= classInfo.maxCapacity) {
    return NextResponse.json(
      { error: "Clase completa para esta fecha" },
      { status: 409 }
    );
  }

  // Check duplicate
  const existing = db
    .select()
    .from(bookings)
    .where(
      and(
        eq(bookings.scheduleId, scheduleId),
        eq(bookings.date, date),
        eq(bookings.userEmail, userEmail),
        eq(bookings.status, "confirmed")
      )
    )
    .get();

  if (existing) {
    return NextResponse.json(
      { error: "Ya tienes una reserva para esta clase" },
      { status: 409 }
    );
  }

  const result = db
    .insert(bookings)
    .values({
      scheduleId,
      date,
      userName,
      userEmail,
      userPhone: userPhone || null,
      status: "confirmed",
      createdAt: new Date().toISOString(),
    })
    .run();

  return NextResponse.json(
    { success: true, id: result.lastInsertRowid },
    { status: 201 }
  );
}
