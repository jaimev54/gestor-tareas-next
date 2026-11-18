"use client";

import { useActionState, useRef } from "react";

import { FormAlert } from "@/components/ui/FormAlert";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { TextField } from "@/components/ui/TextField";
import { useFocusFirstError } from "@/components/ui/useFocusFirstError";
import { signup } from "@/lib/auth/actions";
import { initialFormState } from "@/lib/forms";

export function SignupForm() {
  const [state, formAction, pending] = useActionState(signup, initialFormState);
  const formRef = useRef<HTMLFormElement>(null);
  useFocusFirstError(formRef, state);

  // Tras registrarse con éxito, solo mostramos el aviso de revisar el correo.
  if (state.status === "success") {
    return <FormAlert status="success" message={state.message} />;
  }

  return (
    <form ref={formRef} action={formAction} noValidate className="flex flex-col gap-4">
      <FormAlert status={state.status} message={state.message} />

      <TextField
        label="Nombre"
        name="fullName"
        autoComplete="name"
        required
        defaultValue={state.values?.fullName}
        errors={state.fieldErrors?.fullName}
      />
      <TextField
        label="Correo"
        name="email"
        type="email"
        autoComplete="email"
        required
        defaultValue={state.values?.email}
        errors={state.fieldErrors?.email}
      />
      <TextField
        label="Contraseña"
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

      <SubmitButton pending={pending} pendingText="Creando cuenta…">
        Crear cuenta
      </SubmitButton>
    </form>
  );
}
