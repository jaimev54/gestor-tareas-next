// Zona horaria del usuario, para que el servidor sepa qué día es "hoy" para él.
// El navegador la guarda en la cookie "tz" (TimezoneSync) y el servidor la lee aquí.

export const TZ_COOKIE = "tz";
export const DEFAULT_TIMEZONE = "America/Mexico_City";

/** ¿Es una zona IANA válida? ("America/Monterrey" sí, "Marte/Olympus" no) */
export function isValidTimeZone(tz: string) {
  if (!tz || tz.length > 64) return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/** Fecha "YYYY-MM-DD" de `date` en la zona indicada. */
export function isoDateInTimeZone(date: Date, timeZone: string) {
  // en-CA formatea como 2026-11-18
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/** Suma días a una fecha ISO sin pasar por la zona horaria local. */
export function addDaysIso(iso: string, days: number) {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + days));
  return date.toISOString().slice(0, 10);
}
