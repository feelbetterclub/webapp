import { NextRequest, NextResponse } from "next/server";
import { client } from "@/db";
import { requireAdmin } from "@/lib/auth";

const MAX_IMAGES_PER_LOCATION = 3;

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

    // Check current count
    const countResult = await client.execute({
      sql: "SELECT COUNT(*) AS cnt FROM location_images WHERE location_id = ?",
      args: [locationId],
    });
    const currentCount = Number(countResult.rows[0]?.cnt ?? 0);
    const slotsAvailable = MAX_IMAGES_PER_LOCATION - currentCount;

    if (slotsAvailable <= 0) {
      return NextResponse.json(
        { error: `Maximum ${MAX_IMAGES_PER_LOCATION} photos per location. Delete one first.` },
        { status: 400 }
      );
    }

    const toInsert = images.slice(0, slotsAvailable);

    // Get current max position
    const posResult = await client.execute({
      sql: "SELECT COALESCE(MAX(position), -1) AS maxPos FROM location_images WHERE location_id = ?",
      args: [locationId],
    });
    let nextPos = Number(posResult.rows[0]?.maxPos ?? -1) + 1;

    for (const img of toInsert) {
      const mime = getMime(img.fileName);
      await client.execute({
        sql: "INSERT INTO location_images (location_id, image_data, image_mime, position) VALUES (?, ?, ?, ?)",
        args: [locationId, img.base64, mime, nextPos++],
      });
    }

    await syncFirstImage(locationId);

    const skipped = images.length - toInsert.length;
    return NextResponse.json({
      success: true,
      added: toInsert.length,
      ...(skipped > 0 && { skipped, message: `${skipped} photo(s) skipped — max ${MAX_IMAGES_PER_LOCATION} per location` }),
    }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// PUT — reorder images
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const denied = await requireAdmin();
    if (denied) return denied;
    const { id } = await params;
    const locationId = Number(id);
    const { order } = await req.json() as { order: number[] }; // array of image IDs in desired order

    if (!order || order.length === 0) {
      return NextResponse.json({ error: "order[] required" }, { status: 400 });
    }

    for (let i = 0; i < order.length; i++) {
      await client.execute({
        sql: "UPDATE location_images SET position = ? WHERE id = ? AND location_id = ?",
        args: [i, order[i], locationId],
      });
    }

    await syncFirstImage(locationId);

    return NextResponse.json({ success: true });
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

    const existing = await client.execute({
      sql: "SELECT location_id FROM location_images WHERE id = ?",
      args: [Number(imageId)],
    });
    const locationId = existing.rows[0]?.location_id as number | undefined;

    await client.execute({
      sql: "DELETE FROM location_images WHERE id = ?",
      args: [Number(imageId)],
    });

    if (locationId) await syncFirstImage(locationId);

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

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
