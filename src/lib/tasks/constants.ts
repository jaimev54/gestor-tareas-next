// Valores permitidos de tareas (iguales que los CHECK de la tabla tasks) y su presentación.

export const TASK_STATUSES = ["todo", "in_progress", "done"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_PRIORITIES = ["low", "medium", "high"] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "Pendiente",
  in_progress: "En progreso",
  done: "Hecha",
};

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: "Baja",
  medium: "Media",
  high: "Alta",
};

/** Para ordenar: mayor número = más importante. */
export const PRIORITY_RANK: Record<TaskPriority, number> = { low: 0, medium: 1, high: 2 };

export const PRIORITY_BADGE: Record<TaskPriority, string> = {
  low: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  high: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
};

/** Cuántas tareas completadas mostrar en la lista (las más recientes). */
export const RECENT_DONE_LIMIT = 20;
