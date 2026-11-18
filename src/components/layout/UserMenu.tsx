import { LogOut } from "lucide-react";

import { logout } from "@/lib/auth/actions";
import { getCurrentProfile } from "@/lib/auth/profile";

/** Avatar con iniciales, nombre y botón de cerrar sesión. Lee la sesión: va dentro de <Suspense>. */
export async function UserMenu() {
  const { name, email, initials } = await getCurrentProfile();

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2" title={email}>
        <span
          aria-hidden="true"
          className="flex size-8 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
        >
          {initials}
        </span>
        <span className="hidden max-w-40 truncate text-sm font-medium sm:inline">{name}</span>
      </div>
      <form action={logout}>
        <button
          type="submit"
          aria-label="Cerrar sesión"
          title="Cerrar sesión"
          className="inline-flex size-9 items-center justify-center rounded-lg text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
        >
          <LogOut className="size-5" aria-hidden="true" />
        </button>
      </form>
    </div>
  );
}

export function UserMenuSkeleton() {
  return (
    <div className="flex items-center gap-2" aria-hidden="true">
      <span className="size-8 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
      <span className="hidden h-4 w-24 animate-pulse rounded bg-zinc-200 sm:inline dark:bg-zinc-800" />
    </div>
  );
}
