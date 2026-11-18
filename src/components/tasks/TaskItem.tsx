"use client";

import { useOptimistic, useTransition } from "react";

import { ConfirmDeleteButton } from "@/components/ui/ConfirmDeleteButton";
import { COLOR_DOT } from "@/lib/colors";
import { deleteTask, setTaskDone } from "@/lib/tasks/actions";
import { PRIORITY_BADGE, PRIORITY_LABELS, STATUS_LABELS } from "@/lib/tasks/constants";
import type { Task, TaskProject } from "@/lib/tasks/queries";

import { DueDateBadge } from "./DueDateBadge";
import { TaskEditDialog } from "./TaskEditDialog";

type TaskItemProps = {
  task: Task;
  projects: TaskProject[];
};

export function TaskItem({ task, projects }: TaskItemProps) {
  // useOptimistic: la casilla cambia al instante y, si el servidor falla,
  // vuelve sola a su valor real cuando termina la transición.
  const [optimisticDone, setOptimisticDone] = useOptimistic(task.status === "done");
  const [, startTransition] = useTransition();

  function toggle() {
    const next = !optimisticDone;
    startTransition(async () => {
      setOptimisticDone(next);
      await setTaskDone(task.id, next);
    });
  }

  const checkboxId = `task-${task.id}-done`;

  return (
    <article className="group flex items-start gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-sm transition hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700">
      <input
        id={checkboxId}
        type="checkbox"
        checked={optimisticDone}
        onChange={toggle}
        className="mt-0.5 size-5 shrink-0 cursor-pointer rounded accent-indigo-600"
      />

      <div className="min-w-0 flex-1">
        <label
          htmlFor={checkboxId}
          className={`block cursor-pointer break-words ${
            optimisticDone ? "text-zinc-400 line-through dark:text-zinc-500" : "font-medium"
          }`}
        >
          {task.title}
        </label>

        {task.description && !optimisticDone && (
          <p className="mt-0.5 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">{task.description}</p>
        )}

        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
          {task.project && (
            <span className="inline-flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400">
              <span aria-hidden="true" className={`size-2 rounded-full ${COLOR_DOT[task.project.color]}`} />
              {task.project.name}
            </span>
          )}
          {!optimisticDone && (
            <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${PRIORITY_BADGE[task.priority]}`}>
              <span className="sr-only">Prioridad </span>
              {PRIORITY_LABELS[task.priority]}
            </span>
          )}
          {task.status === "in_progress" && !optimisticDone && (
            <span className="rounded bg-sky-100 px-1.5 py-0.5 text-xs font-medium text-sky-700 dark:bg-sky-950 dark:text-sky-300">
              {STATUS_LABELS.in_progress}
            </span>
          )}
          {task.dueDate && <DueDateBadge dueDate={task.dueDate} done={optimisticDone} />}
        </div>
      </div>

      {/* Acciones: siempre visibles en móvil; en escritorio aparecen al pasar el ratón o con el foco */}
      <div className="flex shrink-0 items-center sm:opacity-0 sm:transition sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
        <TaskEditDialog task={task} projects={projects} />
        <ConfirmDeleteButton
          action={deleteTask.bind(null, task.id)}
          label={`Eliminar ${task.title}`}
          title="¿Eliminar esta tarea?"
          description={`"${task.title}" se eliminará definitivamente.`}
        />
      </div>
    </article>
  );
}
