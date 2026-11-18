import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { DEFAULT_AFTER_LOGIN, GUEST_ONLY, PROTECTED_PREFIXES, ROUTES, matchesPrefix } from "@/lib/routes";

import type { Database } from "@/types/database";

import { supabaseEnv } from "./env";

/**
 * Se ejecuta en cada petición (desde src/proxy.ts):
 * 1. Renueva el token de sesión si caducó y lo guarda en las cookies.
 * 2. Redirige según haya o no sesión (como un guard de Angular, pero en el servidor).
 *
 * Es una comprobación "optimista" para la navegación: la seguridad real de los
 * datos la dan RLS en la base y las comprobaciones en cada Server Action.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(supabaseEnv.url, supabaseEnv.publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        // Copiamos las cookies nuevas a la petición (para el resto del render)
        // y a la respuesta (para el navegador).
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
        Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
      },
    },
  });

  // getClaims() valida el JWT (no basta con leer la cookie: se podría falsificar).
  // No metas código entre createServerClient y esta llamada.
  const { data } = await supabase.auth.getClaims();
  const isLoggedIn = Boolean(data?.claims);
  const { pathname, search } = request.nextUrl;

  if (!isLoggedIn && matchesPrefix(pathname, PROTECTED_PREFIXES)) {
    const url = request.nextUrl.clone();
    url.pathname = ROUTES.login;
    url.search = "";
    url.searchParams.set("next", pathname + search);
    return redirectWithCookies(url, response);
  }

  if (isLoggedIn && matchesPrefix(pathname, GUEST_ONLY)) {
    const url = request.nextUrl.clone();
    url.pathname = DEFAULT_AFTER_LOGIN;
    url.search = "";
    return redirectWithCookies(url, response);
  }

  return response;
}

/** Redirige conservando las cookies de sesión que Supabase acaba de renovar. */
function redirectWithCookies(url: URL, from: NextResponse) {
  const redirect = NextResponse.redirect(url);
  from.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  return redirect;
}
