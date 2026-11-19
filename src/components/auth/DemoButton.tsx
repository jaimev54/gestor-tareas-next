"use client";

import { PlayCircle } from "lucide-react";
import { useActionState } from "react";

import { buttonStyles } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/FormAlert";
import { loginAsDemo } from "@/lib/auth/actions";
import { initialFormState } from "@/lib/forms";

type DemoButtonProps = {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
};

/** Entra con la cuenta demo en un clic (sin formulario ni contraseña a la vista). */
export function DemoButton({ variant = "secondary", size = "md", className = "" }: DemoButtonProps) {
  const [state, formAction, pending] = useActionState(loginAsDemo, initialFormState);

  return (
    <form action={formAction} className={className}>
      <button type="submit" disabled={pending} className={buttonStyles({ variant, size, className: "w-full" })}>
        <PlayCircle className="size-5" aria-hidden="true" />
        {pending ? "Preparando la demo…" : "Probar la demo"}
      </button>
      {state.status === "error" && (
        <div className="mt-2">
          <FormAlert status="error" message={state.message} />
        </div>
      )}
    </form>
  );
}
