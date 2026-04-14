export type BookingStatus = "confirmed" | "cancelled";

export interface ClassItem {
  id: number;
  name: string;
  description: string | null;
  durationMinutes: number;
  maxCapacity: number;
  icon: string | null;
}

export interface ScheduleItem {
  id: number;
  classId: number;
  className: string;
  dayOfWeek: number;
  startTime: string;
  instructor: string | null;
}

export interface ScheduleWithAvailability extends ScheduleItem {
  classDescription: string | null;
  durationMinutes: number;
  maxCapacity: number;
  icon: string | null;
  currentBookings: number;
  spotsLeft: number;
}

export interface BookingItem {
  id: number;
  scheduleId: number;
  date: string;
  userName: string;
  userEmail: string;
  userPhone: string | null;
  status: BookingStatus;
  createdAt: string;
  className: string;
  startTime: string;
  dayOfWeek: number;
  instructor: string | null;
}
