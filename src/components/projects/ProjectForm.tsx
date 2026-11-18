"use client";

import { useActionState, useEffect, useRef } from "react";

import { buttonStyles } from "@/components/ui/button";
import { ColorPicker } from "@/components/ui/ColorPicker";
import { FormAlert } from "@/components/ui/FormAlert";
import { TextField } from "@/components/ui/TextField";
import { useFocusFirstError } from "@/components/ui/useFocusFirstError";
import type { ColorName } from "@/lib/colors";
import { initialFormState } from "@/lib/forms";
import { createProject, updateProject } from "@/lib/projects/actions";

type ProjectFormProps =
  | { mode: "create"; project?: undefined; onDone?: () => void }
  | {
      mode: "edit";
      project: { id: string; name: string; color: ColorName };
      onDone?: () => void;
    };

/** Formulario para crear o editar un proyecto (mismo componente, distinta acción). */
export function ProjectForm({ mode, project, onDone }: ProjectFormProps) {
  // En edición "atamos" el id a la acción con bind: el id no viaja como campo editable del form.
  const action = mode === "edit" ? updateProject.bind(null, project.id) : createProject;

  const [state, formAction, pending] = useActionState(action, initialFormState);
  const formRef = useRef<HTMLFormElement>(null);
  useFocusFirstError(formRef, state);

  // Al guardar con éxito: avisar al padre (p. ej. para cerrar el modo edición).
  useEffect(() => {
    if (state.status === "success") onDone?.();
  }, [state, onDone]);

  const idPrefix = mode === "edit" ? `project-${project.id}` : "new-project";
  const nameValue = state.status === "error" ? state.values?.name : undefined;
  const colorValue = (state.status === "error" ? state.values?.color : undefined) as
    | ColorName
    | undefined;

  return (
    <form ref={formRef} action={formAction} noValidate className="flex flex-col gap-4">
      {/* En creación el aviso de éxito se queda visible; en edición el formulario se cierra. */}
      {(state.status === "error" || mode === "create") && (
        <FormAlert status={state.status} message={state.message} />
      )}

      <TextField
        id={`${idPrefix}-name`}
        label="Nombre"
        name="name"
        maxLength={80}
        required
        autoComplete="off"
        placeholder="Ej.: Trabajo, Casa, Estudios"
        defaultValue={nameValue ?? project?.name}
        errors={state.fieldErrors?.name}
      />
      <ColorPicker
        name="color"
        idPrefix={idPrefix}
        defaultValue={colorValue ?? project?.color}
        errors={state.fieldErrors?.color}
      />

      <div className="flex flex-wrap gap-2">
        <button type="submit" disabled={pending} className={buttonStyles()}>
          {pending ? "Guardando…" : mode === "edit" ? "Guardar cambios" : "Crear proyecto"}
        </button>
        {mode === "edit" && (
          <button type="button" onClick={onDone} className={buttonStyles({ variant: "ghost" })}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
