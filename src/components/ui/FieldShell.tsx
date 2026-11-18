// Estructura común de los campos de formulario: label + control + ayuda + error,
// con los ids que necesitan aria-describedby y aria-invalid.

export const controlClasses =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-900 shadow-sm outline-none transition placeholder:text-zinc-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 aria-invalid:border-red-500 aria-invalid:focus:ring-red-500/30 sm:text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";

export type FieldA11yProps = {
  id: string;
  "aria-invalid"?: true;
  "aria-describedby"?: string;
};

type FieldShellProps = {
  id: string;
  label: string;
  hint?: string;
  errors?: string[];
  /** Oculta el label visualmente (sigue disponible para lectores de pantalla). */
  hideLabel?: boolean;
  className?: string;
  children: (a11y: FieldA11yProps) => React.ReactNode;
};

export function FieldShell({ id, label, hint, errors, hideLabel, className, children }: FieldShellProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = errors?.length ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={`flex flex-col gap-1.5 ${className ?? ""}`}>
      <label htmlFor={id} className={hideLabel ? "sr-only" : "text-sm font-medium"}>
        {label}
      </label>
      {children({
        id,
        "aria-invalid": errorId ? true : undefined,
        "aria-describedby": describedBy,
      })}
      {hint && (
        <p id={hintId} className="text-xs text-zinc-500 dark:text-zinc-400">
          {hint}
        </p>
      )}
      {errorId && (
        <p id={errorId} className="text-sm text-red-600 dark:text-red-400">
          {errors![0]}
        </p>
      )}
    </div>
  );
}
