import "server-only";

import { cookies } from "next/headers";
import { connection } from "next/server";

import { DEFAULT_TIMEZONE, TZ_COOKIE, isValidTimeZone, isoDateInTimeZone } from "./timezone";

/** "Hoy" ("YYYY-MM-DD") en la zona horaria del usuario (cookie "tz"). */
export async function getUserToday() {
  await connection(); // depende de la hora actual: se calcula en cada petición
  const tz = (await cookies()).get(TZ_COOKIE)?.value ?? "";
  return isoDateInTimeZone(new Date(), isValidTimeZone(tz) ? tz : DEFAULT_TIMEZONE);
}
