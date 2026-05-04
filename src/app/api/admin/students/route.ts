import { NextRequest, NextResponse } from "next/server";
import { client } from "@/db";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const denied = await requireAdmin();
    if (denied) return denied;

    const result = await client.execute(`
      SELECT
        b.user_email AS email,
        b.user_name AS name,
        b.user_phone AS phone,
        COUNT(CASE WHEN b.status = 'confirmed' THEN 1 END) AS totalClasses,
        MAX(CASE WHEN b.status = 'confirmed' THEN b.date END) AS lastClassDate,
        MIN(CASE WHEN b.status = 'confirmed' THEN b.date END) AS firstClassDate,
        (
          SELECT c2.name
          FROM bookings b2
          JOIN schedules_v2 s2 ON b2.schedule_id = s2.id
          JOIN classes c2 ON s2.class_id = c2.id
          WHERE b2.user_email = b.user_email
            AND b2.status = 'confirmed'
          ORDER BY b2.date DESC
          LIMIT 1
        ) AS lastClassName,
        CASE WHEN cm.email IS NOT NULL THEN 1 ELSE 0 END AS isCommunityMember
      FROM bookings b
      LEFT JOIN community_members cm ON cm.email = b.user_email
      GROUP BY b.user_email
      ORDER BY totalClasses DESC
    `);

    const students = result.rows.map((row) => ({
      email: row.email,
      name: row.name,
      phone: row.phone ?? null,
      totalClasses: Number(row.totalClasses),
      lastClassDate: row.lastClassDate,
      lastClassName: row.lastClassName ?? null,
      firstClassDate: row.firstClassDate,
      isCommunityMember: row.isCommunityMember === 1,
    }));

    return NextResponse.json(students);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const denied = await requireAdmin();
    if (denied) return denied;

    const { email } = await req.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    await client.execute({ sql: "DELETE FROM bookings WHERE user_email = ?", args: [email] });
    await client.execute({ sql: "DELETE FROM waitlist WHERE user_email = ?", args: [email] });
    await client.execute({ sql: "DELETE FROM community_members WHERE email = ?", args: [email] });

    return NextResponse.json({ success: true, deleted: email });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
