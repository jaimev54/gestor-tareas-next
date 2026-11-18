import "server-only";

import { requireUser } from "@/lib/auth/user";
import { type ColorName, toColorName } from "@/lib/colors";

export type ProjectSummary = {
  id: string;
  name: string;
  color: ColorName;
  taskCount: number;
  openTaskCount: number;
};

/**
 * Proyectos del usuario con el número de tareas (totales y sin terminar).
 * No hace falta filtrar por user_id: RLS ya solo devuelve los del usuario.
 */
export async function getProjects(): Promise<ProjectSummary[]> {
  const { supabase } = await requireUser();

  // "tasks(count)" es un embed de PostgREST: cuenta las tareas relacionadas en la misma consulta
  // (sería un LEFT JOIN + GROUP BY en SQL). El alias "open" filtra solo las no terminadas.
  const { data, error } = await supabase
    .from("projects")
    .select("id, name, color, tasks(count), open:tasks(count)")
    .neq("open.status", "done")
    .order("created_at", { ascending: true });

  if (error) throw new Error(`No se pudieron cargar los proyectos: ${error.message}`);

  return data.map((p) => ({
    id: p.id,
    name: p.name,
    color: toColorName(p.color),
    taskCount: p.tasks[0]?.count ?? 0,
    openTaskCount: p.open[0]?.count ?? 0,
  }));
}
