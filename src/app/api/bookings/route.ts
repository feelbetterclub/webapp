import { NextRequest, NextResponse } from "next/server";
import { client } from "@/db";
import { BOOKING_STATUS } from "@/lib/constants";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    const scheduleId = searchParams.get("scheduleId");

    let sql = `
      SELECT b.id, b.schedule_id as scheduleId, b.date, b.user_name as userName,
             b.user_email as userEmail, b.user_phone as userPhone, b.status, b.created_at as createdAt,
             c.name as className, s.start_time as startTime, s.date as scheduleDate, s.instructor
      FROM bookings b
      INNER JOIN schedules_v2 s ON b.schedule_id = s.id
      INNER JOIN classes c ON s.class_id = c.id
    `;
    const conditions: string[] = [];
    const args: (string | number)[] = [];

    if (date) {
      conditions.push("b.date = ?");
      args.push(date);
    }
    if (scheduleId) {
      conditions.push("b.schedule_id = ?");
      args.push(Number(scheduleId));
    }

    if (conditions.length > 0) {
      sql += " WHERE " + conditions.join(" AND ");
    }
    sql += " ORDER BY s.start_time";

    const result = await client.execute({ sql, args });
    return NextResponse.json(result.rows);
  } catch (err) {
    return NextResponse.json({ error: "Internal error", detail: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { scheduleId, date, userName, userEmail, userPhone } = body;

    if (!scheduleId || !date || !userName || !userEmail) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    // Check schedule exists and get capacity
    const scheduleResult = await client.execute({
      sql: "SELECT s.class_id, c.max_capacity FROM schedules_v2 s INNER JOIN classes c ON s.class_id = c.id WHERE s.id = ?",
      args: [scheduleId],
    });

    if (scheduleResult.rows.length === 0) {
      return NextResponse.json({ error: "Schedule not found" }, { status: 404 });
    }

    const maxCapacity = scheduleResult.rows[0].max_capacity as number;

    // Check capacity and duplicate in parallel
    const [countResult, duplicateResult] = await Promise.all([
      client.execute({
        sql: "SELECT COUNT(*) as cnt FROM bookings WHERE schedule_id = ? AND date = ? AND status = ?",
        args: [scheduleId, date, BOOKING_STATUS.CONFIRMED],
      }),
      client.execute({
        sql: "SELECT id FROM bookings WHERE schedule_id = ? AND date = ? AND user_email = ? AND status = ?",
        args: [scheduleId, date, userEmail, BOOKING_STATUS.CONFIRMED],
      }),
    ]);

    const currentCount = countResult.rows[0]?.cnt as number;
    if (currentCount >= maxCapacity) {
      return NextResponse.json({ error: "Class is full" }, { status: 409 });
    }

    if (duplicateResult.rows.length > 0) {
      return NextResponse.json({ error: "You already have a booking" }, { status: 409 });
    }

    await client.execute({
      sql: "INSERT INTO bookings (schedule_id, date, user_name, user_email, user_phone, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
      args: [scheduleId, date, userName, userEmail, userPhone || null, BOOKING_STATUS.CONFIRMED, new Date().toISOString()],
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Internal error", detail: String(err) }, { status: 500 });
  }
}
