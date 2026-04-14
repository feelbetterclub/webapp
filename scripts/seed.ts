import { createClient } from "@libsql/client";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const client = createClient({
  url: process.env.TURSO_DATABASE_URL || "file:feel-better.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function seed() {
  // Create tables
  await client.executeMultiple(`
    CREATE TABLE IF NOT EXISTS classes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      duration_minutes INTEGER NOT NULL DEFAULT 60,
      max_capacity INTEGER NOT NULL DEFAULT 15,
      icon TEXT DEFAULT 'Sun',
      location TEXT,
      location_url TEXT
    );

    CREATE TABLE IF NOT EXISTS schedules_v2 (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      class_id INTEGER NOT NULL REFERENCES classes(id),
      date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      instructor TEXT
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      schedule_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      user_name TEXT NOT NULL,
      user_email TEXT NOT NULL,
      user_phone TEXT,
      status TEXT NOT NULL DEFAULT 'confirmed',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS instructors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT
    );

    CREATE TABLE IF NOT EXISTS locations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      url TEXT
    );
  `);

  const result = await client.execute("SELECT COUNT(*) as count FROM classes");
  const count = result.rows[0]?.count as number;
  if (count > 0) {
    console.log("Database already seeded. Skipping.");
    process.exit(0);
  }

  console.log("Seeding database...");
  // Seed via raw SQL since Drizzle has issues with Turso autoincrement
  const classesData = [
    ["Mobility Flow", "Deep mobility work for kiters and surfers. Improve rotation and prevent injuries.", 60, 15],
    ["Strength Flow", "Functional core and upper body strength for watersports athletes.", 50, 12],
    ["Breathwork", "Breathing techniques for energy, stress reduction and focus.", 45, 20],
    ["Pilates Flow", "Low-impact exercises for core strength and posture recovery.", 50, 15],
    ["Sound Healing", "Deep relaxation with tibetan bowls and sound frequencies.", 60, 15],
    ["Holistic Nutrition", "Workshops on whole foods for recovery and wellbeing.", 90, 10],
  ];

  for (const c of classesData) {
    await client.execute({
      sql: "INSERT INTO classes (name, description, duration_minutes, max_capacity) VALUES (?, ?, ?, ?)",
      args: c,
    });
  }

  console.log(`  - ${classesData.length} classes seeded`);
  console.log("Database seeded successfully!");
}

seed().catch(console.error);
