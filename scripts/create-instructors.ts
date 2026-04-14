import { createClient } from "@libsql/client";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const client = createClient({
  url: process.env.TURSO_DATABASE_URL || "file:feel-better.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function run() {
  await client.executeMultiple(`
    CREATE TABLE IF NOT EXISTS instructors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT
    );
  `);

  const existing = await client.execute("SELECT COUNT(*) as count FROM instructors");
  const count = existing.rows[0]?.count as number;

  if (count === 0) {
    await client.execute({ sql: "INSERT INTO instructors (name) VALUES (?)", args: ["Monika"] });
    console.log("Instructor 'Monika' created.");
  } else {
    console.log(`Instructors table already has ${count} entries.`);
  }

  const result = await client.execute("SELECT * FROM instructors");
  console.log("Instructors:", result.rows);
}

run().catch(console.error);
