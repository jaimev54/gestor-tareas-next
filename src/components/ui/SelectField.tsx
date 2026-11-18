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
        <select name={name} className={controlClasses} {...a11y} {...selectProps}>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </FieldShell>
  );
}
