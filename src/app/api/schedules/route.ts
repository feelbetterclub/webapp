import { NextRequest, NextResponse } from "next/server";
import { client } from "@/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");

    if (!date) {
      return NextResponse.json({ error: "date parameter is required" }, { status: 400 });
    }

    // Get schedules for this specific date with booking counts + waitlist counts
    const result = await client.execute({
      sql: `
        SELECT
          s.id, s.class_id as classId, s.date, s.start_time as startTime, s.instructor,
          s.price,
          c.name as className, c.description as classDescription,
          c.duration_minutes as durationMinutes,
          COALESCE(s.max_capacity, c.max_capacity) as maxCapacity,
          c.icon, c.location, c.location_url as locationUrl,
          COALESCE(b.cnt, 0) as currentBookings,
          COALESCE(s.max_capacity, c.max_capacity) - COALESCE(b.cnt, 0) as spotsLeft,
          COALESCE(w.cnt, 0) as waitlistCount
        FROM schedules_v2 s
        INNER JOIN classes c ON s.class_id = c.id
        LEFT JOIN (
          SELECT schedule_id, COUNT(*) as cnt
          FROM bookings
          WHERE date = ? AND status = 'confirmed'
          GROUP BY schedule_id
        ) b ON b.schedule_id = s.id
        LEFT JOIN (
          SELECT schedule_id, COUNT(*) as cnt
          FROM waitlist
          WHERE date = ? AND status = 'waiting'
          GROUP BY schedule_id
        ) w ON w.schedule_id = s.id
        WHERE s.date = ?
        ORDER BY s.start_time
      `,
      args: [date, date, date],
    });

    const WAITLIST_MAX = 5;
    const rows = result.rows.map((r) => ({
      ...r,
      waitlistFull: (r.waitlistCount as number) >= WAITLIST_MAX,
    }));

    return NextResponse.json(rows);
  } catch (err) {
    return NextResponse.json({ error: "Internal error", detail: String(err) }, { status: 500 });
  }
}
