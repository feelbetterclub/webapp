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

// GET — list images for a location
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const denied = await requireAdmin();
    if (denied) return denied;
    const { id } = await params;
    const result = await client.execute({
      sql: "SELECT id, location_id, image_mime, position, created_at FROM location_images WHERE location_id = ? ORDER BY position, id",
      args: [Number(id)],
    });
    const images = result.rows.map((row) => ({
      ...row,
      url: `/api/locations/images/${row.id}`,
    }));
    return NextResponse.json(images);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// POST — add one or more images to a location
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const denied = await requireAdmin();
    if (denied) return denied;
    const { id } = await params;
    const locationId = Number(id);

    const { images } = await req.json() as {
      images: { base64: string; fileName: string }[];
    };

    if (!images || images.length === 0) {
      return NextResponse.json({ error: "No images provided" }, { status: 400 });
    }

    // Get current max position
    const posResult = await client.execute({
      sql: "SELECT COALESCE(MAX(position), -1) AS maxPos FROM location_images WHERE location_id = ?",
      args: [locationId],
    });
    let nextPos = Number(posResult.rows[0]?.maxPos ?? -1) + 1;

    for (const img of images) {
      const mime = getMime(img.fileName);
      await client.execute({
        sql: "INSERT INTO location_images (location_id, image_data, image_mime, position) VALUES (?, ?, ?, ?)",
        args: [locationId, img.base64, mime, nextPos++],
      });
    }

    // Update locations.image to point to first image (for Hero backward compat)
    await syncFirstImage(locationId);

    return NextResponse.json({ success: true, added: images.length }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// DELETE — remove a single image
export async function DELETE(req: NextRequest) {
  try {
    const denied = await requireAdmin();
    if (denied) return denied;
    const imageId = new URL(req.url).searchParams.get("imageId");
    if (!imageId) return NextResponse.json({ error: "imageId required" }, { status: 400 });

    // Get location_id before deleting
    const existing = await client.execute({
      sql: "SELECT location_id FROM location_images WHERE id = ?",
      args: [Number(imageId)],
    });
    const locationId = existing.rows[0]?.location_id as number | undefined;

    await client.execute({
      sql: "DELETE FROM location_images WHERE id = ?",
      args: [Number(imageId)],
    });

    // Sync first image for Hero
    if (locationId) await syncFirstImage(locationId);

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// Keep locations.image in sync with the first image for Hero backward compat
async function syncFirstImage(locationId: number) {
  const first = await client.execute({
    sql: "SELECT id FROM location_images WHERE location_id = ? ORDER BY position, id LIMIT 1",
    args: [locationId],
  });
  const imagePath = first.rows[0]
    ? `/api/locations/images/${first.rows[0].id}`
    : null;
  await client.execute({
    sql: "UPDATE locations SET image = ? WHERE id = ?",
    args: [imagePath, locationId],
  });
}
