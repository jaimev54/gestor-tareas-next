import Link from "next/link";

import { ROUTES } from "@/lib/routes";

// Layout compartido por login, registro y recuperación de contraseña.
// "(auth)" es un grupo de rutas: los paréntesis no aparecen en la URL.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-4 py-12 dark:bg-zinc-950">
      <Link
        href={ROUTES.home}
        className="mb-8 text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100"
      >
        Gestor de tareas
      </Link>
      <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8 dark:border-zinc-800 dark:bg-zinc-900">
        {children}
      </div>
    </main>
  );
}
