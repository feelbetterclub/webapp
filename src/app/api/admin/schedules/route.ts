import { NextRequest, NextResponse } from "next/server";
import { client } from "@/db";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const denied = await requireAdmin();
    if (denied) return denied;

    const result = await client.execute(
      "SELECT s.id, s.class_id as classId, s.day_of_week as dayOfWeek, s.start_time as startTime, s.instructor, c.name as className FROM schedules s INNER JOIN classes c ON s.class_id = c.id ORDER BY s.day_of_week, s.start_time"
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

    const { classId, dayOfWeek, startTime, instructor } = await req.json();
    if (!classId || !dayOfWeek || !startTime) {
      return NextResponse.json({ error: "Class, day and time are required" }, { status: 400 });
    }

    await client.execute({
      sql: "INSERT INTO schedules (class_id, day_of_week, start_time, instructor) VALUES (?, ?, ?, ?)",
      args: [classId, dayOfWeek, startTime, instructor || null],
    });

    return NextResponse.json({ success: true }, { status: 201 });
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

    await client.execute({ sql: "DELETE FROM schedules WHERE id = ?", args: [Number(id)] });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Internal error", detail: String(err) }, { status: 500 });
  }
}
