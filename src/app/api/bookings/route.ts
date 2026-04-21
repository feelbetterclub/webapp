import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { client } from "@/db";
import { BOOKING_STATUS, WAITLIST_STATUS, WAITLIST_MAX } from "@/lib/constants";
import { sendBookingConfirmation } from "@/lib/email";

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

    // Atomic capacity check + insert inside a write transaction to avoid TOCTOU.
    const cancelToken = randomBytes(24).toString("base64url");
    let scheduleInfo: { className: string; startTime: string; price: number | null } | null = null;
    let result: "booked" | "waitlisted" = "booked";
    let waitlistPosition = 0;

    const tx = await client.transaction("write");
    try {
      const scheduleResult = await tx.execute({
        sql: "SELECT s.class_id, s.start_time, s.price, COALESCE(s.max_capacity, c.max_capacity) as max_capacity, c.name as class_name FROM schedules_v2 s INNER JOIN classes c ON s.class_id = c.id WHERE s.id = ?",
        args: [scheduleId],
      });

      if (scheduleResult.rows.length === 0) {
        await tx.rollback();
        return NextResponse.json({ error: "Schedule not found" }, { status: 404 });
      }

      const row = scheduleResult.rows[0];
      const maxCapacity = row.max_capacity as number;
      scheduleInfo = {
        className: row.class_name as string,
        startTime: row.start_time as string,
        price: row.price as number | null,
      };

      // Check duplicate in bookings OR waitlist
      const duplicateResult = await tx.execute({
        sql: "SELECT id FROM bookings WHERE schedule_id = ? AND date = ? AND user_email = ? AND status = ?",
        args: [scheduleId, date, userEmail, BOOKING_STATUS.CONFIRMED],
      });
      if (duplicateResult.rows.length > 0) {
        await tx.rollback();
        return NextResponse.json({ error: "You already have a booking" }, { status: 409 });
      }

      const duplicateWaitlist = await tx.execute({
        sql: "SELECT id FROM waitlist WHERE schedule_id = ? AND date = ? AND user_email = ? AND status = ?",
        args: [scheduleId, date, userEmail, WAITLIST_STATUS.WAITING],
      });
      if (duplicateWaitlist.rows.length > 0) {
        await tx.rollback();
        return NextResponse.json({ error: "You are already on the waitlist" }, { status: 409 });
      }

      const countResult = await tx.execute({
        sql: "SELECT COUNT(*) as cnt FROM bookings WHERE schedule_id = ? AND date = ? AND status = ?",
        args: [scheduleId, date, BOOKING_STATUS.CONFIRMED],
      });
      const currentCount = countResult.rows[0]?.cnt as number;

      if (currentCount >= maxCapacity) {
        // Class full — try waitlist
        const waitlistCount = await tx.execute({
          sql: "SELECT COUNT(*) as cnt FROM waitlist WHERE schedule_id = ? AND date = ? AND status = ?",
          args: [scheduleId, date, WAITLIST_STATUS.WAITING],
        });
        const currentWaitlist = waitlistCount.rows[0]?.cnt as number;

        if (currentWaitlist >= WAITLIST_MAX) {
          await tx.rollback();
          return NextResponse.json({ error: "Class and waitlist are full" }, { status: 409 });
        }

        waitlistPosition = currentWaitlist + 1;
        await tx.execute({
          sql: "INSERT INTO waitlist (schedule_id, date, user_name, user_email, user_phone, position, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
          args: [scheduleId, date, userName, userEmail, userPhone || null, waitlistPosition, WAITLIST_STATUS.WAITING, new Date().toISOString()],
        });
        result = "waitlisted";
      } else {
        await tx.execute({
          sql: "INSERT INTO bookings (schedule_id, date, user_name, user_email, user_phone, status, cancel_token, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
          args: [scheduleId, date, userName, userEmail, userPhone || null, BOOKING_STATUS.CONFIRMED, cancelToken, new Date().toISOString()],
        });
        result = "booked";
      }

      await tx.commit();
    } catch (txErr) {
      await tx.rollback();
      throw txErr;
    }

    // Fire-and-forget emails
    if (scheduleInfo && result === "booked") {
      const origin =
        req.headers.get("origin") ||
        process.env.NEXT_PUBLIC_SITE_URL ||
        "https://feel-better-club.vercel.app";
      const cancelUrl = `${origin}/cancel/${cancelToken}`;
      sendBookingConfirmation({
        to: userEmail,
        userName,
        date,
        time: scheduleInfo.startTime,
        classType: scheduleInfo.className,
        cancelUrl,
      }).catch((e) => console.error("[bookings] confirmation email failed:", e));
    }

    if (result === "waitlisted") {
      return NextResponse.json({ success: true, waitlisted: true, position: waitlistPosition }, { status: 201 });
    }
    return NextResponse.json({ success: true, waitlisted: false }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Internal error", detail: String(err) }, { status: 500 });
  }
}
