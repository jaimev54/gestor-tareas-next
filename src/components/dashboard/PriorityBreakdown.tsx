import Link from "next/link";

import { PRIORITY_LABELS, type TaskPriority } from "@/lib/tasks/constants";
import { type PriorityParam, tasksUrl } from "@/lib/tasks/filters";

const ORDER: { priority: TaskPriority; param: PriorityParam; fill: string }[] = [
  { priority: "high", param: "alta", fill: "bg-red-500" },
  { priority: "medium", param: "media", fill: "bg-amber-500" },
  { priority: "low", param: "baja", fill: "bg-emerald-500" },
];

/**
 * Pendientes por prioridad: barra segmentada fina (sin texto dentro) + leyenda con nombre y cifra.
 * Los segmentos se separan con un hueco de 2px del color del fondo, no con bordes.
 */
export function PriorityBreakdown({ byPriority }: { byPriority: Record<TaskPriority, number> }) {
  const total = ORDER.reduce((sum, { priority }) => sum + byPriority[priority], 0);

  if (total === 0) {
    return <p className="text-sm text-zinc-500">No tienes tareas pendientes.</p>;
  }

  const summary = ORDER.map(({ priority }) => `${PRIORITY_LABELS[priority]}: ${byPriority[priority]}`).join(", ");

  return (
    <div>
      <div role="img" aria-label={`Pendientes por prioridad. ${summary}.`} className="flex h-2 gap-0.5">
        {ORDER.filter(({ priority }) => byPriority[priority] > 0).map(({ priority, fill }) => (
          <div
            key={priority}
            className={`h-full rounded-full ${fill}`}
            style={{ width: `${(byPriority[priority] / total) * 100}%` }}
          />
        ))}
      </div>

      <ul className="mt-4 space-y-2 text-sm">
        {ORDER.map(({ priority, param, fill }) => (
          <li key={priority}>
            <Link
              href={tasksUrl({ priority: param })}
              className="flex items-center justify-between gap-3 rounded-lg px-1 py-0.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
            >
              <span className="inline-flex items-center gap-2">
                <span aria-hidden="true" className={`size-2.5 rounded-full ${fill}`} />
                Prioridad {PRIORITY_LABELS[priority].toLowerCase()}
              </span>
              <span className="text-zinc-600 tabular-nums dark:text-zinc-400">{byPriority[priority]}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
