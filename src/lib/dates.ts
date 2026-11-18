// Utilidades de fechas para due_date, que en la base es tipo `date` ("2026-11-18", sin hora ni zona).
// Se trabaja con strings YYYY-MM-DD para evitar los errores típicos de zona horaria
// (new Date("2026-11-18") es medianoche UTC = el día anterior en México).

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** ¿Es un "YYYY-MM-DD" que existe en el calendario? (rechaza 2026-02-30). */
export function isValidIsoDate(value: string) {
  if (!ISO_DATE.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

/** Fecha local del navegador como "YYYY-MM-DD". */
export function localIsoDate(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const shortFormat = new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short", timeZone: "UTC" });
const longFormat = new Intl.DateTimeFormat("es-MX", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

/**
 * "18 nov" (o "18 nov 2027" si no es del año indicado).
 * Usa UTC a propósito: da el mismo texto en el servidor y en el navegador.
 */
export function formatIsoDate(value: string, currentYear?: number) {
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return currentYear === undefined || y === currentYear ? shortFormat.format(date) : longFormat.format(date);
}

/** Días entre dos fechas ISO (b - a). */
export function daysBetween(a: string, b: string) {
  const toUtc = (v: string) => {
    const [y, m, d] = v.split("-").map(Number);
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((toUtc(b) - toUtc(a)) / 86_400_000);
}
