export type BookingStatus = "confirmed" | "cancelled";

export interface ClassItem {
  id: number;
  name: string;
  description: string | null;
  durationMinutes: number;
  maxCapacity: number;
  icon: string | null;
  location: string | null;
  locationUrl: string | null;
}

export interface LocationItem {
  id: number;
  name: string;
  url: string | null;
}

export interface ScheduleItem {
  id: number;
  classId: number;
  className: string;
  date: string;
  startTime: string;
  instructor: string | null;
}

export interface ScheduleWithAvailability {
  id: number;
  classId: number;
  date: string;
  startTime: string;
  instructor: string | null;
  className: string;
  classDescription: string | null;
  durationMinutes: number;
  maxCapacity: number;
  icon: string | null;
  location: string | null;
  locationUrl: string | null;
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
