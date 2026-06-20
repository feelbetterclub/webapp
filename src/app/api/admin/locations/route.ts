import { NextRequest, NextResponse } from "next/server";
import { client } from "@/db";
import { requireAdmin } from "@/lib/auth";

const MIME_MAP: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

function getMime(fileName: string): string {
  const ext = fileName.toLowerCase().replace(/.*(\.\w+)$/, "$1");
  return MIME_MAP[ext] || "image/webp";
}

export async function GET() {
  try {
    const denied = await requireAdmin();
    if (denied) return denied;
    const result = await client.execute("SELECT id, name, url, image FROM locations ORDER BY name");

    // Attach image list per location
    const locations = await Promise.all(
      result.rows.map(async (loc) => {
        const imgs = await client.execute({
          sql: "SELECT id, position FROM location_images WHERE location_id = ? ORDER BY position, id",
          args: [loc.id as number],
        });
        return {
          ...loc,
          images: imgs.rows.map((r) => ({
            id: r.id,
            url: `/api/locations/images/${r.id}`,
            position: r.position,
          })),
        };
      })
    );

    return NextResponse.json(locations);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const denied = await requireAdmin();
    if (denied) return denied;
    const { name, url, images } = await req.json() as {
      name: string;
      url?: string;
      images?: { base64: string; fileName: string }[];
    };
    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    // Insert location
    const result = await client.execute({
      sql: "INSERT INTO locations (name, url) VALUES (?, ?)",
      args: [name, url || null],
    });
    const locationId = Number(result.lastInsertRowid);

    // Insert images
    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        const mime = getMime(images[i].fileName);
        await client.execute({
          sql: "INSERT INTO location_images (location_id, image_data, image_mime, position) VALUES (?, ?, ?, ?)",
          args: [locationId, images[i].base64, mime, i],
        });
      }
      // Set first image path on locations.image for Hero compat
      const first = await client.execute({
        sql: "SELECT id FROM location_images WHERE location_id = ? ORDER BY position, id LIMIT 1",
        args: [locationId],
      });
      if (first.rows[0]) {
        await client.execute({
          sql: "UPDATE locations SET image = ? WHERE id = ?",
          args: [`/api/locations/images/${first.rows[0].id}`, locationId],
        });
      }
    }

    return NextResponse.json({ success: true, id: locationId }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const denied = await requireAdmin();
    if (denied) return denied;
    const { id, name, url } = await req.json();
    if (!id || !name) return NextResponse.json({ error: "ID and name required" }, { status: 400 });

    await client.execute({
      sql: "UPDATE locations SET name=?, url=? WHERE id=?",
      args: [name, url || null, id],
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const denied = await requireAdmin();
    if (denied) return denied;
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    // Delete images first (CASCADE should handle it but be explicit)
    await client.execute({ sql: "DELETE FROM location_images WHERE location_id = ?", args: [Number(id)] });
    await client.execute({ sql: "DELETE FROM locations WHERE id = ?", args: [Number(id)] });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
