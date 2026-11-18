import type { TextareaHTMLAttributes } from "react";

import { FieldShell, controlClasses } from "./FieldShell";

type TextAreaFieldProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  name: string;
  errors?: string[];
  hint?: string;
};

export function TextAreaField({ label, name, errors, hint, id, className, ...props }: TextAreaFieldProps) {
  return (
    <FieldShell id={id ?? name} label={label} hint={hint} errors={errors} className={className}>
      {(a11y) => <textarea name={name} rows={4} className={controlClasses} {...a11y} {...props} />}
    </FieldShell>
  );
}
