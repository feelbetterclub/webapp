import { createClient } from "@libsql/client";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const client = createClient({
  url: process.env.TURSO_DATABASE_URL || "file:feel-better.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function run() {
  const tables = await client.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
  console.log("Tables:", tables.rows.map(r => r.name));

  for (const row of tables.rows) {
    const cols = await client.execute(`PRAGMA table_info(${row.name})`);
    console.log(`\n${row.name}:`, cols.rows.map(c => `${c.name} (${c.type})`).join(", "));
  }
}

run().catch(console.error);
