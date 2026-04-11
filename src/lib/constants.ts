export const DEFAULTS: { durationMinutes: number; maxCapacity: number; icon: string } = {
  durationMinutes: 60,
  maxCapacity: 15,
  icon: "Sun",
};

export const NAV_LINKS = [
  { href: "/#servicios", label: "Servicios" },
  { href: "/#nosotros", label: "Nosotros" },
  { href: "/#contacto", label: "Contacto" },
] as const;
