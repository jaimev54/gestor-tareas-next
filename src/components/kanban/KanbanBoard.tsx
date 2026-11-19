"use client";

import {
  type Announcements,
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  DragOverlay,
  type DragStartEvent,
  KeyboardSensor,
  MouseSensor,
  type ScreenReaderInstructions,
  TouchSensor,
  type UniqueIdentifier,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useId, useRef, useState, useTransition } from "react";

import { FormAlert } from "@/components/ui/FormAlert";
import type { Tag } from "@/lib/tags/queries";
import { moveTask } from "@/lib/tasks/actions";
import { STATUS_LABELS, TASK_STATUSES, type TaskStatus } from "@/lib/tasks/constants";
import type { BoardColumns, Task, TaskProject } from "@/lib/tasks/queries";

import { KanbanColumn } from "./KanbanColumn";
import { TaskCardContent } from "./TaskCardContent";

type KanbanBoardProps = {
  columns: BoardColumns;
  projects: TaskProject[];
  tags: Tag[];
  doneNote?: string;
};

const isStatus = (id: UniqueIdentifier): id is TaskStatus => (TASK_STATUSES as readonly string[]).includes(String(id));

/** ¿En qué columna está este id? (puede ser el id de una tarea o el de la propia columna) */
function findColumn(columns: BoardColumns, id: UniqueIdentifier): TaskStatus | null {
  if (isStatus(id)) return id;
  return TASK_STATUSES.find((status) => columns[status].some((t) => t.id === id)) ?? null;
}

const screenReaderInstructions: ScreenReaderInstructions = {
  draggable:
    "Para mover una tarea, pulsa espacio. Usa las flechas para moverla entre posiciones y columnas. Pulsa espacio otra vez para soltarla o Escape para cancelar.",
};

export function KanbanBoard({ columns: serverColumns, projects, tags, doneNote }: KanbanBoardProps) {
  // Copia local de las columnas: el arrastre las cambia al instante (sin esperar al servidor).
  const [columns, setColumns] = useState(serverColumns);
  // Cuando llegan datos nuevos del servidor (tras guardar, filtrar, editar…), reemplazan la copia local.
  const [prevServerColumns, setPrevServerColumns] = useState(serverColumns);
  if (serverColumns !== prevServerColumns) {
    setPrevServerColumns(serverColumns);
    setColumns(serverColumns);
  }

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const snapshotRef = useRef<BoardColumns>(serverColumns);
  const dndId = useId(); // id estable: evita diferencias entre el HTML del servidor y el del navegador

  const sensors = useSensors(
    // Ratón: hay que mover 5px para empezar (así un clic normal no arrastra).
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    // Táctil: mantener pulsado 200 ms (así deslizar el dedo sigue haciendo scroll).
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const titleOf = (id: UniqueIdentifier) =>
    TASK_STATUSES.flatMap((s) => columns[s]).find((t) => t.id === id)?.title ?? "la tarea";

  const positionText = (id: UniqueIdentifier) => {
    const column = findColumn(columns, id);
    if (!column) return "";
    const index = columns[column].findIndex((t) => t.id === id);
    return `${STATUS_LABELS[column]}, posición ${index + 1} de ${columns[column].length}`;
  };

  // Lo que oye un lector de pantalla mientras arrastras.
  const announcements: Announcements = {
    onDragStart: ({ active }) => `Agarraste «${titleOf(active.id)}». ${positionText(active.id)}.`,
    onDragOver: ({ active, over }) => (over ? `«${titleOf(active.id)}» en ${positionText(active.id)}.` : undefined),
    onDragEnd: ({ active, over }) =>
      over ? `Moviste «${titleOf(active.id)}» a ${positionText(active.id)}.` : "Movimiento cancelado.",
    onDragCancel: ({ active }) => `Cancelado. «${titleOf(active.id)}» vuelve a su sitio.`,
  };

  function handleDragStart({ active }: DragStartEvent) {
    snapshotRef.current = columns;
    setError(null);
    const column = findColumn(columns, active.id);
    setActiveTask(column ? (columns[column].find((t) => t.id === active.id) ?? null) : null);
  }

  // Mientras arrastras sobre OTRA columna, la tarea se pasa a ella (para ver dónde caerá).
  function handleDragOver({ active, over }: DragOverEvent) {
    if (!over) return;
    setColumns((current) => {
      const from = findColumn(current, active.id);
      const to = findColumn(current, over.id);
      if (!from || !to || from === to) return current;

      const task = current[from].find((t) => t.id === active.id);
      if (!task) return current;
      const overIndex = current[to].findIndex((t) => t.id === over.id);
      const insertAt = overIndex === -1 ? current[to].length : overIndex;

      return {
        ...current,
        [from]: current[from].filter((t) => t.id !== active.id),
        [to]: [...current[to].slice(0, insertAt), { ...task, status: to }, ...current[to].slice(insertAt)],
      };
    });
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveTask(null);
    const column = over ? findColumn(columns, over.id) : null;
    const current = findColumn(columns, active.id);
    if (!over || !column || column !== current) {
      setColumns(snapshotRef.current);
      return;
    }

    // Reordenar dentro de la columna final.
    const oldIndex = columns[column].findIndex((t) => t.id === active.id);
    const overIndex = columns[column].findIndex((t) => t.id === over.id);
    const ordered =
      overIndex === -1 || overIndex === oldIndex ? columns[column] : arrayMove(columns[column], oldIndex, overIndex);
    const next = { ...columns, [column]: ordered };
    setColumns(next);

    // ¿Cambió algo respecto a antes de arrastrar?
    const before = snapshotRef.current;
    const startColumn = findColumn(before, active.id);
    const sameOrder =
      startColumn === column &&
      before[column].length === ordered.length &&
      before[column].every((t, i) => t.id === ordered[i].id);
    if (sameOrder) return;

    // Guardar en el servidor. Si falla, se vuelve a como estaba.
    startTransition(async () => {
      const result = await moveTask(String(active.id), column, ordered.map((t) => t.id));
      if (result.status === "error") {
        setColumns(snapshotRef.current);
        setError(result.message ?? "No se pudo mover la tarea.");
      }
    });
  }

  function handleDragCancel() {
    setActiveTask(null);
    setColumns(snapshotRef.current);
  }

  return (
    <div className="space-y-3">
      {error && <FormAlert status="error" message={error} />}
      <DndContext
        id={dndId}
        sensors={sensors}
        collisionDetection={closestCorners}
        accessibility={{ announcements, screenReaderInstructions }}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        {/* Móvil: columnas en fila con scroll horizontal. Escritorio: 3 columnas. */}
        <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 lg:mx-0 lg:grid lg:grid-cols-3 lg:overflow-visible lg:px-0">
          {TASK_STATUSES.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              tasks={columns[status]}
              projects={projects}
              tags={tags}
              note={status === "done" ? doneNote : undefined}
            />
          ))}
        </div>

        {/* "Sombra" que sigue al cursor mientras arrastras. */}
        <DragOverlay>
          {activeTask && (
            <div className="rotate-2 cursor-grabbing rounded-xl border border-indigo-300 bg-white p-3 shadow-xl dark:border-indigo-700 dark:bg-zinc-900">
              <TaskCardContent task={activeTask} />
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
