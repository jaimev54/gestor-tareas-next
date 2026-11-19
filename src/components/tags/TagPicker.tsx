import Link from "next/link";

import { COLOR_DOT } from "@/lib/colors";
import { ROUTES } from "@/lib/routes";
import type { Tag } from "@/lib/tags/queries";

type TagPickerProps = {
  tags: Tag[];
  selectedIds: string[];
};

/**
 * Casillas de etiquetas con forma de "chip". Todas usan name="tagIds":
 * el formulario envía un valor por cada casilla marcada (formData.getAll("tagIds")).
 */
export function TagPicker({ tags, selectedIds }: TagPickerProps) {
  return (
    <fieldset>
      <legend className="mb-1.5 text-sm font-medium">Etiquetas</legend>
      {tags.length === 0 ? (
        <p className="text-sm text-zinc-500">
          Aún no tienes etiquetas.{" "}
          <Link href={ROUTES.projects} className="text-indigo-600 hover:underline dark:text-indigo-400">
            Créalas en Proyectos
          </Link>
          .
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <label key={tag.id} className="cursor-pointer">
              <input
                type="checkbox"
                name="tagIds"
                value={tag.id}
                defaultChecked={selectedIds.includes(tag.id)}
                className="peer sr-only"
              />
              <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-300 px-3 py-1 text-sm transition peer-checked:border-indigo-600 peer-checked:bg-indigo-50 peer-checked:text-indigo-700 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-indigo-500 dark:border-zinc-700 dark:peer-checked:border-indigo-400 dark:peer-checked:bg-indigo-950 dark:peer-checked:text-indigo-300">
                <span aria-hidden="true" className={`size-2 rounded-full ${COLOR_DOT[tag.color]}`} />
                {tag.name}
              </span>
            </label>
          ))}
        </div>
      )}
    </fieldset>
  );
}
