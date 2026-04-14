import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { schedules, classes, bookings } from "@/db/schema";
import { eq, and, count, inArray } from "drizzle-orm";
import { BOOKING_STATUS } from "@/lib/constants";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dayOfWeek = searchParams.get("dayOfWeek");
  const date = searchParams.get("date");

  const query = db
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
    ? await query.where(eq(schedules.dayOfWeek, Number(dayOfWeek)))
    : await query;

  if (date && results.length > 0) {
    // Single grouped query instead of N+1
    const scheduleIds = results.map((s) => s.id);
    const counts = await db
      .select({
        scheduleId: bookings.scheduleId,
        count: count(),
      })
      .from(bookings)
      .where(
        and(
          inArray(bookings.scheduleId, scheduleIds),
          eq(bookings.date, date),
          eq(bookings.status, BOOKING_STATUS.CONFIRMED)
        )
      )
      .groupBy(bookings.scheduleId);

    const countMap = new Map(counts.map((c) => [c.scheduleId, c.count]));

    const withCounts = results.map((schedule) => {
      const currentBookings = countMap.get(schedule.id) ?? 0;
      return {
        ...schedule,
        currentBookings,
        spotsLeft: schedule.maxCapacity - currentBookings,
      };
    });

    return NextResponse.json(withCounts);
  }

  return NextResponse.json(results);
}
