import { NextRequest, NextResponse } from "next/server";
import { client } from "@/db";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const denied = await requireAdmin();
    if (denied) return denied;

    const { searchParams } = new URL(req.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    if (!from || !to) {
      return NextResponse.json({ error: "from and to parameters required" }, { status: 400 });
    }

    const result = await client.execute({
      sql: `
        SELECT
          s.id, s.date, s.start_time as startTime, s.instructor,
          c.name as className, c.location, c.location_url as locationUrl,
          c.max_capacity as maxCapacity,
          COALESCE(b.cnt, 0) as bookingCount
        FROM schedules_v2 s
        INNER JOIN classes c ON s.class_id = c.id
        LEFT JOIN (
          SELECT schedule_id, COUNT(*) as cnt
          FROM bookings WHERE status = 'confirmed'
          GROUP BY schedule_id
        ) b ON b.schedule_id = s.id
        WHERE s.date >= ? AND s.date <= ?
        ORDER BY s.date, s.start_time
      `,
      args: [from, to],
    });

    return NextResponse.json(result.rows);
  } catch (err) {
    return NextResponse.json({ error: "Internal error", detail: String(err) }, { status: 500 });
  }
}
