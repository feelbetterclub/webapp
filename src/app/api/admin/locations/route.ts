import { NextRequest, NextResponse } from "next/server";
import { client } from "@/db";
import { rawInsert } from "@/db/helpers";
import { requireAdmin } from "@/lib/auth";
import { writeFile, unlink } from "fs/promises";
import path from "path";

export async function GET() {
  try {
    const denied = await requireAdmin();
    if (denied) return denied;
    const result = await client.execute("SELECT * FROM locations ORDER BY name");
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

    let imagePath: string | null = null;

    if (imageBase64 && imageName) {
      const ext = path.extname(imageName).toLowerCase() || ".webp";
      const safeName = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/-+$/, "");
      const fileName = `${safeName}-${Date.now()}${ext}`;
      const filePath = path.join(process.cwd(), "public", "locations", fileName);

      const buffer = Buffer.from(imageBase64, "base64");
      await writeFile(filePath, buffer);
      imagePath = `/locations/${fileName}`;
    }

    await rawInsert("locations", {
      name,
      url: url || null,
      image: imagePath,
    });
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

    let imagePath: string | null | undefined = undefined;

    if (removeImage) {
      // Delete old file
      const existing = await client.execute({ sql: "SELECT image FROM locations WHERE id = ?", args: [id] });
      const oldImage = existing.rows[0]?.image as string | null;
      if (oldImage) {
        try { await unlink(path.join(process.cwd(), "public", oldImage)); } catch { /* ok */ }
      }
      imagePath = null;
    } else if (imageBase64 && imageName) {
      const ext = path.extname(imageName).toLowerCase() || ".webp";
      const safeName = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/-+$/, "");
      const fileName = `${safeName}-${Date.now()}${ext}`;
      const filePath = path.join(process.cwd(), "public", "locations", fileName);

      const buffer = Buffer.from(imageBase64, "base64");
      await writeFile(filePath, buffer);
      imagePath = `/locations/${fileName}`;

      // Delete old file
      const existing = await client.execute({ sql: "SELECT image FROM locations WHERE id = ?", args: [id] });
      const oldImage = existing.rows[0]?.image as string | null;
      if (oldImage) {
        try { await unlink(path.join(process.cwd(), "public", oldImage)); } catch { /* ok */ }
      }
    }

    if (imagePath !== undefined) {
      await client.execute({
        sql: "UPDATE locations SET name=?, url=?, image=? WHERE id=?",
        args: [name, url || null, imagePath, id],
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

    // Delete image file if exists
    const existing = await client.execute({ sql: "SELECT image FROM locations WHERE id = ?", args: [Number(id)] });
    const oldImage = existing.rows[0]?.image as string | null;
    if (oldImage) {
      try { await unlink(path.join(process.cwd(), "public", oldImage)); } catch { /* ok */ }
    }

    await client.execute({ sql: "DELETE FROM locations WHERE id = ?", args: [Number(id)] });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
