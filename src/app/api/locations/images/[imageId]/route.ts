import { NextRequest, NextResponse } from "next/server";
import { client } from "@/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ imageId: string }> }
) {
  try {
    const { imageId } = await params;
    const result = await client.execute({
      sql: "SELECT image_data, image_mime FROM location_images WHERE id = ?",
      args: [Number(imageId)],
    });

    const row = result.rows[0];
    if (!row?.image_data) {
      return new NextResponse(null, { status: 404 });
    }

    const buffer = Buffer.from(row.image_data as string, "base64");
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": (row.image_mime as string) || "image/webp",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse(null, { status: 500 });
  }
}
