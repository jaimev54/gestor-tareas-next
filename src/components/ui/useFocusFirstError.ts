"use client";

import { type RefObject, useEffect } from "react";

import type { FormState } from "@/lib/forms";

/** Tras un envío con errores, mueve el foco al primer campo inválido (accesibilidad). */
export function useFocusFirstError(formRef: RefObject<HTMLFormElement | null>, state: FormState) {
  useEffect(() => {
    if (state.status !== "error") return;
    const firstInvalid = formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]');
    firstInvalid?.focus();
  }, [formRef, state]);
}
