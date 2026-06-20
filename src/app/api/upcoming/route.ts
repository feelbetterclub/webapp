import { NextResponse } from "next/server";
import { client } from "@/db";

export async function GET() {
  try {
    const today = new Date().toISOString().slice(0, 10);

    const result = await client.execute({
      sql: `
        SELECT
          s.id,
          c.name AS className,
          s.date,
          s.start_time AS startTime,
          c.location,
          c.duration_minutes AS durationMinutes,
          c.icon,
          l.id AS locationId
        FROM schedules_v2 s
        INNER JOIN classes c ON s.class_id = c.id
        LEFT JOIN locations l ON LOWER(TRIM(c.location)) = LOWER(TRIM(l.name))
        WHERE s.date >= ?
        ORDER BY s.date, s.start_time
        LIMIT 3
      `,
      args: [today],
    });

    // For each class, fetch all location images (up to 3)
    const classes = await Promise.all(
      result.rows.map(async (row) => {
        const locationId = row.locationId as number | null;
        let locationImages: string[] = [];

        if (locationId) {
          const imgs = await client.execute({
            sql: "SELECT id FROM location_images WHERE location_id = ? ORDER BY position, id LIMIT 3",
            args: [locationId],
          });
          locationImages = imgs.rows.map((r) => `/api/locations/images/${r.id}`);
        }

        return {
          id: row.id,
          className: row.className,
          date: row.date,
          startTime: row.startTime,
          location: row.location,
          durationMinutes: row.durationMinutes,
          icon: row.icon,
          locationImage: locationImages[0] || null,
          locationImages,
        };
      })
    );

    return NextResponse.json(classes);
  } catch (err) {
    return NextResponse.json(
      { error: "Internal error", detail: String(err) },
      { status: 500 },
    );
  }
}
