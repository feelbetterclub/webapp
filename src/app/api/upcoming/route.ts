import { NextResponse } from "next/server";
import { client } from "@/db";

export async function GET() {
  try {
    const today = new Date().toISOString().slice(0, 10);

    const result = await client.execute({
      sql: `
        SELECT
          s.id,
          c.name AS className,
          s.date,
          s.start_time AS startTime,
          c.location,
          c.duration_minutes AS durationMinutes,
          c.icon
        FROM schedules_v2 s
        INNER JOIN classes c ON s.class_id = c.id
        WHERE s.date >= ?
        ORDER BY s.date, s.start_time
        LIMIT 3
      `,
      args: [today],
    });

    return NextResponse.json(result.rows);
  } catch (err) {
    return NextResponse.json(
      { error: "Internal error", detail: String(err) },
      { status: 500 },
    );
  }
}
