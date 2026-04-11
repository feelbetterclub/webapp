import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "../src/db/schema";
import path from "path";

const dbPath = path.join(process.cwd(), "feel-better.db");
const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

// Create tables
sqlite.exec(`
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
`);

const db = drizzle(sqlite, { schema });

// Check if data already exists
const existing = sqlite.prepare("SELECT COUNT(*) as count FROM classes").get() as { count: number };
if (existing.count > 0) {
  console.log("Database already seeded. Skipping.");
  process.exit(0);
}

// Seed classes
const classesData = [
  { name: "Yoga", description: "Conecta cuerpo y mente con sesiones adaptadas a todos los niveles. Hatha, Vinyasa y Yin yoga.", durationMinutes: 60, maxCapacity: 15, icon: "Sun" },
  { name: "Pilates", description: "Fortalece tu core y mejora tu postura con ejercicios de bajo impacto y alta efectividad.", durationMinutes: 50, maxCapacity: 12, icon: "Heart" },
  { name: "Breathwork", description: "Aprende técnicas de respiración que reducen el estrés y aumentan tu energía vital.", durationMinutes: 45, maxCapacity: 20, icon: "Wind" },
  { name: "Meditación", description: "Encuentra calma interior con prácticas guiadas de mindfulness y meditación profunda.", durationMinutes: 30, maxCapacity: 25, icon: "Sparkles" },
  { name: "Sound Healing", description: "Experimenta la sanación a través de frecuencias sonoras con cuencos tibetanos y gongs.", durationMinutes: 60, maxCapacity: 15, icon: "Waves" },
  { name: "Nutrición Holística", description: "Aprende a nutrir tu cuerpo con alimentos que potencian tu bienestar integral.", durationMinutes: 90, maxCapacity: 10, icon: "Leaf" },
];

for (const c of classesData) {
  db.insert(schema.classes).values(c).run();
}

// Seed schedules (Lunes=1 ... Domingo=7)
const schedulesData = [
  // Yoga: Lunes, Miércoles, Viernes
  { classId: 1, dayOfWeek: 1, startTime: "08:00", instructor: "Laura" },
  { classId: 1, dayOfWeek: 1, startTime: "18:00", instructor: "Laura" },
  { classId: 1, dayOfWeek: 3, startTime: "08:00", instructor: "Laura" },
  { classId: 1, dayOfWeek: 3, startTime: "18:00", instructor: "Laura" },
  { classId: 1, dayOfWeek: 5, startTime: "09:00", instructor: "Laura" },
  // Pilates: Martes, Jueves
  { classId: 2, dayOfWeek: 2, startTime: "09:00", instructor: "Carlos" },
  { classId: 2, dayOfWeek: 2, startTime: "19:00", instructor: "Carlos" },
  { classId: 2, dayOfWeek: 4, startTime: "09:00", instructor: "Carlos" },
  { classId: 2, dayOfWeek: 4, startTime: "19:00", instructor: "Carlos" },
  // Breathwork: Lunes, Miércoles
  { classId: 3, dayOfWeek: 1, startTime: "10:00", instructor: "Ana" },
  { classId: 3, dayOfWeek: 3, startTime: "10:00", instructor: "Ana" },
  // Meditación: Martes, Jueves, Sábado
  { classId: 4, dayOfWeek: 2, startTime: "07:30", instructor: "Ana" },
  { classId: 4, dayOfWeek: 4, startTime: "07:30", instructor: "Ana" },
  { classId: 4, dayOfWeek: 6, startTime: "10:00", instructor: "Ana" },
  // Sound Healing: Viernes, Sábado
  { classId: 5, dayOfWeek: 5, startTime: "19:00", instructor: "Miguel" },
  { classId: 5, dayOfWeek: 6, startTime: "18:00", instructor: "Miguel" },
  // Nutrición: Sábado
  { classId: 6, dayOfWeek: 6, startTime: "12:00", instructor: "Sara" },
];

for (const s of schedulesData) {
  db.insert(schema.schedules).values(s).run();
}

// Seed some bookings for today
const today = new Date().toISOString().split("T")[0];
const bookingsData = [
  { scheduleId: 1, date: today, userName: "María García", userEmail: "maria@email.com", userPhone: "612345678", status: "confirmed", createdAt: new Date().toISOString() },
  { scheduleId: 1, date: today, userName: "Pedro López", userEmail: "pedro@email.com", userPhone: "623456789", status: "confirmed", createdAt: new Date().toISOString() },
  { scheduleId: 6, date: today, userName: "Ana Martín", userEmail: "ana@email.com", userPhone: "634567890", status: "confirmed", createdAt: new Date().toISOString() },
];

for (const b of bookingsData) {
  db.insert(schema.bookings).values(b).run();
}

console.log("Database seeded successfully!");
console.log(`  - ${classesData.length} classes`);
console.log(`  - ${schedulesData.length} schedules`);
console.log(`  - ${bookingsData.length} bookings`);
