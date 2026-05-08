import { NextRequest, NextResponse } from "next/server";
import { client } from "@/db";
import { requireAdmin } from "@/lib/auth";

/**
 * GET /api/admin/revenue?from=YYYY-MM-DD&to=YYYY-MM-DD
 * Returns per-session revenue data and grand totals.
 */
export async function GET(req: NextRequest) {
  try {
    const denied = await requireAdmin();
    if (denied) return denied;

    const { searchParams } = new URL(req.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    if (!from || !to) {
      return NextResponse.json({ error: "from and to parameters required" }, { status: 400 });
    }

    // Per-session revenue
    const sessionsRes = await client.execute({
      sql: `
        SELECT
          s.id AS scheduleId,
          s.date,
          s.start_time AS startTime,
          s.price,
          c.name AS className,
          COUNT(b.id) AS bookedCount,
          SUM(CASE WHEN b.paid = 1 THEN 1 ELSE 0 END) AS paidCount,
          SUM(CASE WHEN b.paid = 1 THEN s.price ELSE 0 END) AS totalCents
        FROM schedules_v2 s
        INNER JOIN classes c ON s.class_id = c.id
        LEFT JOIN bookings b ON b.schedule_id = s.id AND b.date = s.date AND b.status = 'confirmed'
        WHERE s.date >= ? AND s.date <= ?
        GROUP BY s.id, s.date
        ORDER BY s.date DESC, s.start_time DESC
      `,
      args: [from, to],
    });

    // Grand totals
    const totalsRes = await client.execute({
      sql: `
        SELECT
          SUM(CASE WHEN b.paid = 1 THEN s.price ELSE 0 END) AS totalCents,
          SUM(CASE WHEN b.paid = 1 THEN 1 ELSE 0 END) AS totalPaid,
          COUNT(b.id) AS totalBooked
        FROM bookings b
        INNER JOIN schedules_v2 s ON b.schedule_id = s.id AND b.date = s.date
        WHERE b.status = 'confirmed' AND s.date >= ? AND s.date <= ?
      `,
      args: [from, to],
    });

    const totals = totalsRes.rows[0] || { totalCents: 0, totalPaid: 0, totalBooked: 0 };

    return NextResponse.json({
      sessions: sessionsRes.rows,
      totals: {
        totalCents: Number(totals.totalCents) || 0,
        totalPaid: Number(totals.totalPaid) || 0,
        totalBooked: Number(totals.totalBooked) || 0,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: "Internal error", detail: String(err) }, { status: 500 });
  }
}
