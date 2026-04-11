import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { schedules, classes, bookings } from "@/db/schema";
import { eq, and, count } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dayOfWeek = searchParams.get("dayOfWeek");
  const date = searchParams.get("date");

  let query = db
    .select({
      id: schedules.id,
      classId: schedules.classId,
      dayOfWeek: schedules.dayOfWeek,
      startTime: schedules.startTime,
      instructor: schedules.instructor,
      className: classes.name,
      classDescription: classes.description,
      durationMinutes: classes.durationMinutes,
      maxCapacity: classes.maxCapacity,
      icon: classes.icon,
    })
    .from(schedules)
    .innerJoin(classes, eq(schedules.classId, classes.id));

  const results = dayOfWeek
    ? query.where(eq(schedules.dayOfWeek, Number(dayOfWeek))).all()
    : query.all();

  // If a date is provided, add booking counts
  if (date) {
    const withCounts = results.map((schedule) => {
      const bookingCount = db
        .select({ count: count() })
        .from(bookings)
        .where(
          and(
            eq(bookings.scheduleId, schedule.id),
            eq(bookings.date, date),
            eq(bookings.status, "confirmed")
          )
        )
        .get();

      return {
        ...schedule,
        currentBookings: bookingCount?.count ?? 0,
        spotsLeft: schedule.maxCapacity - (bookingCount?.count ?? 0),
      };
    });

    return NextResponse.json(withCounts);
  }

  return NextResponse.json(results);
}
