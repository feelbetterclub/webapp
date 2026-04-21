import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { client } from "@/db";
import { BOOKING_STATUS, WAITLIST_STATUS } from "@/lib/constants";
import { sendBookingConfirmation } from "@/lib/email";

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

    // Cancel + promote waitlist in a transaction
    const tx = await client.transaction("write");
    try {
      await tx.execute({
        sql: "UPDATE bookings SET status = ? WHERE id = ?",
        args: [BOOKING_STATUS.CANCELLED, booking.id],
      });

      // Get the cancelled booking's schedule info for waitlist promotion
      const bookingInfo = await tx.execute({
        sql: `SELECT b.schedule_id, b.date, s.start_time, c.name as class_name
              FROM bookings b
              INNER JOIN schedules_v2 s ON b.schedule_id = s.id
              INNER JOIN classes c ON s.class_id = c.id
              WHERE b.id = ?`,
        args: [booking.id],
      });

      let promotedUser: { name: string; email: string; phone: string | null } | null = null;
      let promotedCancelToken: string | null = null;

      if (bookingInfo.rows.length > 0) {
        const info = bookingInfo.rows[0];

        // Find first waiting person on the waitlist
        const waitlistResult = await tx.execute({
          sql: "SELECT id, user_name, user_email, user_phone FROM waitlist WHERE schedule_id = ? AND date = ? AND status = ? ORDER BY position ASC LIMIT 1",
          args: [info.schedule_id, info.date, WAITLIST_STATUS.WAITING],
        });

        if (waitlistResult.rows.length > 0) {
          const next = waitlistResult.rows[0];
          promotedCancelToken = randomBytes(24).toString("base64url");

          // Mark waitlist entry as promoted
          await tx.execute({
            sql: "UPDATE waitlist SET status = ? WHERE id = ?",
            args: [WAITLIST_STATUS.PROMOTED, next.id],
          });

          // Create confirmed booking for promoted user
          await tx.execute({
            sql: "INSERT INTO bookings (schedule_id, date, user_name, user_email, user_phone, status, cancel_token, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            args: [info.schedule_id, info.date, next.user_name, next.user_email, next.user_phone || null, BOOKING_STATUS.CONFIRMED, promotedCancelToken, new Date().toISOString()],
          });

          promotedUser = {
            name: next.user_name as string,
            email: next.user_email as string,
            phone: next.user_phone as string | null,
          };
        }
      }

      await tx.commit();

      // Send email to promoted user (fire-and-forget)
      if (promotedUser && promotedCancelToken && bookingInfo.rows.length > 0) {
        const info = bookingInfo.rows[0];
        const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "https://feel-better-club.vercel.app";
        const cancelUrl = `${origin}/cancel/${promotedCancelToken}`;
        sendBookingConfirmation({
          to: promotedUser.email,
          userName: promotedUser.name,
          date: info.date as string,
          time: info.start_time as string,
          classType: info.class_name as string,
          cancelUrl,
        }).catch((e) => console.error("[cancel] waitlist promotion email failed:", e));
      }
    } catch (txErr) {
      await tx.rollback();
      throw txErr;
    }

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
