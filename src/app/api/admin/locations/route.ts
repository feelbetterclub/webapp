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
    return NextResponse.json(result.rows);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const denied = await requireAdmin();
    if (denied) return denied;
    const { name, url, imageBase64, imageName } = await req.json();
    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    if (imageBase64 && imageName) {
      const mime = getMime(imageName);
      const result = await client.execute({
        sql: "INSERT INTO locations (name, url, image_data, image_mime) VALUES (?, ?, ?, ?)",
        args: [name, url || null, imageBase64, mime],
      });
      const newId = Number(result.lastInsertRowid);
      const imagePath = `/api/locations/${newId}/image`;
      await client.execute({
        sql: "UPDATE locations SET image = ? WHERE id = ?",
        args: [imagePath, newId],
      });
    } else {
      await client.execute({
        sql: "INSERT INTO locations (name, url) VALUES (?, ?)",
        args: [name, url || null],
      });
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const denied = await requireAdmin();
    if (denied) return denied;
    const { id, name, url, imageBase64, imageName, removeImage } = await req.json();
    if (!id || !name) return NextResponse.json({ error: "ID and name required" }, { status: 400 });

    if (removeImage) {
      await client.execute({
        sql: "UPDATE locations SET name=?, url=?, image=NULL, image_data=NULL, image_mime=NULL WHERE id=?",
        args: [name, url || null, id],
      });
    } else if (imageBase64 && imageName) {
      const mime = getMime(imageName);
      const imagePath = `/api/locations/${id}/image`;
      await client.execute({
        sql: "UPDATE locations SET name=?, url=?, image=?, image_data=?, image_mime=? WHERE id=?",
        args: [name, url || null, imagePath, imageBase64, mime, id],
      });
    } else {
      await client.execute({
        sql: "UPDATE locations SET name=?, url=? WHERE id=?",
        args: [name, url || null, id],
      });
    }

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

    await client.execute({ sql: "DELETE FROM locations WHERE id = ?", args: [Number(id)] });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
