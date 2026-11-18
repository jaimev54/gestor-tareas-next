import "server-only";

import { cache } from "react";

import { requireUser } from "./user";

/**
 * Usuario actual + su perfil. `cache` de React evita repetir la consulta
 * si varios componentes la piden en la misma petición (barra de navegación y página).
 */
export const getCurrentProfile = cache(async () => {
  const { supabase, userId, email } = await requireUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", userId)
    .maybeSingle();

  const name = profile?.full_name?.trim() || email?.split("@")[0] || "Usuario";
  return { userId, email, name, initials: initialsOf(name) };
});

function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
