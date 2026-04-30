import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { client } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { BOOKING_STATUS, WAITLIST_STATUS } from "@/lib/constants";
import { sendBookingConfirmation } from "@/lib/email";

/**
 * GET /api/admin/session-detail?scheduleId=X&date=Y
 * Returns bookings + waitlist for a specific session.
 */
export async function GET(req: NextRequest) {
  try {
    const denied = await requireAdmin();
    if (denied) return denied;

    const { searchParams } = new URL(req.url);
    const scheduleId = searchParams.get("scheduleId");
    const date = searchParams.get("date");

    if (!scheduleId || !date) {
      return NextResponse.json({ error: "scheduleId and date required" }, { status: 400 });
    }

    const [bookingsRes, waitlistRes] = await Promise.all([
      client.execute({
        sql: `SELECT id, user_name AS userName, user_email AS userEmail, user_phone AS userPhone, status, created_at AS createdAt
              FROM bookings WHERE schedule_id = ? AND date = ? AND status = ?
              ORDER BY created_at`,
        args: [Number(scheduleId), date, BOOKING_STATUS.CONFIRMED],
      }),
      client.execute({
        sql: `SELECT id, user_name AS userName, user_email AS userEmail, user_phone AS userPhone, position, status, created_at AS createdAt
              FROM waitlist WHERE schedule_id = ? AND date = ? AND status = ?
              ORDER BY position`,
        args: [Number(scheduleId), date, WAITLIST_STATUS.WAITING],
      }),
    ]);

    return NextResponse.json({
      bookings: bookingsRes.rows,
      waitlist: waitlistRes.rows,
    });
  } catch (err) {
    return NextResponse.json({ error: "Internal error", detail: String(err) }, { status: 500 });
  }
}

/**
 * POST /api/admin/session-detail
 * Promote a waitlisted person to a confirmed booking.
 * Body: { waitlistId, scheduleId, date }
 */
export async function POST(req: NextRequest) {
  try {
    const denied = await requireAdmin();
    if (denied) return denied;

    const { waitlistId, scheduleId, date } = await req.json();
    if (!waitlistId || !scheduleId || !date) {
      return NextResponse.json({ error: "waitlistId, scheduleId, and date required" }, { status: 400 });
    }

    const cancelToken = randomBytes(24).toString("base64url");

    const tx = await client.transaction("write");
    try {
      // Get waitlist entry
      const wRes = await tx.execute({
        sql: "SELECT id, user_name, user_email, user_phone FROM waitlist WHERE id = ? AND status = ?",
        args: [waitlistId, WAITLIST_STATUS.WAITING],
      });

      if (wRes.rows.length === 0) {
        await tx.rollback();
        return NextResponse.json({ error: "Waitlist entry not found or already promoted" }, { status: 404 });
      }

      const entry = wRes.rows[0];

      // Mark as promoted
      await tx.execute({
        sql: "UPDATE waitlist SET status = ? WHERE id = ?",
        args: [WAITLIST_STATUS.PROMOTED, waitlistId],
      });

      // Create confirmed booking
      await tx.execute({
        sql: "INSERT INTO bookings (schedule_id, date, user_name, user_email, user_phone, status, cancel_token, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        args: [scheduleId, date, entry.user_name, entry.user_email, entry.user_phone || null, BOOKING_STATUS.CONFIRMED, cancelToken, new Date().toISOString()],
      });

      await tx.commit();

      // Get class info for email
      const infoRes = await client.execute({
        sql: "SELECT s.start_time, c.name AS class_name FROM schedules_v2 s INNER JOIN classes c ON s.class_id = c.id WHERE s.id = ?",
        args: [scheduleId],
      });

      if (infoRes.rows.length > 0) {
        const info = infoRes.rows[0];
        const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "https://feel-better-club.vercel.app";
        const cancelUrl = `${origin}/cancel/${cancelToken}`;
        sendBookingConfirmation({
          to: entry.user_email as string,
          userName: entry.user_name as string,
          date,
          time: info.start_time as string,
          classType: info.class_name as string,
          cancelUrl,
        }).catch((e) => console.error("[promote] email failed:", e));
      }

      return NextResponse.json({ success: true });
    } catch (txErr) {
      await tx.rollback();
      throw txErr;
    }
  } catch (err) {
    return NextResponse.json({ error: "Internal error", detail: String(err) }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/session-detail
 * Remove a booking (cancel by admin).
 * Body: { bookingId }
 */
export async function DELETE(req: NextRequest) {
  try {
    const denied = await requireAdmin();
    if (denied) return denied;

    const { bookingId } = await req.json();
    if (!bookingId) {
      return NextResponse.json({ error: "bookingId required" }, { status: 400 });
    }

    await client.execute({
      sql: "UPDATE bookings SET status = ? WHERE id = ?",
      args: [BOOKING_STATUS.CANCELLED, bookingId],
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Internal error", detail: String(err) }, { status: 500 });
  }
}
