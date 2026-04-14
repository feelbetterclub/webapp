export const DEFAULTS: { durationMinutes: number; maxCapacity: number; icon: string } = {
  durationMinutes: 60,
  maxCapacity: 15,
  icon: "Sun",
};

export const BOOKING_STATUS = {
  CONFIRMED: "confirmed" as const,
  CANCELLED: "cancelled" as const,
};
