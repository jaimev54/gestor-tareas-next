import { Suspense } from "react";

import { AppNavLinks } from "@/components/layout/AppNavLinks";
import { SiteLogo } from "@/components/layout/SiteLogo";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { TimezoneSync } from "@/components/layout/TimezoneSync";
import { UserMenu, UserMenuSkeleton } from "@/components/layout/UserMenu";
import { DEFAULT_AFTER_LOGIN } from "@/lib/routes";

// Layout del área privada (todas las rutas dentro de "(app)").
// La barra es estática salvo el menú de usuario, que lee la sesión dentro de <Suspense>.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-6">
            <SiteLogo href={DEFAULT_AFTER_LOGIN} compact />
            <nav aria-label="Principal">
              <AppNavLinks />
            </nav>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Suspense fallback={<UserMenuSkeleton />}>
              <UserMenu />
            </Suspense>
          </div>
        </div>
      </header>
      <TimezoneSync />
      <main id="contenido" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        {children}
      </main>
    </>
  );
}
