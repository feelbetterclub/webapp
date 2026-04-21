export const DEFAULTS: { durationMinutes: number; maxCapacity: number; queueCapacity: number; icon: string } = {
  durationMinutes: 60,
  maxCapacity: 10,
  queueCapacity: 5,
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

/** @deprecated Use per-class/session queueCapacity instead */
export const WAITLIST_MAX = 5;
