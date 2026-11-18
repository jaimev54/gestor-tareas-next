"use client";

import { Trash2 } from "lucide-react";
import { useActionState, useEffect, useId, useRef } from "react";

import { buttonStyles } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/FormAlert";
import { type FormState, initialFormState } from "@/lib/forms";

type ConfirmDeleteButtonProps = {
  /** Server Action ya "atada" al id, p. ej. deleteTask.bind(null, id). */
  action: (prev: FormState) => Promise<FormState>;
  /** Texto accesible del botón, p. ej. "Eliminar Trabajo". */
  label: string;
  title: string;
  description: string;
};

/**
 * Botón de papelera + diálogo de confirmación.
 * <dialog> nativo con showModal(): atrapa el foco, se cierra con Escape y
 * devuelve el foco al botón al cerrarse, sin librerías.
 */
export function ConfirmDeleteButton({ action, label, title, description }: ConfirmDeleteButtonProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [state, formAction, pending] = useActionState(action, initialFormState);

  useEffect(() => {
    if (state.status === "success") dialogRef.current?.close();
  }, [state]);

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        aria-label={label}
        title="Eliminar"
        className="inline-flex size-8 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-400"
      >
        <Trash2 className="size-4" aria-hidden="true" />
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-zinc-200 bg-white p-6 text-zinc-900 shadow-xl backdrop:bg-black/50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
      >
        <h2 id={titleId} className="text-lg font-semibold break-words">
          {title}
        </h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{description}</p>
        {state.status === "error" && (
          <div className="mt-4">
            <FormAlert status="error" message={state.message} />
          </div>
        )}
        <form action={formAction} className="mt-6 flex justify-end gap-2">
          {/* autoFocus en Cancelar: la opción segura recibe el foco al abrir */}
          <button
            type="button"
            autoFocus
            onClick={() => dialogRef.current?.close()}
            className={buttonStyles({ variant: "secondary" })}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={pending}
            className={buttonStyles({ className: "bg-red-600 hover:bg-red-500" })}
          >
            {pending ? "Eliminando…" : "Eliminar"}
          </button>
        </form>
      </dialog>
    </>
  );
}
