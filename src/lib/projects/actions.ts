"use server";

import type { PostgrestError } from "@supabase/supabase-js";
import { refresh } from "next/cache";

import { requireUser } from "@/lib/auth/user";
import { type FormState, formDataToObject, validationError } from "@/lib/forms";
import { idSchema, projectSchema } from "@/lib/validation/projects";

// CRUD de proyectos. Patrón de cada acción:
// 1) requireUser (sesión), 2) validar con Zod, 3) consulta (RLS protege igualmente),
// 4) refresh() para que la página vuelva a leer los datos.

export async function createProject(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = formDataToObject(formData);
  const parsed = projectSchema.safeParse(values);
  if (!parsed.success) return validationError(parsed.error, values);

  const { supabase } = await requireUser();
  // user_id no se envía: la columna tiene default auth.uid().
  const { error } = await supabase.from("projects").insert(parsed.data);
  if (error) return dbError(error, values);

  refresh();
  return { status: "success", message: `Proyecto "${parsed.data.name}" creado.` };
}

export async function updateProject(
  projectId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const values = formDataToObject(formData);
  const id = idSchema.safeParse(projectId);
  const parsed = projectSchema.safeParse(values);
  if (!id.success) return { status: "error", message: "Proyecto no válido." };
  if (!parsed.success) return validationError(parsed.error, values);

  const { supabase } = await requireUser();
  const { data, error } = await supabase
    .from("projects")
    .update(parsed.data)
    .eq("id", id.data)
    .select("id"); // devuelve las filas afectadas: si es [] el proyecto no existe o no es tuyo
  if (error) return dbError(error, values);
  if (data.length === 0) return { status: "error", message: "No se encontró el proyecto." };

  refresh();
  return { status: "success", message: "Cambios guardados." };
}

export async function deleteProject(projectId: string, _prev: FormState): Promise<FormState> {
  const id = idSchema.safeParse(projectId);
  if (!id.success) return { status: "error", message: "Proyecto no válido." };

  const { supabase } = await requireUser();
  // Las tareas del proyecto se borran en cascada (ON DELETE CASCADE en la base).
  const { data, error } = await supabase.from("projects").delete().eq("id", id.data).select("id");
  if (error) return dbError(error);
  if (data.length === 0) return { status: "error", message: "No se encontró el proyecto." };

  refresh();
  return { status: "success", message: "Proyecto eliminado." };
}

// ---------------------------------------------------------------------

function dbError(error: PostgrestError, values?: Record<string, string>): FormState {
  // 23505 = violación de UNIQUE (user_id, name)
  if (error.code === "23505") {
    return {
      status: "error",
      message: "Revisa los campos marcados.",
      fieldErrors: { name: ["Ya tienes un proyecto con ese nombre"] },
      values,
    };
  }
  console.error("[projects]", error.code, error.message);
  return { status: "error", message: "No se pudo guardar. Inténtalo de nuevo.", values };
}
