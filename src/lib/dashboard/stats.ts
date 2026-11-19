// Cálculos del panel. Son funciones puras (sin base de datos ni fechas "de ahora"):
// reciben los datos y "hoy", y devuelven números. Así se pueden probar fácilmente.

import { addDaysIso, isoDateInTimeZone } from "@/lib/timezone";
import type { TaskPriority } from "@/lib/tasks/constants";

export const WEEKS_IN_CHART = 8;

/** Lunes de la semana de una fecha ISO (semanas de lunes a domingo, como en México). */
export function weekStart(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const weekday = new Date(Date.UTC(y, m - 1, d)).getUTCDay(); // 0 = domingo
  const daysSinceMonday = (weekday + 6) % 7;
  return addDaysIso(iso, -daysSinceMonday);
}

export type WeekBucket = { weekStart: string; count: number };

/**
 * Tareas completadas por semana, las últimas `weeks` semanas (la última es la actual).
 * `completedAt` son timestamps UTC de la base; se pasan a la zona del usuario antes de agrupar,
 * para que una tarea hecha el domingo a las 23:00 en Monterrey cuente en esa semana.
 */
export function completedPerWeek(
  completedAt: string[],
  today: string,
  timeZone: string,
  weeks = WEEKS_IN_CHART,
): WeekBucket[] {
  const currentWeek = weekStart(today);
  const buckets: WeekBucket[] = Array.from({ length: weeks }, (_, i) => ({
    weekStart: addDaysIso(currentWeek, -7 * (weeks - 1 - i)),
    count: 0,
  }));
  const index = new Map(buckets.map((b, i) => [b.weekStart, i]));

  for (const timestamp of completedAt) {
    const localDay = isoDateInTimeZone(new Date(timestamp), timeZone);
    const i = index.get(weekStart(localDay));
    if (i !== undefined) buckets[i].count++;
  }
  return buckets;
}

export type OpenTaskLite = { dueDate: string | null; priority: TaskPriority };

/** Resumen de las tareas sin terminar respecto a "hoy". */
export function summarizeOpen(tasks: OpenTaskLite[], today: string) {
  const byPriority: Record<TaskPriority, number> = { high: 0, medium: 0, low: 0 };
  let overdue = 0;
  let dueToday = 0;
  let dueThisWeek = 0;
  const weekEnd = addDaysIso(today, 6);

  for (const task of tasks) {
    byPriority[task.priority]++;
    if (!task.dueDate) continue;
    if (task.dueDate < today) overdue++;
    else if (task.dueDate === today) dueToday++;
    if (task.dueDate >= today && task.dueDate <= weekEnd) dueThisWeek++;
  }
  return { total: tasks.length, overdue, dueToday, dueThisWeek, byPriority };
}

/** Completadas en los últimos 7 días y en los 7 anteriores (para la variación). */
export function completedLast7Days(completedAt: string[], today: string, timeZone: string) {
  const startCurrent = addDaysIso(today, -6);
  const startPrevious = addDaysIso(today, -13);
  let current = 0;
  let previous = 0;
  for (const timestamp of completedAt) {
    const day = isoDateInTimeZone(new Date(timestamp), timeZone);
    if (day >= startCurrent && day <= today) current++;
    else if (day >= startPrevious && day < startCurrent) previous++;
  }
  return { current, previous, delta: current - previous };
}
