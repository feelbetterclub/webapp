import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "../src/db/schema";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const client = createClient({
  url: process.env.TURSO_DATABASE_URL || "file:feel-better.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const db = drizzle(client, { schema });

async function seed() {
  // Create tables
  await client.executeMultiple(`
    CREATE TABLE IF NOT EXISTS classes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      duration_minutes INTEGER NOT NULL DEFAULT 60,
      max_capacity INTEGER NOT NULL DEFAULT 15,
      icon TEXT DEFAULT 'Sun'
    );

    CREATE TABLE IF NOT EXISTS schedules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      class_id INTEGER NOT NULL REFERENCES classes(id),
      day_of_week INTEGER NOT NULL,
      start_time TEXT NOT NULL,
      instructor TEXT
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      schedule_id INTEGER NOT NULL REFERENCES schedules(id),
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
  `);

  // Check if data already exists
  const result = await client.execute("SELECT COUNT(*) as count FROM classes");
  const count = result.rows[0]?.count as number;
  if (count > 0) {
    console.log("Database already seeded. Skipping.");
    process.exit(0);
  }

  // Seed classes
  const classesData = [
    { name: "Mobility Flow", description: "Unlock your hips, shoulders and spine with deep mobility work. Designed for kiters and surfers to improve rotation and prevent injuries.", durationMinutes: 60, maxCapacity: 15, icon: "Sun" },
    { name: "Strength Flow", description: "Build functional core strength and upper body power. Perfect for watersports athletes seeking more stability on the board.", durationMinutes: 50, maxCapacity: 12, icon: "Heart" },
    { name: "Breathwork", description: "Master breathing techniques that boost energy, reduce stress and sharpen focus for better performance on and off the water.", durationMinutes: 45, maxCapacity: 20, icon: "Wind" },
    { name: "Pilates Flow", description: "Low-impact, high-precision exercises that strengthen your core, improve posture and accelerate recovery after intense water sessions.", durationMinutes: 50, maxCapacity: 15, icon: "Sparkles" },
    { name: "Sound Healing", description: "Deep relaxation through tibetan bowls and sound frequencies. Release tension and restore balance after intense training days.", durationMinutes: 60, maxCapacity: 15, icon: "Waves" },
    { name: "Holistic Nutrition", description: "Learn how to fuel your body with whole foods that enhance recovery, energy and overall wellbeing for active lifestyles.", durationMinutes: 90, maxCapacity: 10, icon: "Leaf" },
  ];

  for (const c of classesData) {
    await db.insert(schema.classes).values(c);
  }

  // Seed schedules (Lunes=1 ... Domingo=7)
  const schedulesData = [
    { classId: 1, dayOfWeek: 1, startTime: "07:30", instructor: "Monika" },
    { classId: 1, dayOfWeek: 3, startTime: "07:30", instructor: "Monika" },
    { classId: 1, dayOfWeek: 5, startTime: "08:00", instructor: "Monika" },
    { classId: 2, dayOfWeek: 2, startTime: "07:30", instructor: "Monika" },
    { classId: 2, dayOfWeek: 4, startTime: "07:30", instructor: "Monika" },
    { classId: 3, dayOfWeek: 1, startTime: "09:00", instructor: "Monika" },
    { classId: 3, dayOfWeek: 3, startTime: "09:00", instructor: "Monika" },
    { classId: 4, dayOfWeek: 2, startTime: "09:00", instructor: "Monika" },
    { classId: 4, dayOfWeek: 4, startTime: "09:00", instructor: "Monika" },
    { classId: 4, dayOfWeek: 6, startTime: "10:00", instructor: "Monika" },
    { classId: 5, dayOfWeek: 5, startTime: "19:00", instructor: "Monika" },
    { classId: 5, dayOfWeek: 6, startTime: "18:00", instructor: "Monika" },
    { classId: 6, dayOfWeek: 6, startTime: "12:00", instructor: "Monika" },
  ];

  for (const s of schedulesData) {
    await db.insert(schema.schedules).values(s);
  }

  console.log("Database seeded successfully!");
  console.log(`  - ${classesData.length} classes`);
  console.log(`  - ${schedulesData.length} schedules`);
}

seed().catch(console.error);
