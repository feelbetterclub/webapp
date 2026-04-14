import { createClient } from "@libsql/client";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const client = createClient({
  url: process.env.TURSO_DATABASE_URL || "file:feel-better.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function run() {
  await client.executeMultiple(`
    CREATE TABLE IF NOT EXISTS locations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      url TEXT
    );
    ALTER TABLE classes ADD COLUMN location TEXT;
    ALTER TABLE classes ADD COLUMN location_url TEXT;
  `);
  console.log("Locations table created and classes columns added.");
}

run().catch((e) => {
  // ALTER TABLE will fail if columns already exist, that's OK
  if (e.message?.includes("duplicate column")) {
    console.log("Columns already exist. Done.");
  } else {
    console.error(e);
  }
});
