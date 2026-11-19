import Link from "next/link";

import { COLOR_DOT } from "@/lib/colors";
import type { ProjectSummary } from "@/lib/projects/queries";
import { tasksUrl } from "@/lib/tasks/filters";

/**
 * Avance por proyecto: un medidor fino por fila. La pista es un tono claro de la misma
 * gama que el relleno (índigo sobre índigo); el color del proyecto solo va en el punto del nombre.
 */
export function ProjectProgress({ projects }: { projects: ProjectSummary[] }) {
  if (projects.length === 0) {
    return <p className="text-sm text-zinc-500">Cuando tus proyectos tengan tareas, verás aquí su avance.</p>;
  }

  return (
    <ul className="space-y-4">
      {projects.map((project) => {
        const done = project.taskCount - project.openTaskCount;
        const pct = Math.round((done / project.taskCount) * 100);
        return (
          <li key={project.id}>
            <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
              <Link
                href={tasksUrl({ project: project.id })}
                className="inline-flex min-w-0 items-center gap-2 font-medium hover:underline"
              >
                <span aria-hidden="true" className={`size-2 shrink-0 rounded-full ${COLOR_DOT[project.color]}`} />
                <span className="truncate">{project.name}</span>
              </Link>
              <span className="shrink-0 text-zinc-500 tabular-nums">
                {done}/{project.taskCount} · {pct}%
              </span>
            </div>
            <div
              role="progressbar"
              aria-label={`Avance de ${project.name}: ${done} de ${project.taskCount} tareas hechas`}
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
              className="h-2 overflow-hidden rounded-full bg-indigo-100 dark:bg-indigo-950"
            >
              <div className="h-full rounded-full bg-indigo-500" style={{ width: `${pct}%` }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
