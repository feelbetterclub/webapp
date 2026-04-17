import { createClient } from "@libsql/client";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const client = createClient({
  url: process.env.TURSO_DATABASE_URL || "file:feel-better.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function run() {
  // Check current table
  try {
    const info = await client.execute("PRAGMA table_info(locations)");
    console.log("Current table_info:", info.rows);
  } catch {
    console.log("Table does not exist, creating...");
  }

  // Drop and recreate
  await client.executeMultiple(`
    DROP TABLE IF EXISTS locations;
    CREATE TABLE locations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      url TEXT
    );
  `);
  console.log("Table recreated.");

  // Test insert
  await client.execute({
    sql: "INSERT INTO locations (name, url) VALUES (?, ?)",
    args: ["Dos Mares Tarifa", "https://maps.app.goo.gl/EsUG48yJNVeh243S6"],
  });
  console.log("Test insert OK.");

  const result = await client.execute("SELECT * FROM locations");
  console.log("Data:", result.rows);
}

run().catch(console.error);
