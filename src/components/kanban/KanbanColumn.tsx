"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

import type { Tag } from "@/lib/tags/queries";
import { STATUS_LABELS, type TaskStatus } from "@/lib/tasks/constants";
import type { Task, TaskProject } from "@/lib/tasks/queries";

import { KanbanCard } from "./KanbanCard";

const ACCENT: Record<TaskStatus, string> = {
  todo: "bg-zinc-400",
  in_progress: "bg-sky-500",
  done: "bg-emerald-500",
};

type KanbanColumnProps = {
  status: TaskStatus;
  tasks: Task[];
  projects: TaskProject[];
  tags: Tag[];
  note?: string;
};

/** Columna del tablero: zona donde soltar (useDroppable) + lista ordenable (SortableContext). */
export function KanbanColumn({ status, tasks, projects, tags, note }: KanbanColumnProps) {
  // El id de la columna es su estado: así se puede soltar aunque esté vacía.
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const titleId = `column-${status}-title`;

  return (
    <section
      aria-labelledby={titleId}
      className="flex w-[85vw] max-w-sm shrink-0 snap-start flex-col rounded-2xl bg-zinc-100 p-3 sm:w-80 lg:w-auto lg:max-w-none dark:bg-zinc-900/60"
    >
      <header className="mb-3 flex items-center gap-2 px-1">
        <span aria-hidden="true" className={`size-2.5 rounded-full ${ACCENT[status]}`} />
        <h2 id={titleId} className="text-sm font-semibold">
          {STATUS_LABELS[status]}
        </h2>
        <span className="ml-auto rounded-full bg-white px-2 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
          {tasks.length}
        </span>
      </header>

      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <ul
          ref={setNodeRef}
          className={`flex min-h-32 flex-1 flex-col gap-2 rounded-xl p-0.5 transition ${
            isOver ? "bg-indigo-50 ring-2 ring-indigo-300 dark:bg-indigo-950/40 dark:ring-indigo-700" : ""
          }`}
        >
          {tasks.map((task) => (
            <li key={task.id}>
              <KanbanCard task={task} projects={projects} tags={tags} />
            </li>
          ))}
          {tasks.length === 0 && (
            <li className="flex flex-1 items-center justify-center rounded-xl border-2 border-dashed border-zinc-300 p-4 text-center text-sm text-zinc-500 dark:border-zinc-700">
              Suelta aquí una tarea
            </li>
          )}
        </ul>
      </SortableContext>

      {note && <p className="mt-2 px-1 text-xs text-zinc-500">{note}</p>}
    </section>
  );
}
