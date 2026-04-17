import { NextRequest, NextResponse } from "next/server";
import { client } from "@/db";
import { rawInsert } from "@/db/helpers";
import { sendWelcomeEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const phonePrefix = String(body.phonePrefix || "").trim();
    const phone = String(body.phone || "").trim();

    if (!name || !email || !phonePrefix || !phone) {
      return NextResponse.json(
        { error: "Name, email, country prefix and mobile are required" },
        { status: 400 }
      );
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }
    if (!/^\+?[0-9]{1,4}$/.test(phonePrefix)) {
      return NextResponse.json({ error: "Invalid country prefix" }, { status: 400 });
    }
    if (!/^[0-9\s\-]{6,20}$/.test(phone)) {
      return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
    }

    // Check if member already exists
    const existing = await client.execute({
      sql: "SELECT id FROM community_members WHERE email = ?",
      args: [email],
    });

    if (existing.rows.length > 0) {
      // Idempotent: treat as success so pop-up doesn't leak member existence
      return NextResponse.json({ success: true, alreadyMember: true });
    }

    await rawInsert("community_members", {
      name,
      email,
      phone_prefix: phonePrefix,
      phone,
      source: String(body.source || "popup"),
      created_at: new Date().toISOString(),
    });

    // Fire and forget — email failure must not break signup
    sendWelcomeEmail(email, name).catch((e) =>
      console.error("[community/signup] welcome email failed:", e)
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: "Internal error", detail: String(err) },
      { status: 500 }
    );
  }
}
