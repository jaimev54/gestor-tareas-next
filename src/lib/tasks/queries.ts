import "server-only";

import { requireUser } from "@/lib/auth/user";
import { type ColorName, toColorName } from "@/lib/colors";
import { addDaysIso } from "@/lib/timezone";
import { getUserToday } from "@/lib/today";

import { PRIORITY_RANK, RECENT_DONE_LIMIT, type TaskPriority, type TaskStatus } from "./constants";
import {
  EMPTY_FILTERS,
  INBOX,
  PRIORITY_PARAM,
  STATUS_PARAM,
  type TaskFilters,
  sanitizeSearch,
} from "./filters";

export type TaskProject = { id: string; name: string; color: ColorName };
export type TaskTag = { id: string; name: string; color: ColorName };
export type Subtask = { id: string; title: string; isDone: boolean };

export type Task = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  completedAt: string | null;
  project: TaskProject | null;
  tags: TaskTag[];
  subtasks: Subtask[];
};

// Columnas que pedimos siempre, con sus relaciones en la misma consulta:
//  - project: muchos-a-uno (tasks.project_id → projects)
//  - task_tags → tag: muchos-a-muchos a través de la tabla intermedia
//  - subtasks: uno-a-muchos
const TASK_COLUMNS = `
  id, title, description, status, priority, due_date, completed_at, position,
  project:projects(id, name, color),
  task_tags(tag:tags(id, name, color)),
  subtasks(id, title, is_done, position)
`;

type ColoredRow = { id: string; name: string; color: string };

type TaskRow = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  due_date: string | null;
  completed_at: string | null;
  position: number;
  project: ColoredRow | null;
  task_tags: { tag: ColoredRow | null }[];
  subtasks: { id: string; title: string; is_done: boolean; position: number }[];
};

const toColored = (row: ColoredRow) => ({ id: row.id, name: row.name, color: toColorName(row.color) });

function toTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status as TaskStatus,
    priority: row.priority as TaskPriority,
    dueDate: row.due_date,
    completedAt: row.completed_at,
    project: row.project ? toColored(row.project) : null,
    tags: row.task_tags
      .flatMap(({ tag }) => (tag ? [toColored(tag)] : []))
      .sort((a, b) => a.name.localeCompare(b.name, "es")),
    subtasks: [...row.subtasks]
      .sort((a, b) => a.position - b.position)
      .map((s) => ({ id: s.id, title: s.title, isDone: s.is_done })),
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

/** Cuántas completadas mostrar cuando se filtra explícitamente por "hecha". */
const DONE_FILTER_LIMIT = 100;

/**
 * Prepara una consulta de tareas con los filtros de la URL (salvo el estado,
 * que cada vista aplica a su manera). Devuelve una función que crea la consulta
 * para poder lanzar varias en paralelo con los mismos filtros.
 */
async function createFilteredQuery(filters: TaskFilters) {
  const { supabase } = await requireUser();
  const today = filters.due ? await getUserToday() : null;

  // Filtro por etiqueta: primero los ids de las tareas que la tienen.
  let taggedIds: string[] | null = null;
  if (filters.tag) {
    const { data, error } = await supabase.from("task_tags").select("task_id").eq("tag_id", filters.tag);
    if (error) throw new Error(`No se pudieron cargar las tareas: ${error.message}`);
    taggedIds = data.map((row) => row.task_id);
  }

  // Construye la consulta añadiendo una condición por filtro (como un query builder de Eloquent).
  return () => {
    let query = supabase.from("tasks").select(TASK_COLUMNS, { count: "exact" });

    if (filters.project === INBOX) query = query.is("project_id", null);
    else if (filters.project) query = query.eq("project_id", filters.project);

    if (taggedIds) query = query.in("id", taggedIds);
    if (filters.priority) query = query.eq("priority", PRIORITY_PARAM[filters.priority]);

    const term = sanitizeSearch(filters.q);
    if (term) query = query.or(`title.ilike.%${term}%,description.ilike.%${term}%`);

    if (today) {
      if (filters.due === "vencidas") query = query.lt("due_date", today);
      if (filters.due === "hoy") query = query.eq("due_date", today);
      if (filters.due === "semana") query = query.gte("due_date", today).lte("due_date", addDaysIso(today, 6));
    }
    if (filters.due === "sin-fecha") query = query.is("due_date", null);

    return query;
  };
}

/**
 * Tareas del usuario según los filtros de la URL:
 * pendientes (todas las que coinciden) y completadas (las más recientes).
 */
export async function getTasks(filters: TaskFilters = EMPTY_FILTERS) {
  const filteredQuery = await createFilteredQuery(filters);

  const status = filters.status ? STATUS_PARAM[filters.status] : null;
  const showOpen = status !== "done";
  // "Vencidas" solo tiene sentido para tareas sin terminar.
  const showDone = (status === null || status === "done") && filters.due !== "vencidas";

  // Dos consultas en paralelo (como forkJoin en RxJS); se omite la que no hace falta.
  const [open, done] = await Promise.all([
    showOpen ? (status ? filteredQuery().eq("status", status) : filteredQuery().neq("status", "done")) : null,
    showDone
      ? filteredQuery()
          .eq("status", "done")
          .order("completed_at", { ascending: false })
          .limit(status === "done" ? DONE_FILTER_LIMIT : RECENT_DONE_LIMIT)
      : null,
  ]);

  if (open?.error) throw new Error(`No se pudieron cargar las tareas: ${open.error.message}`);
  if (done?.error) throw new Error(`No se pudieron cargar las tareas: ${done.error.message}`);

  return {
    showOpen,
    showDone,
    open: (open?.data ?? []).map(toTask).sort(compareOpenTasks),
    done: (done?.data ?? []).map(toTask),
    doneTotal: done?.count ?? done?.data?.length ?? 0,
  };
}

/** En el tablero, la columna "Hecha" muestra solo las más recientes. */
export const BOARD_DONE_LIMIT = 30;

export type BoardColumns = Record<TaskStatus, Task[]>;

/**
 * Tareas del tablero kanban agrupadas por estado, en el orden guardado (position).
 * Usa los mismos filtros que la lista, salvo el de estado (las columnas ya son los estados).
 */
export async function getBoardTasks(filters: TaskFilters = EMPTY_FILTERS): Promise<BoardColumns> {
  const filteredQuery = await createFilteredQuery({ ...filters, status: "" });
  const byPosition = { ascending: true } as const;

  const [todo, inProgress, done] = await Promise.all([
    filteredQuery().eq("status", "todo").order("position", byPosition).order("created_at", { ascending: false }),
    filteredQuery()
      .eq("status", "in_progress")
      .order("position", byPosition)
      .order("created_at", { ascending: false }),
    // "Vencidas" excluye por definición las hechas.
    filters.due === "vencidas"
      ? null
      : filteredQuery().eq("status", "done").order("completed_at", { ascending: false }).limit(BOARD_DONE_LIMIT),
  ]);

  for (const result of [todo, inProgress, done]) {
    if (result?.error) throw new Error(`No se pudieron cargar las tareas: ${result.error.message}`);
  }

  return {
    todo: (todo.data ?? []).map(toTask),
    in_progress: (inProgress.data ?? []).map(toTask),
    // Las hechas: se eligen las más recientes y luego se muestran en su orden del tablero.
    done: [...(done?.data ?? [])]
      .sort((a, b) => a.position - b.position)
      .map(toTask),
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
