import { NextRequest, NextResponse } from "next/server";
import { client } from "@/db";
import { BOOKING_STATUS } from "@/lib/constants";

/**
 * POST /api/bookings/cancel?token=xxx
 *
 * Cancels a booking by its cancel_token if the class is >12h away.
 */
export async function POST(req: NextRequest) {
  try {
    const token = new URL(req.url).searchParams.get("token");
    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    // Look up the booking + schedule info
    const result = await client.execute({
      sql: `
        SELECT b.id, b.status, b.date, s.start_time
        FROM bookings b
        INNER JOIN schedules_v2 s ON b.schedule_id = s.id
        WHERE b.cancel_token = ?
      `,
      args: [token],
    });

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const booking = result.rows[0];

    if (booking.status !== BOOKING_STATUS.CONFIRMED) {
      return NextResponse.json({ error: "Booking already cancelled" }, { status: 409 });
    }

    // 12h lockout: reject if class starts within 12 hours
    const classStart = new Date(`${booking.date}T${booking.start_time}`);
    const now = new Date();
    const hoursUntilClass = (classStart.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilClass < 12) {
      return NextResponse.json(
        { error: "Cannot cancel within 12 hours of class start" },
        { status: 403 }
      );
    }

    await client.execute({
      sql: "UPDATE bookings SET status = ? WHERE id = ?",
      args: [BOOKING_STATUS.CANCELLED ?? "cancelled", booking.id],
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: "Internal error", detail: String(err) },
      { status: 500 }
    );
  }
}

/**
 * GET /api/bookings/cancel?token=xxx
 *
 * Returns booking info for the cancel page to render.
 */
export async function GET(req: NextRequest) {
  try {
    const token = new URL(req.url).searchParams.get("token");
    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    const result = await client.execute({
      sql: `
        SELECT b.id, b.status, b.date, b.user_name as userName,
               s.start_time as startTime, c.name as className
        FROM bookings b
        INNER JOIN schedules_v2 s ON b.schedule_id = s.id
        INNER JOIN classes c ON s.class_id = c.id
        WHERE b.cancel_token = ?
      `,
      args: [token],
    });

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const b = result.rows[0];
    const classStart = new Date(`${b.date}T${b.startTime}`);
    const hoursUntilClass = (classStart.getTime() - Date.now()) / (1000 * 60 * 60);

    return NextResponse.json({
      id: b.id,
      status: b.status,
      date: b.date,
      startTime: b.startTime,
      className: b.className,
      userName: b.userName,
      canCancel: b.status === "confirmed" && hoursUntilClass >= 12,
      hoursUntilClass: Math.round(hoursUntilClass * 10) / 10,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Internal error", detail: String(err) },
      { status: 500 }
    );
  }
}
