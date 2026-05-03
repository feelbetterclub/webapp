import { NextRequest, NextResponse } from "next/server";
import { client } from "@/db";
import { sendOnDemandConfirmation, sendOnDemandLeadNotification } from "@/lib/email";

/**
 * POST /api/requests
 *
 * Stores on-demand class requests (private or group of 5+).
 * We create a lightweight table on-the-fly to avoid needing a migration.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const phone = String(body.phone || "").trim();
    const groupSize = String(body.groupSize || "").trim();
    const preferredDate = String(body.preferredDate || "").trim();
    const notes = String(body.notes || "").trim();

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    await client.execute({
      sql: `INSERT INTO class_requests (name, email, phone, group_size, preferred_date, notes, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)`,
      args: [name, email, phone || null, groupSize || null, preferredDate || null, notes || null, new Date().toISOString()],
    });

    sendOnDemandConfirmation({ to: email, userName: name, groupSize: groupSize || undefined, preferredDate: preferredDate || undefined })
      .catch((err) => console.error("[email] sendOnDemandConfirmation failed:", err));
    sendOnDemandLeadNotification({ userName: name, userEmail: email, userPhone: phone || undefined, groupSize: groupSize || undefined, preferredDate: preferredDate || undefined, notes: notes || undefined })
      .catch((err) => console.error("[email] sendOnDemandLeadNotification failed:", err));

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Internal error", detail: String(err) }, { status: 500 });
  }
}
