"use server";

import { refresh } from "next/cache";

import { requireUser } from "@/lib/auth/user";
import { type FormState, formDataToObject, validationError } from "@/lib/forms";
import { idSchema } from "@/lib/validation/projects";
import { tagSchema } from "@/lib/validation/tags";

export async function createTag(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = formDataToObject(formData);
  const parsed = tagSchema.safeParse(values);
  if (!parsed.success) return validationError(parsed.error, values);

  const { supabase } = await requireUser();
  const { error } = await supabase.from("tags").insert(parsed.data);
  if (error?.code === "23505") {
    return {
      status: "error",
      message: "Revisa los campos marcados.",
      fieldErrors: { name: ["Ya tienes una etiqueta con ese nombre"] },
      values,
    };
  }
  if (error) {
    console.error("[tags]", error.code, error.message);
    return { status: "error", message: "No se pudo crear la etiqueta.", values };
  }

  refresh();
  return { status: "success", message: `Etiqueta "${parsed.data.name}" creada.` };
}

export async function deleteTag(tagId: string, _prev: FormState): Promise<FormState> {
  const id = idSchema.safeParse(tagId);
  if (!id.success) return { status: "error", message: "Etiqueta no válida." };

  const { supabase } = await requireUser();
  // Se quita de todas las tareas automáticamente (ON DELETE CASCADE en task_tags).
  const { data, error } = await supabase.from("tags").delete().eq("id", id.data).select("id");
  if (error) {
    console.error("[tags]", error.code, error.message);
    return { status: "error", message: "No se pudo eliminar la etiqueta." };
  }
  if (data.length === 0) return { status: "error", message: "No se encontró la etiqueta." };

  refresh();
  return { status: "success", message: "Etiqueta eliminada." };
}
