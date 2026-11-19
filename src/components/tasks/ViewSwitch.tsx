import { Columns3, List } from "lucide-react";
import Link from "next/link";

import { ROUTES } from "@/lib/routes";
import { type TaskFilters, tasksUrl } from "@/lib/tasks/filters";

type ViewSwitchProps = {
  current: "list" | "board";
  filters: TaskFilters;
};

/** Cambia entre lista y tablero conservando los filtros de la URL. */
export function ViewSwitch({ current, filters }: ViewSwitchProps) {
  const views = [
    // El tablero no usa el filtro de estado (sus columnas ya son los estados).
    { id: "list", label: "Lista", icon: List, href: tasksUrl(filters, ROUTES.tasks) },
    { id: "board", label: "Tablero", icon: Columns3, href: tasksUrl({ ...filters, status: "" }, ROUTES.board) },
  ] as const;

  return (
    <nav aria-label="Vista" className="inline-flex rounded-lg border border-zinc-300 p-0.5 dark:border-zinc-700">
      {views.map(({ id, label, icon: Icon, href }) => (
        <Link
          key={id}
          href={href}
          aria-current={current === id ? "page" : undefined}
          className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-zinc-600 transition hover:text-zinc-900 aria-[current=page]:bg-zinc-900 aria-[current=page]:text-white dark:text-zinc-400 dark:hover:text-zinc-100 dark:aria-[current=page]:bg-zinc-100 dark:aria-[current=page]:text-zinc-900"
        >
          <Icon className="size-4" aria-hidden="true" />
          {label}
        </Link>
      ))}
    </nav>
  );
}
