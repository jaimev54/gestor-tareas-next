"use client";

import { useSyncExternalStore } from "react";

import { localIsoDate } from "@/lib/dates";

// Re-evaluar cada minuto por si la página queda abierta al cambiar de día.
function subscribe(callback: () => void) {
  const timer = setInterval(callback, 60_000);
  return () => clearInterval(timer);
}

/**
 * "Hoy" según la zona horaria del navegador ("YYYY-MM-DD"), o null en el servidor.
 * El servidor (Vercel, en UTC) no sabe tu zona: a las 20:00 en Monterrey ya sería "mañana".
 * Por eso lo que depende de "hoy" (vencida, vence hoy) se calcula en el navegador.
 */
export function useToday() {
  return useSyncExternalStore(subscribe, () => localIsoDate(), () => null);
}
