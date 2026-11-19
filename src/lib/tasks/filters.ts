// Filtros de la lista de tareas, guardados en la URL:
//   /tareas?q=informe&proyecto=<id>|bandeja&etiqueta=<id>&prioridad=alta&estado=pendiente&vence=vencidas
// Se usa en el servidor (para filtrar la consulta) y en el cliente (para construir los enlaces).
// Los valores de la URL van en español: son lo que el usuario ve y comparte.

import type { TaskPriority, TaskStatus } from "./constants";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const INBOX = "bandeja";

export const PRIORITY_PARAM = { baja: "low", media: "medium", alta: "high" } as const satisfies Record<
  string,
  TaskPriority
>;
export const STATUS_PARAM = {
  pendiente: "todo",
  "en-progreso": "in_progress",
  hecha: "done",
} as const satisfies Record<string, TaskStatus>;
export const DUE_PARAM = ["vencidas", "hoy", "semana", "sin-fecha"] as const;

export type PriorityParam = keyof typeof PRIORITY_PARAM;
export type StatusParam = keyof typeof STATUS_PARAM;
export type DueParam = (typeof DUE_PARAM)[number];

export type TaskFilters = {
  q: string;
  /** id de proyecto, "bandeja" (sin proyecto) o "" (todos) */
  project: string;
  tag: string;
  priority: PriorityParam | "";
  status: StatusParam | "";
  due: DueParam | "";
};

export const EMPTY_FILTERS: TaskFilters = { q: "", project: "", tag: "", priority: "", status: "", due: "" };

const MAX_QUERY_LENGTH = 100;

type RawParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

/**
 * Lee los filtros de la URL. Cualquier valor no válido se ignora (en lugar de dar error):
 * así un enlace viejo o editado a mano nunca rompe la página.
 */
export function parseTaskFilters(params: RawParams): TaskFilters {
  const project = first(params.proyecto);
  const tag = first(params.etiqueta);
  const priority = first(params.prioridad);
  const status = first(params.estado);
  const due = first(params.vence);

  return {
    q: first(params.q).trim().slice(0, MAX_QUERY_LENGTH),
    project: project === INBOX || UUID.test(project) ? project : "",
    tag: UUID.test(tag) ? tag : "",
    // Object.hasOwn y no "in": "in" también acepta "toString", "constructor"… del prototipo.
    priority: Object.hasOwn(PRIORITY_PARAM, priority) ? (priority as PriorityParam) : "",
    status: Object.hasOwn(STATUS_PARAM, status) ? (status as StatusParam) : "",
    due: (DUE_PARAM as readonly string[]).includes(due) ? (due as DueParam) : "",
  };
}

/** Construye "/tareas?..." solo con los filtros que tienen valor. */
export function tasksUrl(filters: Partial<TaskFilters>, basePath = "/tareas") {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.project) params.set("proyecto", filters.project);
  if (filters.tag) params.set("etiqueta", filters.tag);
  if (filters.priority) params.set("prioridad", filters.priority);
  if (filters.status) params.set("estado", filters.status);
  if (filters.due) params.set("vence", filters.due);
  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export function countActiveFilters(filters: TaskFilters) {
  return Object.values(filters).filter(Boolean).length;
}

/**
 * Prepara el texto de búsqueda para un filtro ILIKE de PostgREST.
 * Quita los caracteres con significado especial (comas y paréntesis separan condiciones
 * en .or(); % y _ son comodines de LIKE; * es comodín de PostgREST).
 */
export function sanitizeSearch(q: string) {
  return q.replace(/[,()"\\%_*:]/g, " ").replace(/\s+/g, " ").trim();
}
