import { NextResponse } from "next/server";
import { client } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { BOOKING_STATUS } from "@/lib/constants";

export async function GET() {
  try {
    const denied = await requireAdmin();
    if (denied) return denied;

    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const dayOfWeek = now.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const thisMonday = new Date(now);
    thisMonday.setDate(now.getDate() + mondayOffset);
    const lastMonday = new Date(thisMonday);
    lastMonday.setDate(thisMonday.getDate() - 7);
    const thisSunday = new Date(thisMonday);
    thisSunday.setDate(thisMonday.getDate() + 6);
    const lastSunday = new Date(lastMonday);
    lastSunday.setDate(lastMonday.getDate() + 6);
    const fmt = (d: Date) => d.toISOString().split("T")[0];

    const [totalBookings, thisWeek, lastWeek, topClasses, communityCount, occupancy] = await Promise.all([
      client.execute({
        sql: "SELECT COUNT(*) as cnt FROM bookings WHERE status = ?",
        args: [BOOKING_STATUS.CONFIRMED],
      }),
      client.execute({
        sql: "SELECT COUNT(*) as cnt FROM bookings WHERE status = ? AND date >= ? AND date <= ?",
        args: [BOOKING_STATUS.CONFIRMED, fmt(thisMonday), fmt(thisSunday)],
      }),
      client.execute({
        sql: "SELECT COUNT(*) as cnt FROM bookings WHERE status = ? AND date >= ? AND date <= ?",
        args: [BOOKING_STATUS.CONFIRMED, fmt(lastMonday), fmt(lastSunday)],
      }),
      client.execute({
        sql: `SELECT c.name, COUNT(b.id) as bookings
              FROM bookings b INNER JOIN schedules_v2 s ON b.schedule_id = s.id
              INNER JOIN classes c ON s.class_id = c.id
              WHERE b.status = ?
              GROUP BY c.name ORDER BY bookings DESC LIMIT 5`,
        args: [BOOKING_STATUS.CONFIRMED],
      }),
      client.execute("SELECT COUNT(*) as cnt FROM community_members"),
      client.execute({
        sql: `SELECT c.name,
              COALESCE(c.max_capacity, 15) as capacity,
              COUNT(b.id) as booked
              FROM schedules_v2 s
              INNER JOIN classes c ON s.class_id = c.id
              LEFT JOIN bookings b ON b.schedule_id = s.id AND b.date = s.date AND b.status = ?
              WHERE s.date >= ?
              GROUP BY c.name`,
        args: [BOOKING_STATUS.CONFIRMED, today],
      }),
    ]);

    return NextResponse.json({
      totalBookings: totalBookings.rows[0]?.cnt as number,
      thisWeekBookings: thisWeek.rows[0]?.cnt as number,
      lastWeekBookings: lastWeek.rows[0]?.cnt as number,
      topClasses: topClasses.rows.map((r) => ({ name: r.name as string, bookings: r.bookings as number })),
      communityMembers: communityCount.rows[0]?.cnt as number,
      occupancy: occupancy.rows.map((r) => ({
        name: r.name as string,
        capacity: r.capacity as number,
        booked: r.booked as number,
      })),
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
