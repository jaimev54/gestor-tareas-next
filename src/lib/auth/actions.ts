"use server";

import type { AuthError } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

import { type FormState, formDataToObject, validationError, withoutSecrets } from "@/lib/forms";
import { DEFAULT_AFTER_LOGIN, ROUTES, safeNextPath } from "@/lib/routes";
import { siteUrl } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  signupSchema,
} from "@/lib/validation/auth";

// Server Actions de autenticación. Cada una:
// 1. valida con Zod en el servidor, 2. llama a Supabase Auth,
// 3. devuelve un FormState (errores) o redirige (éxito).
// `redirect()` lanza una excepción interna de Next: va siempre fuera de try/catch.

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = formDataToObject(formData);
  const parsed = loginSchema.safeParse(values);
  if (!parsed.success) return validationError(parsed.error, withoutSecrets(values));

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    return { status: "error", message: authErrorMessage(error), values: withoutSecrets(values) };
  }

  redirect(safeNextPath(values.next));
}

export async function signup(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = formDataToObject(formData);
  const parsed = signupSchema.safeParse(values);
  if (!parsed.success) return validationError(parsed.error, withoutSecrets(values));

  const { email, password, fullName } = parsed.data;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName }, // lo copia el trigger handle_new_user a profiles
      emailRedirectTo: confirmUrl(DEFAULT_AFTER_LOGIN),
    },
  });
  if (error) {
    return { status: "error", message: authErrorMessage(error), values: withoutSecrets(values) };
  }

  // Si la confirmación por correo estuviera desactivada, ya habría sesión.
  if (data.session) redirect(DEFAULT_AFTER_LOGIN);

  // Mismo mensaje exista o no la cuenta: así no se puede averiguar qué correos están registrados.
  return {
    status: "success",
    message: `Te enviamos un correo a ${email}. Abre el enlace para activar tu cuenta.`,
  };
}

export async function requestPasswordReset(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const values = formDataToObject(formData);
  const parsed = forgotPasswordSchema.safeParse(values);
  if (!parsed.success) return validationError(parsed.error, values);

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: confirmUrl(ROUTES.resetPassword),
  });
  if (error?.code === "over_email_send_rate_limit") {
    return { status: "error", message: authErrorMessage(error), values };
  }

  return {
    status: "success",
    message: "Si existe una cuenta con ese correo, te llegará un enlace para crear una contraseña nueva.",
  };
}

export async function updatePassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = formDataToObject(formData);
  const parsed = resetPasswordSchema.safeParse(values);
  if (!parsed.success) return validationError(parsed.error, {});

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { status: "error", message: authErrorMessage(error) };

  redirect(DEFAULT_AFTER_LOGIN);
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(ROUTES.login);
}

// ---------------------------------------------------------------------

/** Enlace de los correos: pasa por /auth/confirm y luego va a `next`. */
function confirmUrl(next: string) {
  return `${siteUrl}${ROUTES.authConfirm}?next=${encodeURIComponent(next)}`;
}

/** Traduce los errores de Supabase Auth a mensajes para el usuario. */
function authErrorMessage(error: AuthError) {
  switch (error.code) {
    case "invalid_credentials":
      return "Correo o contraseña incorrectos.";
    case "email_not_confirmed":
      return "Aún no confirmas tu correo. Revisa tu bandeja de entrada (y la de spam).";
    case "weak_password":
      return "La contraseña es demasiado débil. Prueba con una más larga.";
    case "same_password":
      return "La contraseña nueva debe ser distinta de la actual.";
    case "over_email_send_rate_limit":
    case "over_request_rate_limit":
      return "Demasiados intentos. Espera unos minutos y vuelve a probar.";
    case "signup_disabled":
      return "El registro está desactivado en este momento.";
    case "session_not_found":
    case "session_expired":
      return "Tu sesión caducó. Pide un enlace nuevo.";
    default:
      console.error("[auth]", error.code, error.message);
      return "Algo salió mal. Inténtalo de nuevo.";
  }
}
