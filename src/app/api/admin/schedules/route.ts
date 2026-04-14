import { NextRequest, NextResponse } from "next/server";
import { client } from "@/db";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const denied = await requireAdmin();
    if (denied) return denied;

    const result = await client.execute(
      "SELECT s.id, s.class_id as classId, s.date, s.start_time as startTime, s.instructor, c.name as className FROM schedules_v2 s INNER JOIN classes c ON s.class_id = c.id ORDER BY s.date, s.start_time"
    );
    return NextResponse.json(result.rows);
  } catch (err) {
    return NextResponse.json({ error: "Internal error", detail: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const denied = await requireAdmin();
    if (denied) return denied;

    const { classId, date, startTime, instructor, recurring, untilDate } = await req.json();
    if (!classId || !date || !startTime) {
      return NextResponse.json({ error: "Class, date and time are required" }, { status: 400 });
    }

    if (recurring) {
      // Generate weekly schedules from date until untilDate (or 6 months if indefinite)
      const startDate = new Date(date);
      const endDate = untilDate
        ? new Date(untilDate)
        : new Date(startDate.getTime() + 6 * 30 * 24 * 60 * 60 * 1000); // ~6 months

      const dates: string[] = [];
      const current = new Date(startDate);
      while (current <= endDate) {
        dates.push(current.toISOString().split("T")[0]);
        current.setDate(current.getDate() + 7);
      }

      // Batch insert all dates
      for (const d of dates) {
        await client.execute({
          sql: "INSERT INTO schedules_v2 (class_id, date, start_time, instructor) VALUES (?, ?, ?, ?)",
          args: [classId, d, startTime, instructor || null],
        });
      }

      return NextResponse.json({ success: true, count: dates.length }, { status: 201 });
    } else {
      // Single date
      await client.execute({
        sql: "INSERT INTO schedules_v2 (class_id, date, start_time, instructor) VALUES (?, ?, ?, ?)",
        args: [classId, date, startTime, instructor || null],
      });

      return NextResponse.json({ success: true, count: 1 }, { status: 201 });
    }
  } catch (err) {
    return NextResponse.json({ error: "Internal error", detail: String(err) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const denied = await requireAdmin();
    if (denied) return denied;

    const id = new URL(req.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    await client.execute({ sql: "DELETE FROM schedules_v2 WHERE id = ?", args: [Number(id)] });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Internal error", detail: String(err) }, { status: 500 });
  }
}
