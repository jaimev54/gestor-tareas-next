import { PRIORITY_LABELS, STATUS_LABELS, TASK_PRIORITIES, TASK_STATUSES } from "@/lib/tasks/constants";
import type { TaskProject } from "@/lib/tasks/queries";

// Opciones para los <select> de los formularios de tareas.

export const PRIORITY_OPTIONS = TASK_PRIORITIES.map((p) => ({ value: p, label: PRIORITY_LABELS[p] }));

export const STATUS_OPTIONS = TASK_STATUSES.map((s) => ({ value: s, label: STATUS_LABELS[s] }));

export function projectOptions(projects: TaskProject[]) {
  return [
    { value: "", label: "Bandeja de entrada" },
    ...projects.map((p) => ({ value: p.id, label: p.name })),
  ];
}
