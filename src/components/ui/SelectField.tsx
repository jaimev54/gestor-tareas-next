import { ChevronDown } from "lucide-react";
import type { SelectHTMLAttributes } from "react";

import { FieldShell, controlClasses } from "./FieldShell";

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  errors?: string[];
  hint?: string;
  hideLabel?: boolean;
};

export function SelectField({
  label,
  name,
  options,
  errors,
  hint,
  hideLabel,
  id,
  className,
  ...selectProps
}: SelectFieldProps) {
  return (
    <FieldShell id={id ?? name} label={label} hint={hint} errors={errors} hideLabel={hideLabel} className={className}>
      {(a11y) => (
        // appearance-none quita el estilo nativo (en Safari de iPhone el select sale gris y distinto
        // a los demás campos); la flecha se dibuja aparte para que se vea igual en todos los navegadores.
        <div className="relative">
          <select name={name} className={`${controlClasses} appearance-none pr-9`} {...a11y} {...selectProps}>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-zinc-500 dark:text-zinc-400"
          />
        </div>
      )}
    </FieldShell>
  );
}
