import { SiteLogo } from "@/components/layout/SiteLogo";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

// Layout compartido por login, registro y recuperación de contraseña.
// "(auth)" es un grupo de rutas: los paréntesis no aparecen en la URL.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main
      id="contenido"
      className="relative flex flex-1 flex-col items-center justify-center bg-zinc-50 px-4 py-12 dark:bg-zinc-950"
    >
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="mb-8">
        <SiteLogo />
      </div>
      <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8 dark:border-zinc-800 dark:bg-zinc-900">
        {children}
      </div>
    </main>
  );
}
