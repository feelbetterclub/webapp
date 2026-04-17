import { createClient } from "@libsql/client";

let initialized = false;

export async function ensureTables() {
  if (initialized) return;

  const client = createClient({
    url: process.env.TURSO_DATABASE_URL || "file:feel-better.db",
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

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
      cancel_token TEXT,
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

    CREATE TABLE IF NOT EXISTS community_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone_prefix TEXT NOT NULL,
      phone TEXT NOT NULL,
      source TEXT DEFAULT 'popup',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS testimonials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      author TEXT NOT NULL,
      text TEXT NOT NULL,
      class_type TEXT,
      rating INTEGER DEFAULT 5,
      visible INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL,
      reply_email TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS class_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      group_size TEXT,
      preferred_date TEXT,
      notes TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL
    );
  `);

  // Idempotent ALTERs for pre-existing DBs. libSQL lacks IF NOT EXISTS
  // on ADD COLUMN, so swallow "duplicate column" errors.
  const safeAlter = async (sql: string) => {
    try {
      await client.execute(sql);
    } catch (err) {
      const msg = String(err);
      if (!/duplicate column|already exists/i.test(msg)) {
        throw err;
      }
    }
  };

  await safeAlter("ALTER TABLE bookings ADD COLUMN cancel_token TEXT");

  initialized = true;
}
