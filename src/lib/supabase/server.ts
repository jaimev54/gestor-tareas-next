import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { connection } from "next/server";

import { supabaseEnv } from "./env";

/**
 * Cliente de Supabase para Server Components, Server Actions y Route Handlers.
 * Lee la sesión del usuario desde las cookies de la petición.
 * Crea uno nuevo en cada petición: nunca lo guardes en una variable global.
 */
export async function createClient() {
  // Con Cache Components, Next exige marcar explícitamente el código que depende
  // de cada petición. Supabase usa Date.now() para comprobar si el token caducó:
  // connection() indica "esto se ejecuta al recibir la petición, no al prerenderizar".
  await connection();
  const cookieStore = await cookies();

  return createServerClient(supabaseEnv.url, supabaseEnv.publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Los Server Components no pueden escribir cookies.
          // No pasa nada: el proxy (paso 3) se encarga de refrescar la sesión.
        }
      },
    },
  });
}
