import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "@/types/database";

import { supabaseEnv } from "./env";

/**
 * Cliente de Supabase para componentes con "use client" (se ejecutan en el navegador).
 * Usa la clave publishable: los datos los protege RLS en la base, no esta clave.
 */
export function createClient() {
  return createBrowserClient<Database>(supabaseEnv.url, supabaseEnv.publishableKey);
}
