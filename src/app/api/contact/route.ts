import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/contact — Contact form submission.
 * Logs the message for now; email delivery to be wired up later.
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

    // Log the contact request — email delivery to be implemented
    console.log("[contact]", {
      name,
      email,
      phone: phone || null,
      preferredContact,
      message,
      receivedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error("[contact] error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
