"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { APP_NAV_LINKS, matchesPrefix } from "@/lib/routes";

/** Enlaces del área privada. Marca el activo con aria-current (como routerLinkActive en Angular). */
export function AppNavLinks() {
  const pathname = usePathname();

  return (
    <ul className="flex items-center gap-0.5 sm:gap-1">
      {APP_NAV_LINKS.map(({ href, label }) => {
        const active = matchesPrefix(pathname, [href]);
        return (
          <li key={href}>
            <Link
              href={href}
              aria-current={active ? "page" : undefined}
              className="rounded-lg px-2 py-2 text-sm font-medium text-zinc-600 sm:px-3 transition hover:bg-zinc-100 hover:text-zinc-900 aria-[current=page]:bg-zinc-100 aria-[current=page]:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 dark:aria-[current=page]:bg-zinc-800 dark:aria-[current=page]:text-zinc-100"
            >
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
