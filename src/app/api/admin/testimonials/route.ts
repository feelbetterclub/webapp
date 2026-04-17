import { NextRequest, NextResponse } from "next/server";
import { client } from "@/db";
import { rawInsert } from "@/db/helpers";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const denied = await requireAdmin();
    if (denied) return denied;
    const result = await client.execute(
      "SELECT id, author, text, class_type as classType, rating, visible, created_at as createdAt FROM testimonials ORDER BY created_at DESC"
    );
    return NextResponse.json(result.rows);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const denied = await requireAdmin();
    if (denied) return denied;
    const { author, text, classType, rating } = await req.json();
    if (!author || !text) {
      return NextResponse.json({ error: "Author and text required" }, { status: 400 });
    }
    await rawInsert("testimonials", {
      author,
      text,
      class_type: classType || null,
      rating: rating || 5,
      visible: 1,
      created_at: new Date().toISOString(),
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
    const { id, visible } = await req.json();
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
    await client.execute({
      sql: "UPDATE testimonials SET visible = ? WHERE id = ?",
      args: [visible ? 1 : 0, id],
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
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
    await client.execute({ sql: "DELETE FROM testimonials WHERE id = ?", args: [Number(id)] });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
