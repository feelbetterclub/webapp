import { NextResponse } from "next/server";
import { client } from "@/db";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const denied = await requireAdmin();
    if (denied) return denied;

    const result = await client.execute(`
      SELECT
        user_email AS email,
        user_name AS name,
        user_phone AS phone,
        MIN(created_at) AS joinedAt,
        'booking' AS source
      FROM bookings
      GROUP BY user_email
      HAVING MIN(date) >= date('now', '-7 days')

      UNION ALL

      SELECT
        email,
        name,
        phone,
        created_at AS joinedAt,
        'community' AS source
      FROM community_members
      WHERE created_at >= date('now', '-7 days')
        AND email NOT IN (SELECT user_email FROM bookings)

      ORDER BY joinedAt DESC
    `);

    const members = result.rows.map((row) => ({
      email: row.email,
      name: row.name,
      phone: row.phone ?? null,
      joinedAt: row.joinedAt,
      source: row.source,
    }));

    return NextResponse.json(members);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
