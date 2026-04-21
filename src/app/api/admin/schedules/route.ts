import { NextRequest, NextResponse } from "next/server";
import { client } from "@/db";
import { rawInsert } from "@/db/helpers";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const denied = await requireAdmin();
    if (denied) return denied;
    const result = await client.execute(
      "SELECT s.id, s.class_id as classId, s.date, s.start_time as startTime, s.instructor, s.price, s.max_capacity as maxCapacity, c.name as className FROM schedules_v2 s INNER JOIN classes c ON s.class_id = c.id ORDER BY s.date, s.start_time"
    );
    return NextResponse.json(result.rows);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const denied = await requireAdmin();
    if (denied) return denied;
    const { classId, date, startTime, instructor, recurring, untilDate, price, maxCapacity } = await req.json();
    if (!classId || !date || !startTime) {
      return NextResponse.json({ error: "Class, date and time required" }, { status: 400 });
    }

    if (recurring) {
      const startDate = new Date(date);
      const endDate = untilDate
        ? new Date(untilDate)
        : new Date(startDate.getTime() + 6 * 30 * 24 * 60 * 60 * 1000);

      let count = 0;
      const current = new Date(startDate);
      while (current <= endDate) {
        await rawInsert("schedules_v2", {
          class_id: classId,
          date: current.toISOString().split("T")[0],
          start_time: startTime,
          instructor: instructor || null,
          price: price != null ? Number(price) : null,
          max_capacity: maxCapacity != null ? Number(maxCapacity) : null,
        });
        current.setDate(current.getDate() + 7);
        count++;
      }
      return NextResponse.json({ success: true, count }, { status: 201 });
    }

    await rawInsert("schedules_v2", {
      class_id: classId,
      date,
      start_time: startTime,
      instructor: instructor || null,
      price: price != null ? Number(price) : null,
      max_capacity: maxCapacity != null ? Number(maxCapacity) : null,
    });
    return NextResponse.json({ success: true, count: 1 }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
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
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
