"use client";

import { Plus, X } from "lucide-react";
import { useActionState, useEffect, useOptimistic, useRef, useTransition } from "react";

import { FormAlert } from "@/components/ui/FormAlert";
import { initialFormState } from "@/lib/forms";
import type { Subtask } from "@/lib/tasks/queries";
import { addSubtask, deleteSubtask, setSubtaskDone } from "@/lib/tasks/subtask-actions";

type SubtaskListProps = {
  taskId: string;
  subtasks: Subtask[];
};

/** Checklist dentro de una tarea. Cada cambio se guarda al momento. */
export function SubtaskList({ taskId, subtasks }: SubtaskListProps) {
  const [state, formAction, pending] = useActionState(addSubtask.bind(null, taskId), initialFormState);
  const inputRef = useRef<HTMLInputElement>(null);

  // Tras añadir una, el foco vuelve al campo para escribir la siguiente.
  useEffect(() => {
    if (state.status === "success") inputRef.current?.focus();
  }, [state]);

  const doneCount = subtasks.filter((s) => s.isDone).length;
  const inputId = `subtask-new-${taskId}`;

  return (
    <section aria-labelledby={`subtasks-${taskId}-title`}>
      <h3 id={`subtasks-${taskId}-title`} className="mb-2 text-sm font-medium">
        Subtareas{" "}
        {subtasks.length > 0 && (
          <span className="font-normal text-zinc-500">
            ({doneCount}/{subtasks.length})
          </span>
        )}
      </h3>

      {subtasks.length > 0 && (
        <ul className="mb-3 space-y-1">
          {subtasks.map((subtask) => (
            <SubtaskRow key={subtask.id} subtask={subtask} />
          ))}
        </ul>
      )}

      {state.status === "error" && (
        <div className="mb-2">
          <FormAlert status="error" message={state.fieldErrors?.title?.[0] ?? state.message} />
        </div>
      )}
      <form action={formAction} noValidate className="flex gap-2">
        <label htmlFor={inputId} className="sr-only">
          Nueva subtarea
        </label>
        <input
          ref={inputRef}
          id={inputId}
          name="title"
          maxLength={200}
          autoComplete="off"
          placeholder="Añadir subtarea…"
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 dark:border-zinc-700 dark:bg-zinc-900"
        />
        <button
          type="submit"
          disabled={pending}
          aria-label="Añadir subtarea"
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-zinc-300 text-zinc-600 transition hover:bg-zinc-100 disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          <Plus className="size-4" aria-hidden="true" />
        </button>
      </form>
    </section>
  );
}

function SubtaskRow({ subtask }: { subtask: Subtask }) {
  const [optimisticDone, setOptimisticDone] = useOptimistic(subtask.isDone);
  const [deleting, startTransition] = useTransition();
  const checkboxId = `subtask-${subtask.id}`;

  return (
    <li className={`group flex items-center gap-2 rounded-lg px-1 py-1 ${deleting ? "opacity-50" : ""}`}>
      <input
        id={checkboxId}
        type="checkbox"
        checked={optimisticDone}
        onChange={() =>
          startTransition(async () => {
            setOptimisticDone(!optimisticDone);
            await setSubtaskDone(subtask.id, !optimisticDone);
          })
        }
        className="size-4 shrink-0 cursor-pointer accent-indigo-600"
      />
      <label
        htmlFor={checkboxId}
        className={`min-w-0 flex-1 cursor-pointer text-sm break-words ${
          optimisticDone ? "text-zinc-400 line-through" : ""
        }`}
      >
        {subtask.title}
      </label>
      <button
        type="button"
        disabled={deleting}
        onClick={() => startTransition(async () => void (await deleteSubtask(subtask.id)))}
        aria-label={`Eliminar subtarea ${subtask.title}`}
        className="inline-flex size-7 shrink-0 items-center justify-center rounded text-zinc-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
      >
        <X className="size-4" aria-hidden="true" />
      </button>
    </li>
  );
}
