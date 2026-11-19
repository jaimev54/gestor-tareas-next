"use client";

import { Plus } from "lucide-react";
import { useActionState, useEffect, useRef } from "react";

import { buttonStyles } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/FormAlert";
import { SelectField } from "@/components/ui/SelectField";
import { TextField } from "@/components/ui/TextField";
import { initialFormState } from "@/lib/forms";
import { createTask } from "@/lib/tasks/actions";
import type { TaskProject } from "@/lib/tasks/queries";

import { PRIORITY_OPTIONS, projectOptions } from "./options";

/** Alta rápida: escribir el título y Enter. Proyecto, prioridad y fecha son opcionales. */
type TaskQuickAddProps = {
  projects: TaskProject[];
  /** Proyecto propuesto (p. ej. el que está filtrado en la lista). */
  defaultProjectId?: string;
};

export function TaskQuickAdd({ projects, defaultProjectId = "" }: TaskQuickAddProps) {
  const [state, formAction, pending] = useActionState(createTask, initialFormState);
  const titleRef = useRef<HTMLInputElement>(null);

  // Tras crear (o fallar), el foco vuelve al título para seguir escribiendo tareas.
  useEffect(() => {
    if (state.status !== "idle") titleRef.current?.focus();
  }, [state]);

  const values = state.status === "error" ? state.values : undefined;

  return (
    <form
      action={formAction}
      noValidate
      className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
    >
      {state.status === "error" && (
        <div className="mb-3">
          <FormAlert status="error" message={state.message} />
        </div>
      )}
      <div className="flex gap-2">
        <TextField
          ref={titleRef}
          id="new-task-title"
          label="Nueva tarea"
          hideLabel
          name="title"
          maxLength={200}
          autoComplete="off"
          placeholder="¿Qué tienes que hacer?"
          defaultValue={values?.title}
          errors={state.fieldErrors?.title}
          className="flex-1"
        />
        <button type="submit" disabled={pending} className={buttonStyles({ className: "self-start py-2.5" })}>
          <Plus className="size-4" aria-hidden="true" />
          <span className="sr-only sm:not-sr-only">{pending ? "Añadiendo…" : "Añadir"}</span>
        </button>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <SelectField
          // key: un select no controlado ignora cambios de defaultValue; al cambiar el filtro se vuelve a montar.
          key={defaultProjectId}
          id="new-task-project"
          label="Proyecto"
          name="projectId"
          options={projectOptions(projects)}
          defaultValue={values?.projectId ?? defaultProjectId}
          errors={state.fieldErrors?.projectId}
        />
        <SelectField
          id="new-task-priority"
          label="Prioridad"
          name="priority"
          options={PRIORITY_OPTIONS}
          defaultValue={values?.priority ?? "medium"}
          errors={state.fieldErrors?.priority}
        />
        <TextField
          id="new-task-due"
          label="Fecha límite"
          name="dueDate"
          type="date"
          defaultValue={values?.dueDate}
          errors={state.fieldErrors?.dueDate}
        />
      </div>
    </form>
  );
}
