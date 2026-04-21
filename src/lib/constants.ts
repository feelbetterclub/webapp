export const DEFAULTS: { durationMinutes: number; maxCapacity: number; icon: string } = {
  durationMinutes: 60,
  maxCapacity: 15,
  icon: "Sun",
};

export const BOOKING_STATUS = {
  CONFIRMED: "confirmed" as const,
  CANCELLED: "cancelled" as const,
};

export const WAITLIST_STATUS = {
  WAITING: "waiting" as const,
  PROMOTED: "promoted" as const,
  EXPIRED: "expired" as const,
};

export const WAITLIST_MAX = 5;
