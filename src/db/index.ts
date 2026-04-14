import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";
import { ensureTables } from "./ensure-tables";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL || "file:feel-better.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Ensure tables exist on first connection
ensureTables().catch(console.error);

export const db = drizzle(client, { schema });
export { client };
