import Link from "next/link";

import { DueDateBadge } from "@/components/tasks/DueDateBadge";
import { COLOR_DOT } from "@/lib/colors";
import type { UpcomingTask } from "@/lib/dashboard/queries";
import { PRIORITY_BADGE, PRIORITY_LABELS } from "@/lib/tasks/constants";
import { tasksUrl } from "@/lib/tasks/filters";

/** Las próximas fechas límite (las vencidas primero). */
export function UpcomingList({ tasks }: { tasks: UpcomingTask[] }) {
  if (tasks.length === 0) {
    return <p className="text-sm text-zinc-500">No tienes tareas pendientes con fecha límite.</p>;
  }

  return (
    <div>
      <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {tasks.map((task) => (
          <li key={task.id} className="flex items-start justify-between gap-3 py-2.5">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{task.title}</p>
              {task.project && (
                <p className="mt-0.5 inline-flex items-center gap-1.5 text-xs text-zinc-500">
                  <span aria-hidden="true" className={`size-2 rounded-full ${COLOR_DOT[task.project.color]}`} />
                  {task.project.name}
                </p>
              )}
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <DueDateBadge dueDate={task.dueDate} />
              <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${PRIORITY_BADGE[task.priority]}`}>
                <span className="sr-only">Prioridad </span>
                {PRIORITY_LABELS[task.priority]}
              </span>
            </div>
          </li>
        ))}
      </ul>
      <Link
        href={tasksUrl({ due: "semana" })}
        className="mt-3 inline-block text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
      >
        Ver las de los próximos 7 días
      </Link>
    </div>
  );
}
