import type { ComponentProps } from "react";

import { FieldShell, controlClasses } from "./FieldShell";

// ComponentProps<"input"> incluye `ref`: en React 19 un componente función recibe ref como prop normal.
type TextFieldProps = ComponentProps<"input"> & {
  label: string;
  name: string;
  errors?: string[];
  hint?: string;
  hideLabel?: boolean;
};

/** Campo de texto con label, ayuda y errores accesibles (aria-invalid + aria-describedby). */
export function TextField({ label, name, errors, hint, hideLabel, id, className, ...inputProps }: TextFieldProps) {
  return (
    <FieldShell id={id ?? name} label={label} hint={hint} errors={errors} hideLabel={hideLabel} className={className}>
      {(a11y) => <input name={name} className={controlClasses} {...a11y} {...inputProps} />}
    </FieldShell>
  );
}
