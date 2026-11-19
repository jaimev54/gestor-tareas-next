import "server-only";

import { cookies } from "next/headers";
import { connection } from "next/server";

import { DEFAULT_TIMEZONE, TZ_COOKIE, isValidTimeZone, isoDateInTimeZone } from "./timezone";

/** Zona horaria del usuario (cookie "tz" que pone TimezoneSync), o la de México por defecto. */
export async function getUserTimeZone() {
  const tz = (await cookies()).get(TZ_COOKIE)?.value ?? "";
  return isValidTimeZone(tz) ? tz : DEFAULT_TIMEZONE;
}

/** "Hoy" ("YYYY-MM-DD") en la zona horaria del usuario. */
export async function getUserToday() {
  await connection(); // depende de la hora actual: se calcula en cada petición
  return isoDateInTimeZone(new Date(), await getUserTimeZone());
}
