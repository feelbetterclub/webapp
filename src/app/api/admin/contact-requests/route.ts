import { NextRequest, NextResponse } from "next/server";
import { client } from "@/db";
import { requireAdmin } from "@/lib/auth";

/**
 * GET /api/admin/contact-requests — List all contact messages.
 */
export async function GET() {
  try {
    const denied = await requireAdmin();
    if (denied) return denied;

    const result = await client.execute(
      `SELECT id, name, email, phone, preferred_contact AS preferredContact,
              message, status, created_at AS createdAt
       FROM contact_messages
       ORDER BY created_at DESC`
    );

    return NextResponse.json(result.rows);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

/**
 * PUT /api/admin/contact-requests — Update a message's status (read / archived).
 */
export async function PUT(req: NextRequest) {
  try {
    const denied = await requireAdmin();
    if (denied) return denied;

    const body = await req.json();
    const id = Number(body.id);
    const status = String(body.status || "").trim();

    if (!id || !["new", "read", "archived"].includes(status)) {
      return NextResponse.json(
        { error: "Valid id and status (new|read|archived) required" },
        { status: 400 }
      );
    }

    await client.execute({
      sql: "UPDATE contact_messages SET status = ? WHERE id = ?",
      args: [status, id],
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
