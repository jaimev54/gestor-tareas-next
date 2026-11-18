import "server-only";

import { requireUser } from "@/lib/auth/user";
import { type ColorName, toColorName } from "@/lib/colors";

import { PRIORITY_RANK, RECENT_DONE_LIMIT, type TaskPriority, type TaskStatus } from "./constants";

export type TaskProject = { id: string; name: string; color: ColorName };

export type Task = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  completedAt: string | null;
  project: TaskProject | null;
};

// Columnas que pedimos siempre. "project:projects(...)" trae el proyecto de cada tarea
// en la misma consulta (embed por la clave foránea project_id).
const TASK_COLUMNS =
  "id, title, description, status, priority, due_date, completed_at, project:projects(id, name, color)";

type TaskRow = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  due_date: string | null;
  completed_at: string | null;
  project: { id: string; name: string; color: string } | null;
};

function toTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status as TaskStatus,
    priority: row.priority as TaskPriority,
    dueDate: row.due_date,
    completedAt: row.completed_at,
    project: row.project
      ? { id: row.project.id, name: row.project.name, color: toColorName(row.project.color) }
      : null,
  };
}

/**
 * Orden de las pendientes: primero las que tienen fecha (la más próxima arriba),
 * luego sin fecha; a igual fecha, la de mayor prioridad.
 */
function compareOpenTasks(a: Task, b: Task) {
  if (a.dueDate !== b.dueDate) {
    if (a.dueDate === null) return 1;
    if (b.dueDate === null) return -1;
    return a.dueDate < b.dueDate ? -1 : 1;
  }
  return PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority];
}

/** Tareas del usuario: pendientes (todas) y completadas (las más recientes). */
export async function getTasks() {
  const { supabase } = await requireUser();

  // Dos consultas en paralelo (como forkJoin en RxJS).
  const [open, done] = await Promise.all([
    supabase.from("tasks").select(TASK_COLUMNS).neq("status", "done"),
    supabase
      .from("tasks")
      .select(TASK_COLUMNS, { count: "exact" })
      .eq("status", "done")
      .order("completed_at", { ascending: false })
      .limit(RECENT_DONE_LIMIT),
  ]);

  if (open.error) throw new Error(`No se pudieron cargar las tareas: ${open.error.message}`);
  if (done.error) throw new Error(`No se pudieron cargar las tareas: ${done.error.message}`);

  return {
    open: open.data.map(toTask).sort(compareOpenTasks),
    done: done.data.map(toTask),
    doneTotal: done.count ?? done.data.length,
  };
}

/** Proyectos para los <select> de los formularios (sin conteos: consulta ligera). */
export async function getProjectOptions(): Promise<TaskProject[]> {
  const { supabase } = await requireUser();
  const { data, error } = await supabase
    .from("projects")
    .select("id, name, color")
    .order("name", { ascending: true });
  if (error) throw new Error(`No se pudieron cargar los proyectos: ${error.message}`);
  return data.map((p) => ({ id: p.id, name: p.name, color: toColorName(p.color) }));
}
