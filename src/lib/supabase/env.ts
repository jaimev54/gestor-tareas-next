// Lee y valida las variables de Supabase una sola vez.
// Next sustituye `process.env.NEXT_PUBLIC_*` en el build, por eso se escriben literalmente.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !publishableKey) {
  throw new Error(
    "Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (en local: .env.local; en Vercel: Settings → Environment Variables)",
  );
}

export const supabaseEnv = { url, publishableKey };

/** URL pública de la app, sin barra final. Se usa en los enlaces de los correos. */
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
