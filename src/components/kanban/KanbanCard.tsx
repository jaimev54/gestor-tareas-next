"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { TaskEditDialog } from "@/components/tasks/TaskEditDialog";
import type { Tag } from "@/lib/tags/queries";
import type { Task, TaskProject } from "@/lib/tasks/queries";

import { TaskCardContent } from "./TaskCardContent";

type KanbanCardProps = {
  task: Task;
  projects: TaskProject[];
  tags: Tag[];
};

// Eventos que inician un arrastre en dnd-kit. Se frenan en la zona de acciones
// para que pulsar "Editar" (o escribir dentro de su diálogo) no arrastre la tarjeta.
const stopDrag = {
  onMouseDown: (e: React.SyntheticEvent) => e.stopPropagation(),
  onTouchStart: (e: React.SyntheticEvent) => e.stopPropagation(),
  onKeyDown: (e: React.SyntheticEvent) => e.stopPropagation(),
};

/** Tarjeta arrastrable: con ratón, con el dedo (mantener pulsado) o con teclado (espacio + flechas). */
export function KanbanCard({ task, projects, tags }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });

  return (
    <article
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      {...attributes}
      {...listeners}
      aria-roledescription="tarea arrastrable"
      aria-label={task.title}
      className={`group relative cursor-grab touch-manipulation rounded-xl border border-zinc-200 bg-white p-3 pr-10 shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing dark:border-zinc-800 dark:bg-zinc-900 ${
        isDragging ? "opacity-40" : ""
      }`}
    >
      <TaskCardContent task={task} />

      <div
        {...stopDrag}
        className="absolute top-2 right-2 sm:opacity-0 sm:transition sm:group-focus-within:opacity-100 sm:group-hover:opacity-100"
      >
        <TaskEditDialog task={task} projects={projects} tags={tags} />
      </div>
    </article>
  );
}
