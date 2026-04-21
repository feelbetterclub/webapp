import { client } from "./index";
import type { InValue } from "@libsql/client";

/**
 * Allowed table names — whitelist prevents SQL injection via table parameter.
 */
const ALLOWED_TABLES = new Set([
  "classes",
  "schedules_v2",
  "bookings",
  "instructors",
  "locations",
  "community_members",
  "testimonials",
  "messages",
  "class_requests",
  "waitlist",
]);

function assertTable(table: string): void {
  if (!ALLOWED_TABLES.has(table)) {
    throw new Error(`Table "${table}" is not in the allowed whitelist`);
  }
}

/**
 * Raw insert helper that avoids Drizzle's autoincrement null issue with Turso.
 * Drizzle sends `INSERT INTO t (id, ...) VALUES (null, ...)` which Turso rejects.
 * This helper generates clean SQL without the id field.
 */
export async function rawInsert(
  table: string,
  data: Record<string, InValue>
): Promise<void> {
  assertTable(table);
  const keys = Object.keys(data);
  const placeholders = keys.map(() => "?").join(", ");
  const sql = `INSERT INTO ${table} (${keys.join(", ")}) VALUES (${placeholders})`;
  await client.execute({ sql, args: Object.values(data) });
}

/**
 * Raw select with optional WHERE conditions.
 */
export async function rawSelect(
  table: string,
  where?: Record<string, InValue>,
  orderBy?: string
) {
  assertTable(table);
  let sql = `SELECT * FROM ${table}`;
  const args: InValue[] = [];

  if (where && Object.keys(where).length > 0) {
    const conditions = Object.entries(where).map(([key]) => {
      args.push(where[key]);
      return `${key} = ?`;
    });
    sql += ` WHERE ${conditions.join(" AND ")}`;
  }

  if (orderBy) {
    // Sanitize orderBy: only allow simple column names + ASC/DESC
    if (!/^[a-zA-Z_]+( (ASC|DESC))?$/i.test(orderBy)) {
      throw new Error(`Invalid orderBy: "${orderBy}"`);
    }
    sql += ` ORDER BY ${orderBy}`;
  }

  return client.execute({ sql, args });
}
