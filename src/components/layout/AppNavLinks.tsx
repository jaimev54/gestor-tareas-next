"use client";

import { BarChart3, Columns3, FolderKanban, ListTodo, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { APP_NAV_LINKS, ROUTES, matchesPrefix } from "@/lib/routes";

const ICONS: Record<(typeof APP_NAV_LINKS)[number]["href"], LucideIcon> = {
  [ROUTES.tasks]: ListTodo,
  [ROUTES.board]: Columns3,
  [ROUTES.projects]: FolderKanban,
  [ROUTES.dashboard]: BarChart3,
};

/**
 * Enlaces del área privada. Marca el activo con aria-current (como routerLinkActive en Angular).
 * En móvil solo se ve el icono; el nombre sigue ahí para lectores de pantalla y como tooltip.
 */
export function AppNavLinks() {
  const pathname = usePathname();

  return (
    <ul className="flex items-center gap-0.5 sm:gap-1">
      {APP_NAV_LINKS.map(({ href, label }) => {
        const active = matchesPrefix(pathname, [href]);
        const Icon = ICONS[href];
        return (
          <li key={href}>
            <Link
              href={href}
              title={label}
              aria-current={active ? "page" : undefined}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 aria-[current=page]:bg-zinc-100 aria-[current=page]:text-zinc-900 sm:px-3 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 dark:aria-[current=page]:bg-zinc-800 dark:aria-[current=page]:text-zinc-100"
            >
              <Icon className="size-4 sm:hidden" aria-hidden="true" />
              <span className="sr-only sm:not-sr-only">{label}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
