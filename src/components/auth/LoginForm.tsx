"use client";

import Link from "next/link";
import { useActionState, useRef } from "react";

import { FormAlert } from "@/components/ui/FormAlert";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { TextField } from "@/components/ui/TextField";
import { useFocusFirstError } from "@/components/ui/useFocusFirstError";
import { login } from "@/lib/auth/actions";
import { initialFormState } from "@/lib/forms";
import { ROUTES } from "@/lib/routes";

type LoginFormProps = {
  next?: string;
  notice?: string;
};

export function LoginForm({ next, notice }: LoginFormProps) {
  // useActionState: el equivalente a manejar el estado de un form reactivo en Angular,
  // pero el "submit" ejecuta una Server Action y devuelve el nuevo estado.
  const [state, formAction, pending] = useActionState(login, initialFormState);
  const formRef = useRef<HTMLFormElement>(null);
  useFocusFirstError(formRef, state);

  return (
    <form ref={formRef} action={formAction} noValidate className="flex flex-col gap-4">
      {state.status === "idle" && notice && <FormAlert status="error" message={notice} />}
      <FormAlert status={state.status} message={state.message} />

      <input type="hidden" name="next" value={next ?? ""} />

      <TextField
        label="Correo"
        name="email"
        type="email"
        autoComplete="email"
        required
        defaultValue={state.values?.email}
        errors={state.fieldErrors?.email}
      />
      <div className="flex flex-col gap-1.5">
        <TextField
          label="Contraseña"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          errors={state.fieldErrors?.password}
        />
        <Link
          href={ROUTES.forgotPassword}
          className="self-end text-sm text-indigo-600 hover:underline dark:text-indigo-400"
        >
          ¿Olvidaste tu contraseña?
        </Link>
      </div>

      <SubmitButton pending={pending} pendingText="Entrando…">
        Iniciar sesión
      </SubmitButton>
    </form>
  );
}
