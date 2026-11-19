"use client";

import { useActionState, useRef } from "react";

import { buttonStyles } from "@/components/ui/button";
import { ColorPicker } from "@/components/ui/ColorPicker";
import { ConfirmDeleteButton } from "@/components/ui/ConfirmDeleteButton";
import { FormAlert } from "@/components/ui/FormAlert";
import { TextField } from "@/components/ui/TextField";
import { useFocusFirstError } from "@/components/ui/useFocusFirstError";
import type { ColorName } from "@/lib/colors";
import { initialFormState } from "@/lib/forms";
import { createTag, deleteTag } from "@/lib/tags/actions";
import type { Tag } from "@/lib/tags/queries";

import { TagBadge } from "./TagBadge";

/** Lista de etiquetas con borrar + formulario para crear una nueva. */
export function TagManager({ tags }: { tags: Tag[] }) {
  const [state, formAction, pending] = useActionState(createTag, initialFormState);
  const formRef = useRef<HTMLFormElement>(null);
  useFocusFirstError(formRef, state);

  const values = state.status === "error" ? state.values : undefined;

  return (
    <div className="space-y-4">
      {tags.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <li key={tag.id} className="inline-flex items-center">
              <TagBadge name={tag.name} color={tag.color} />
              <ConfirmDeleteButton
                action={deleteTag.bind(null, tag.id)}
                label={`Eliminar etiqueta ${tag.name}`}
                title={`¿Eliminar la etiqueta "${tag.name}"?`}
                description="Se quitará de todas las tareas que la tengan. Las tareas no se borran."
              />
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-zinc-500">Sin etiquetas todavía.</p>
      )}

      <form ref={formRef} action={formAction} noValidate className="flex flex-col gap-3">
        <FormAlert status={state.status} message={state.message} />
        <TextField
          id="new-tag-name"
          label="Nueva etiqueta"
          name="name"
          maxLength={30}
          autoComplete="off"
          placeholder="Ej.: Urgente, Llamadas"
          defaultValue={values?.name}
          errors={state.fieldErrors?.name}
        />
        <ColorPicker
          name="color"
          idPrefix="new-tag"
          defaultValue={(values?.color as ColorName | undefined) ?? "sky"}
          errors={state.fieldErrors?.color}
        />
        <button type="submit" disabled={pending} className={buttonStyles({ variant: "secondary" })}>
          {pending ? "Creando…" : "Crear etiqueta"}
        </button>
      </form>
    </div>
  );
}
