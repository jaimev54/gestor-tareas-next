"use client";

import { useActionState, useRef } from "react";

import { FormAlert } from "@/components/ui/FormAlert";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { TextField } from "@/components/ui/TextField";
import { useFocusFirstError } from "@/components/ui/useFocusFirstError";
import { requestPasswordReset } from "@/lib/auth/actions";
import { initialFormState } from "@/lib/forms";

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(requestPasswordReset, initialFormState);
  const formRef = useRef<HTMLFormElement>(null);
  useFocusFirstError(formRef, state);

  if (state.status === "success") {
    return <FormAlert status="success" message={state.message} />;
  }

  return (
    <form ref={formRef} action={formAction} noValidate className="flex flex-col gap-4">
      <FormAlert status={state.status} message={state.message} />

      <TextField
        label="Correo"
        name="email"
        type="email"
        autoComplete="email"
        required
        defaultValue={state.values?.email}
        errors={state.fieldErrors?.email}
      />

      <SubmitButton pending={pending}>Enviar enlace</SubmitButton>
    </form>
  );
}
