import type { Metadata } from "next";
import Link from "next/link";

import { SiteLogo } from "@/components/layout/SiteLogo";
import { buttonStyles } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Página no encontrada",
  robots: { index: false },
};

// A diferencia del proyecto de Vue (SPA), aquí Next responde con un 404 real.
export default function NotFound() {
  return (
    <main
      id="contenido"
      className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-16 text-center"
    >
      <SiteLogo />
      <div>
        <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">Error 404</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Página no encontrada</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          La página que buscas no existe o se movió.
        </p>
      </div>
      <Link href={ROUTES.home} className={buttonStyles()}>
        Volver al inicio
      </Link>
    </main>
  );
}
