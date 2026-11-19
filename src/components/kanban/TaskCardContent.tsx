import { ListChecks } from "lucide-react";

import { TagBadge } from "@/components/tags/TagBadge";
import { DueDateBadge } from "@/components/tasks/DueDateBadge";
import { COLOR_DOT } from "@/lib/colors";
import { PRIORITY_BADGE, PRIORITY_LABELS } from "@/lib/tasks/constants";
import type { Task } from "@/lib/tasks/queries";

/** Contenido visual de una tarjeta del tablero (se usa en la tarjeta y en la "sombra" al arrastrar). */
export function TaskCardContent({ task }: { task: Task }) {
  const done = task.status === "done";
  const subtasksDone = task.subtasks.filter((s) => s.isDone).length;

  return (
    <>
      <p className={`text-sm break-words ${done ? "text-zinc-500 line-through" : "font-medium"}`}>{task.title}</p>

      <div className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1">
        {!done && (
          <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${PRIORITY_BADGE[task.priority]}`}>
            <span className="sr-only">Prioridad </span>
            {PRIORITY_LABELS[task.priority]}
          </span>
        )}
        {task.dueDate && <DueDateBadge dueDate={task.dueDate} done={done} />}
        {task.subtasks.length > 0 && (
          <span className="inline-flex items-center gap-1 text-xs text-zinc-600 dark:text-zinc-400">
            <ListChecks className="size-3.5" aria-hidden="true" />
            <span className="sr-only">Subtareas completadas: </span>
            {subtasksDone}/{task.subtasks.length}
          </span>
        )}
      </div>

      {(task.project || task.tags.length > 0) && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {task.project && (
            <span className="mr-1 inline-flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400">
              <span aria-hidden="true" className={`size-2 rounded-full ${COLOR_DOT[task.project.color]}`} />
              {task.project.name}
            </span>
          )}
          {task.tags.map((tag) => (
            <TagBadge key={tag.id} name={tag.name} color={tag.color} />
          ))}
        </div>
      )}
    </>
  );
}
