import Link from "next/link";
import { Suspense } from "react";

import { buttonStyles } from "@/components/ui/button";
import { DEFAULT_AFTER_LOGIN, ROUTES } from "@/lib/routes";
import { createClient } from "@/lib/supabase/server";

import { SiteLogo } from "./SiteLogo";
import { ThemeToggle } from "./ThemeToggle";

function GuestActions() {
  return (
    <>
      <Link href={ROUTES.login} className={buttonStyles({ variant: "ghost", size: "sm" })}>
        Iniciar sesión
      </Link>
      <Link href={ROUTES.signup} className={buttonStyles({ size: "sm" })}>
        Crear cuenta
      </Link>
    </>
  );
}

/** Si ya hay sesión, muestra "Ir a mis tareas" en lugar de login/registro. */
async function SessionActions() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) return <GuestActions />;

  return (
    <Link href={DEFAULT_AFTER_LOGIN} className={buttonStyles({ size: "sm" })}>
      Ir a mis tareas
    </Link>
  );
}

export function PublicHeader() {
  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4">
        <SiteLogo compact />
        <nav aria-label="Cuenta" className="flex items-center gap-1 sm:gap-2">
          <ThemeToggle />
          {/* Mientras se comprueba la sesión se muestran los botones de visitante. */}
          <Suspense fallback={<GuestActions />}>
            <SessionActions />
          </Suspense>
        </nav>
      </div>
    </header>
  );
}
