import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

export function safeArray<T>(data: unknown): T[] {
  return Array.isArray(data) ? (data as T[]) : [];
}

export function getLocale(lang: string): string {
  const locales: Record<string, string> = { es: "es-ES", en: "en-US", pt: "pt-BR" };
  return locales[lang] || "en-US";
}

export function formatDateLocalized(
  dateStr: string,
  lang: string,
  options?: Intl.DateTimeFormatOptions
): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString(
    getLocale(lang),
    options || { weekday: "long", day: "numeric", month: "long" }
  );
}

export function escapeCSVField(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
