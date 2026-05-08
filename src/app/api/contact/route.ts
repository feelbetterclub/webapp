import { NextRequest, NextResponse } from "next/server";
import { sendContactNotification, sendContactAutoReply } from "@/lib/email";
import { client } from "@/db";

/**
 * POST /api/contact — Contact form submission.
 * Stores the message in DB, then sends email notifications (fire-and-forget).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const phone = String(body.phone || "").trim();
    const preferredContact = String(body.preferredContact || "email").trim();
    const message = String(body.message || "").trim();

    // Basic validation
    if (!name || name.length < 2) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }
    if (!message || message.length < 5) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }
    if (message.length > 2000) {
      return NextResponse.json({ error: "Message too long (max 2000 chars)" }, { status: 400 });
    }

    // Persist to DB — this is the source of truth even if emails fail
    const now = new Date().toISOString();
    await client.execute({
      sql: `INSERT INTO contact_messages (name, email, phone, preferred_contact, message, status, created_at)
            VALUES (?, ?, ?, ?, ?, 'new', ?)`,
      args: [name, email, phone || null, preferredContact, message, now],
    });

    // Log the contact request
    console.log("[contact]", {
      name,
      email,
      phone: phone || null,
      preferredContact,
      message,
      receivedAt: now,
    });

    // Notify the coach — fire-and-forget
    sendContactNotification({ name, email, phone: phone || undefined, preferredContact, message })
      .catch(e => console.error("[contact] email notification failed:", e));

    // Auto-reply to the user — in the user's language
    const lang = String(body.lang || "en").trim();
    sendContactAutoReply(email, name, lang)
      .catch(e => console.error("[contact] auto-reply failed:", e));

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error("[contact] error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
