import { NextRequest, NextResponse } from "next/server";
import { client } from "@/db";
import { todayISO } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const className = searchParams.get("className");

    if (!className) {
      return NextResponse.json(
        { error: "className parameter is required" },
        { status: 400 },
      );
    }

    const today = todayISO();

    const result = await client.execute({
      sql: `
        SELECT s.date
        FROM schedules_v2 s
        INNER JOIN classes c ON s.class_id = c.id
        WHERE c.name LIKE '%' || ? || '%'
          AND s.date >= ?
        ORDER BY s.date, s.start_time
        LIMIT 1
      `,
      args: [className, today],
    });

    if (result.rows.length === 0) {
      return NextResponse.json({ date: null });
    }

    const date = result.rows[0].date as string;
    const dateObj = new Date(date + "T00:00:00");
    const jsDay = dateObj.getDay(); // 0=Sun
    const dayOfWeek = jsDay === 0 ? 7 : jsDay; // 1=Mon..7=Sun

    return NextResponse.json({ date, dayOfWeek });
  } catch (err) {
    return NextResponse.json(
      { error: "Internal error", detail: String(err) },
      { status: 500 },
    );
  }
}
