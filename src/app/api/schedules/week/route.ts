import { NextRequest, NextResponse } from "next/server";
import { client } from "@/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    if (!from || !to) {
      return NextResponse.json(
        { error: "from and to parameters are required" },
        { status: 400 },
      );
    }

    const result = await client.execute({
      sql: `SELECT DISTINCT date FROM schedules_v2 WHERE date >= ? AND date <= ? ORDER BY date`,
      args: [from, to],
    });

    const dates = result.rows.map((r) => r.date as string);

    return NextResponse.json(dates);
  } catch (err) {
    return NextResponse.json(
      { error: "Internal error", detail: String(err) },
      { status: 500 },
    );
  }
}
