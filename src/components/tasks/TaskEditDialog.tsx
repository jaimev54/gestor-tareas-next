"use client";

import { Pencil } from "lucide-react";
import { useActionState, useEffect, useId, useRef, useState } from "react";

import { TagPicker } from "@/components/tags/TagPicker";
import { buttonStyles } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/FormAlert";
import { SelectField } from "@/components/ui/SelectField";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { TextField } from "@/components/ui/TextField";
import { useFocusFirstError } from "@/components/ui/useFocusFirstError";
import { initialFormState } from "@/lib/forms";
import type { Tag } from "@/lib/tags/queries";
import { updateTask } from "@/lib/tasks/actions";
import type { Task, TaskProject } from "@/lib/tasks/queries";

import { PRIORITY_OPTIONS, STATUS_OPTIONS, projectOptions } from "./options";
import { SubtaskList } from "./SubtaskList";

type TaskEditDialogProps = {
  task: Task;
  projects: TaskProject[];
  tags: Tag[];
};

/** Botón de lápiz + diálogo con todos los campos de la tarea, sus etiquetas y subtareas. */
export function TaskEditDialog({ task, projects, tags }: TaskEditDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  // El contenido se monta al abrir: así cada apertura empieza con los datos actuales.
  const [open, setOpen] = useState(false);
  const titleId = useId();

  function show() {
    setOpen(true);
    dialogRef.current?.showModal();
  }

  return (
    <>
      <button
        type="button"
        onClick={show}
        aria-label={`Editar ${task.title}`}
        title="Editar"
        className="inline-flex size-8 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
      >
        <Pencil className="size-4" aria-hidden="true" />
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        onClose={() => setOpen(false)}
        className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-6 text-zinc-900 shadow-xl backdrop:bg-black/50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
      >
        <h2 id={titleId} className="mb-4 text-lg font-semibold">
          Editar tarea
        </h2>
        {open && (
          <TaskEditContent
            task={task}
            projects={projects}
            tags={tags}
            onClose={() => dialogRef.current?.close()}
          />
        )}
      </dialog>
    </>
  );
}

function TaskEditContent({ task, projects, tags, onClose }: TaskEditDialogProps & { onClose: () => void }) {
  const [state, formAction, pending] = useActionState(updateTask.bind(null, task.id), initialFormState);
  const formRef = useRef<HTMLFormElement>(null);
  const formId = useId();
  useFocusFirstError(formRef, state);

  useEffect(() => {
    if (state.status === "success") onClose();
  }, [state, onClose]);

  // Tras un error, React limpia el form: lo rellenamos con lo que el usuario había escrito.
  const v = state.status === "error" ? state.values : undefined;
  const prefix = `task-${task.id}`;

  return (
    <div className="flex flex-col gap-6">
      <form id={formId} ref={formRef} action={formAction} noValidate className="flex flex-col gap-4">
        <FormAlert status={state.status === "error" ? "error" : "idle"} message={state.message} />

        <TextField
          id={`${prefix}-title`}
          label="Título"
          name="title"
          maxLength={200}
          required
          autoComplete="off"
          defaultValue={v?.title ?? task.title}
          errors={state.fieldErrors?.title}
        />
        <TextAreaField
          id={`${prefix}-description`}
          label="Descripción"
          name="description"
          maxLength={5000}
          placeholder="Notas, enlaces, detalles…"
          defaultValue={v?.description ?? task.description ?? ""}
          errors={state.fieldErrors?.description}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            id={`${prefix}-project`}
            label="Proyecto"
            name="projectId"
            options={projectOptions(projects)}
            defaultValue={v?.projectId ?? task.project?.id ?? ""}
            errors={state.fieldErrors?.projectId}
          />
          <SelectField
            id={`${prefix}-status`}
            label="Estado"
            name="status"
            options={STATUS_OPTIONS}
            defaultValue={v?.status ?? task.status}
            errors={state.fieldErrors?.status}
          />
          <SelectField
            id={`${prefix}-priority`}
            label="Prioridad"
            name="priority"
            options={PRIORITY_OPTIONS}
            defaultValue={v?.priority ?? task.priority}
            errors={state.fieldErrors?.priority}
          />
          <TextField
            id={`${prefix}-due`}
            label="Fecha límite"
            name="dueDate"
            type="date"
            defaultValue={v?.dueDate ?? task.dueDate ?? ""}
            errors={state.fieldErrors?.dueDate}
          />
        </div>
        <TagPicker tags={tags} selectedIds={task.tags.map((t) => t.id)} />
      </form>

      {/* Fuera del <form>: un formulario no puede contener otro (el de añadir subtarea). */}
      <div className="border-t border-zinc-200 pt-4 dark:border-zinc-800">
        <SubtaskList taskId={task.id} subtasks={task.subtasks} />
      </div>

      {/* Los botones están fuera del form pero lo envían gracias al atributo form={formId}. */}
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onClose} className={buttonStyles({ variant: "secondary" })}>
          Cerrar
        </button>
        <button type="submit" form={formId} disabled={pending} className={buttonStyles()}>
          {pending ? "Guardando…" : "Guardar"}
        </button>
      </div>
    </div>
  );
}
