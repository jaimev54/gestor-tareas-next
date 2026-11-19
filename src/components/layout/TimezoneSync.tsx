"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { TZ_COOKIE } from "@/lib/timezone";

/**
 * Guarda la zona horaria del navegador en una cookie para que el servidor
 * sepa qué día es "hoy" para el usuario. Si cambia (primera visita, viaje),
 * refresca la página para que los filtros de fecha usen la zona correcta.
 */
export function TimezoneSync() {
  const router = useRouter();

  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const current = document.cookie.match(new RegExp(`(?:^|; )${TZ_COOKIE}=([^;]*)`))?.[1];
    if (!tz || decodeURIComponent(current ?? "") === tz) return;

    document.cookie = `${TZ_COOKIE}=${encodeURIComponent(tz)}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }, [router]);

  return null;
}
