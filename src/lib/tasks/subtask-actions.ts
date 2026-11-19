"use server";

import { refresh } from "next/cache";

import { requireUser } from "@/lib/auth/user";
import { type FormState, formDataToObject, validationError } from "@/lib/forms";
import { idSchema } from "@/lib/validation/projects";
import { subtaskSchema } from "@/lib/validation/tags";

// Subtareas: se guardan al momento (no esperan al botón "Guardar" de la tarea).

export async function addSubtask(taskId: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const values = formDataToObject(formData);
  const id = idSchema.safeParse(taskId);
  if (!id.success) return { status: "error", message: "Tarea no válida." };
  const parsed = subtaskSchema.safeParse(values);
  if (!parsed.success) return validationError(parsed.error, values);

  const { supabase } = await requireUser();
  // position = marca de tiempo: las nuevas quedan al final. Si la tarea no es tuya,
  // la FK compuesta (task_id, user_id) rechaza el insert.
  const { error } = await supabase
    .from("subtasks")
    .insert({ task_id: id.data, title: parsed.data.title, position: Date.now() });
  if (error) {
    console.error("[subtasks]", error.code, error.message);
    return { status: "error", message: "No se pudo añadir la subtarea.", values };
  }

  refresh();
  return { status: "success" };
}

export async function setSubtaskDone(subtaskId: string, done: boolean): Promise<FormState> {
  const id = idSchema.safeParse(subtaskId);
  if (!id.success || typeof done !== "boolean") return { status: "error", message: "Datos no válidos." };

  const { supabase } = await requireUser();
  const { error } = await supabase.from("subtasks").update({ is_done: done }).eq("id", id.data);
  if (error) return { status: "error", message: "No se pudo actualizar la subtarea." };

  refresh();
  return { status: "success" };
}

export async function deleteSubtask(subtaskId: string): Promise<FormState> {
  const id = idSchema.safeParse(subtaskId);
  if (!id.success) return { status: "error", message: "Subtarea no válida." };

  const { supabase } = await requireUser();
  const { error } = await supabase.from("subtasks").delete().eq("id", id.data);
  if (error) return { status: "error", message: "No se pudo eliminar la subtarea." };

  refresh();
  return { status: "success" };
}
