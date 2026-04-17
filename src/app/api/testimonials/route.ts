import { NextResponse } from "next/server";
import { client } from "@/db";

/**
 * GET /api/testimonials — public endpoint returning visible testimonials.
 */
export async function GET() {
  try {
    const result = await client.execute(
      "SELECT id, author, text, class_type as classType, rating FROM testimonials WHERE visible = 1 ORDER BY created_at DESC LIMIT 20"
    );
    return NextResponse.json(result.rows);
  } catch (err) {
    return NextResponse.json({ error: "Internal error", detail: String(err) }, { status: 500 });
  }
}
