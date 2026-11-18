import type { EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";

import { DEFAULT_AFTER_LOGIN, ROUTES, safeNextPath } from "@/lib/routes";
import { createClient } from "@/lib/supabase/server";

/**
 * Destino de los enlaces de los correos de Supabase (confirmar cuenta, recuperar contraseña).
 * Canjea el código del enlace por una sesión (cookies) y redirige a `next`.
 *
 * Acepta los dos formatos de enlace de Supabase:
 *  - `?code=...`               (plantillas por defecto, flujo PKCE: mismo navegador)
 *  - `?token_hash=...&type=...` (plantillas personalizadas: funciona en cualquier navegador)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const next = safeNextPath(searchParams.get("next"), DEFAULT_AFTER_LOGIN);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  const supabase = await createClient();
  let ok = false;

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    ok = !error;
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    ok = !error;
  }

  const destination = ok ? next : `${ROUTES.login}?error=enlace-invalido`;
  return NextResponse.redirect(new URL(destination, request.nextUrl.origin));
}
