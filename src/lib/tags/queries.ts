import "server-only";

import { requireUser } from "@/lib/auth/user";
import { type ColorName, toColorName } from "@/lib/colors";

export type Tag = { id: string; name: string; color: ColorName };

/** Etiquetas del usuario, por nombre. */
export async function getTags(): Promise<Tag[]> {
  const { supabase } = await requireUser();
  const { data, error } = await supabase
    .from("tags")
    .select("id, name, color")
    .order("name", { ascending: true });
  if (error) throw new Error(`No se pudieron cargar las etiquetas: ${error.message}`);
  return data.map((t) => ({ id: t.id, name: t.name, color: toColorName(t.color) }));
}
