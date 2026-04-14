import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { bookings, schedules, classes } from "@/db/schema";
import { eq, and, count } from "drizzle-orm";
import { BOOKING_STATUS } from "@/lib/constants";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const scheduleId = searchParams.get("scheduleId");

  const query = db
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
      ? await query.where(and(...conditions))
      : await query;

  return NextResponse.json(results);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { scheduleId, date, userName, userEmail, userPhone } = body;

  if (!scheduleId || !date || !userName || !userEmail) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const [schedule] = await db
    .select({ classId: schedules.classId })
    .from(schedules)
    .where(eq(schedules.id, scheduleId));

  if (!schedule) {
    return NextResponse.json({ error: "Schedule not found" }, { status: 404 });
  }

  // Parallel: capacity check, duplicate check, class info
  const [[classInfo], [bookingCount], [existing]] = await Promise.all([
    db.select({ maxCapacity: classes.maxCapacity }).from(classes).where(eq(classes.id, schedule.classId)),
    db.select({ count: count() }).from(bookings).where(
      and(eq(bookings.scheduleId, scheduleId), eq(bookings.date, date), eq(bookings.status, BOOKING_STATUS.CONFIRMED))
    ),
    db.select({ id: bookings.id }).from(bookings).where(
      and(eq(bookings.scheduleId, scheduleId), eq(bookings.date, date), eq(bookings.userEmail, userEmail), eq(bookings.status, BOOKING_STATUS.CONFIRMED))
    ),
  ]);

  if (classInfo && bookingCount && bookingCount.count >= classInfo.maxCapacity) {
    return NextResponse.json({ error: "Class is full" }, { status: 409 });
  }

  if (existing) {
    return NextResponse.json({ error: "You already have a booking" }, { status: 409 });
  }

  await db.insert(bookings).values({
    scheduleId,
    date,
    userName,
    userEmail,
    userPhone: userPhone || null,
    status: BOOKING_STATUS.CONFIRMED,
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json({ success: true }, { status: 201 });
}
