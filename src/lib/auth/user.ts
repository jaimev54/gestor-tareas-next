import "server-only";

import { redirect } from "next/navigation";

import { ROUTES } from "@/lib/routes";
import { createClient } from "@/lib/supabase/server";

/**
 * Devuelve el usuario con sesión o redirige al login.
 * Úsalo en cada página o acción protegida: el proxy solo es la primera barrera.
 */
export async function requireUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) redirect(ROUTES.login);

  return {
    supabase,
    userId: data.claims.sub,
    email: data.claims.email as string | undefined,
  };
}
