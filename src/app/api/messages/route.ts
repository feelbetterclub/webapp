import { NextRequest, NextResponse } from "next/server";
import { client } from "@/db";
import { sendMessageNotification } from "@/lib/email";

/**
 * POST /api/messages — "Ask us anything" anonymous message.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const text = String(body.text || "").trim();
    const replyEmail = String(body.replyEmail || "").trim().toLowerCase() || null;

    if (!text || text.length < 3) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }
    if (text.length > 2000) {
      return NextResponse.json({ error: "Message too long (max 2000 chars)" }, { status: 400 });
    }
    if (replyEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(replyEmail)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    await client.execute({
      sql: "INSERT INTO messages (text, reply_email, created_at) VALUES (?, ?, ?)",
      args: [text, replyEmail, new Date().toISOString()],
    });

    sendMessageNotification({ text, replyEmail }).catch((err) =>
      console.error("[messages] notification email failed:", err)
    );

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Internal error", detail: String(err) }, { status: 500 });
  }
}
