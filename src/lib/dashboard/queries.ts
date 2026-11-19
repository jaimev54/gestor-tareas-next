import "server-only";

import { requireUser } from "@/lib/auth/user";
import { type ColorName, toColorName } from "@/lib/colors";
import { getProjects } from "@/lib/projects/queries";
import type { TaskPriority } from "@/lib/tasks/constants";
import { addDaysIso } from "@/lib/timezone";
import { getUserTimeZone, getUserToday } from "@/lib/today";

import { WEEKS_IN_CHART, completedLast7Days, completedPerWeek, summarizeOpen, weekStart } from "./stats";

export type UpcomingTask = {
  id: string;
  title: string;
  dueDate: string;
  priority: TaskPriority;
  project: { name: string; color: ColorName } | null;
};

const UPCOMING_LIMIT = 5;

/** Todo lo que necesita el panel, en consultas paralelas y ligeras (solo las columnas necesarias). */
export async function getDashboard() {
  const { supabase } = await requireUser();
  const [today, timeZone] = await Promise.all([getUserToday(), getUserTimeZone()]);

  // Desde el lunes de hace 7 semanas, con un día de margen por la zona horaria.
  const since = addDaysIso(weekStart(today), -7 * (WEEKS_IN_CHART - 1) - 1);

  const [open, done, projects] = await Promise.all([
    supabase
      .from("tasks")
      .select("id, title, priority, due_date, project:projects(name, color)")
      .neq("status", "done"),
    supabase.from("tasks").select("completed_at").eq("status", "done").gte("completed_at", since),
    getProjects(),
  ]);

  if (open.error) throw new Error(`No se pudo cargar el panel: ${open.error.message}`);
  if (done.error) throw new Error(`No se pudo cargar el panel: ${done.error.message}`);

  const openTasks = open.data.map((t) => ({
    id: t.id,
    title: t.title,
    priority: t.priority as TaskPriority,
    dueDate: t.due_date,
    project: t.project ? { name: t.project.name, color: toColorName(t.project.color) } : null,
  }));
  const completedAt = done.data.flatMap((t) => (t.completed_at ? [t.completed_at] : []));

  // Próximas fechas límite (incluye vencidas: son lo más urgente).
  const upcoming: UpcomingTask[] = openTasks
    .filter((t): t is typeof t & { dueDate: string } => t.dueDate !== null)
    .sort((a, b) => (a.dueDate < b.dueDate ? -1 : a.dueDate > b.dueDate ? 1 : 0))
    .slice(0, UPCOMING_LIMIT);

  return {
    today,
    open: summarizeOpen(openTasks, today),
    completed7: completedLast7Days(completedAt, today, timeZone),
    weekly: completedPerWeek(completedAt, today, timeZone),
    projects: projects.filter((p) => p.taskCount > 0),
    upcoming,
  };
}
