import { CheckSquare } from "lucide-react";
import Link from "next/link";

import { SITE } from "@/lib/site";

type SiteLogoProps = {
  href?: string;
  /** En pantallas pequeñas muestra solo el icono (el nombre queda para lectores de pantalla). */
  compact?: boolean;
};

export function SiteLogo({ href = "/", compact = false }: SiteLogoProps) {
  return (
    <Link
      href={href}
      className="inline-flex shrink-0 items-center gap-2 rounded-lg text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100"
    >
      <span className="flex size-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
        <CheckSquare className="size-5" aria-hidden="true" />
      </span>
      <span className={compact ? "sr-only sm:not-sr-only" : undefined}>{SITE.name}</span>
    </Link>
  );
}
