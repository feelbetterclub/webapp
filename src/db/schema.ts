import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const classes = sqliteTable("classes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  durationMinutes: integer("duration_minutes").notNull().default(60),
  maxCapacity: integer("max_capacity").notNull().default(15),
  icon: text("icon").default("Sun"),
  location: text("location"),
  locationUrl: text("location_url"),
});

export const schedules = sqliteTable("schedules_v2", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  classId: integer("class_id")
    .references(() => classes.id)
    .notNull(),
  date: text("date").notNull(), // "2026-04-15" — specific date
  startTime: text("start_time").notNull(), // "09:00"
  instructor: text("instructor"),
  price: integer("price"), // cents — null means free / donation-based
  maxCapacity: integer("max_capacity"), // override class default — null = use class default
});

export const bookings = sqliteTable("bookings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  scheduleId: integer("schedule_id")
    .references(() => schedules.id)
    .notNull(),
  date: text("date").notNull(), // "2026-04-15"
  userName: text("user_name").notNull(),
  userEmail: text("user_email").notNull(),
  userPhone: text("user_phone"),
  status: text("status").notNull().default("confirmed"),
  cancelToken: text("cancel_token"),
  createdAt: text("created_at").notNull(),
});

export const locations = sqliteTable("locations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  url: text("url"),
});

export type LocationRow = typeof locations.$inferSelect;

export const instructors = sqliteTable("instructors", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
});

export type InstructorRow = typeof instructors.$inferSelect;
export type ClassRow = typeof classes.$inferSelect;
export type ScheduleRow = typeof schedules.$inferSelect;
export type BookingRow = typeof bookings.$inferSelect;

export const communityMembers = sqliteTable("community_members", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phonePrefix: text("phone_prefix").notNull(),
  phone: text("phone").notNull(),
  source: text("source").default("popup"),
  createdAt: text("created_at").notNull(),
});

export type CommunityMemberRow = typeof communityMembers.$inferSelect;

export const waitlist = sqliteTable("waitlist", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  scheduleId: integer("schedule_id")
    .references(() => schedules.id)
    .notNull(),
  date: text("date").notNull(),
  userName: text("user_name").notNull(),
  userEmail: text("user_email").notNull(),
  userPhone: text("user_phone"),
  position: integer("position").notNull(), // 1-5
  status: text("status").notNull().default("waiting"), // waiting | promoted | expired
  createdAt: text("created_at").notNull(),
});

export type WaitlistRow = typeof waitlist.$inferSelect;
