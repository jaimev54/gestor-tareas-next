"use server";

import type { PostgrestError } from "@supabase/supabase-js";
import { refresh } from "next/cache";

import { requireUser } from "@/lib/auth/user";
import { type FormState, formDataToObject, validationError } from "@/lib/forms";
import { idSchema } from "@/lib/validation/projects";
import { createTaskSchema, updateTaskSchema } from "@/lib/validation/tasks";

// CRUD de tareas. Mismo patrón que proyectos: sesión → Zod → consulta (RLS) → refresh().
// completed_at no se toca aquí: lo rellena/limpia un trigger según el estado.

export async function createTask(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = formDataToObject(formData);
  const parsed = createTaskSchema.safeParse(values);
  if (!parsed.success) return validationError(parsed.error, values);

  const { supabase } = await requireUser();
  const { title, projectId, priority, dueDate } = parsed.data;
  const { error } = await supabase
    .from("tasks")
    .insert({ title, project_id: projectId, priority, due_date: dueDate });
  if (error) return dbError(error, values);

  refresh();
  return { status: "success", message: "Tarea creada." };
}

export async function updateTask(
  taskId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const values = formDataToObject(formData);
  const id = idSchema.safeParse(taskId);
  if (!id.success) return { status: "error", message: "Tarea no válida." };
  const parsed = updateTaskSchema.safeParse(values);
  if (!parsed.success) return validationError(parsed.error, values);

  const { supabase } = await requireUser();
  const { title, description, projectId, status, priority, dueDate } = parsed.data;
  const { data, error } = await supabase
    .from("tasks")
    .update({ title, description, project_id: projectId, status, priority, due_date: dueDate })
    .eq("id", id.data)
    .select("id");
  if (error) return dbError(error, values);
  if (data.length === 0) return { status: "error", message: "No se encontró la tarea." };

  refresh();
  return { status: "success", message: "Cambios guardados." };
}

/** Marca una tarea como hecha o la devuelve a pendiente (no viene de un formulario). */
export async function setTaskDone(taskId: string, done: boolean): Promise<FormState> {
  const id = idSchema.safeParse(taskId);
  if (!id.success || typeof done !== "boolean") {
    return { status: "error", message: "Datos no válidos." };
  }

  const { supabase } = await requireUser();
  const { data, error } = await supabase
    .from("tasks")
    .update({ status: done ? "done" : "todo" })
    .eq("id", id.data)
    .select("id");
  if (error) return dbError(error);
  if (data.length === 0) return { status: "error", message: "No se encontró la tarea." };

  refresh();
  return { status: "success" };
}

export async function deleteTask(taskId: string, _prev: FormState): Promise<FormState> {
  const id = idSchema.safeParse(taskId);
  if (!id.success) return { status: "error", message: "Tarea no válida." };

  const { supabase } = await requireUser();
  const { data, error } = await supabase.from("tasks").delete().eq("id", id.data).select("id");
  if (error) return dbError(error);
  if (data.length === 0) return { status: "error", message: "No se encontró la tarea." };

  refresh();
  return { status: "success", message: "Tarea eliminada." };
}

// ---------------------------------------------------------------------

function dbError(error: PostgrestError, values?: Record<string, string>): FormState {
  // 23503 = clave foránea: el proyecto no existe o no es del usuario (FK compuesta id + user_id)
  if (error.code === "23503") {
    return {
      status: "error",
      message: "Revisa los campos marcados.",
      fieldErrors: { projectId: ["Ese proyecto no existe"] },
      values,
    };
  }
  console.error("[tasks]", error.code, error.message);
  return { status: "error", message: "No se pudo guardar. Inténtalo de nuevo.", values };
}
