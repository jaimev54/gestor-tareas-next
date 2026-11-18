import { SITE } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-zinc-600 sm:flex-row sm:items-center sm:justify-between dark:text-zinc-400">
        <p>
          {SITE.name} · Proyecto de portafolio hecho con Next.js y Supabase.
        </p>
        <a
          href={SITE.repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-zinc-900 hover:underline dark:text-zinc-100"
        >
          Ver en GitHub
        </a>
      </div>
    </footer>
  );
}
