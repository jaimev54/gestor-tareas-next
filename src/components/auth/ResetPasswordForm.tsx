"use client";

import { useActionState, useRef } from "react";

import { FormAlert } from "@/components/ui/FormAlert";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { TextField } from "@/components/ui/TextField";
import { useFocusFirstError } from "@/components/ui/useFocusFirstError";
import { updatePassword } from "@/lib/auth/actions";
import { initialFormState } from "@/lib/forms";

export function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState(updatePassword, initialFormState);
  const formRef = useRef<HTMLFormElement>(null);
  useFocusFirstError(formRef, state);

  return (
    <form ref={formRef} action={formAction} noValidate className="flex flex-col gap-4">
      <FormAlert status={state.status} message={state.message} />

      <TextField
        label="Contraseña nueva"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        hint="Mínimo 8 caracteres, con al menos una letra y un número."
        errors={state.fieldErrors?.password}
      />
      <TextField
        label="Repite la contraseña"
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        required
        errors={state.fieldErrors?.confirmPassword}
      />

      <SubmitButton pending={pending} pendingText="Guardando…">
        Guardar contraseña
      </SubmitButton>
    </form>
  );
}
