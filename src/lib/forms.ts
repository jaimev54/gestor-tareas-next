import { z } from "zod";

/**
 * Estado que devuelve una Server Action a su formulario (vía useActionState).
 * `values` permite volver a rellenar los campos tras un error: React 19 limpia
 * el formulario después de cada envío. Nunca devuelvas contraseñas aquí.
 */
export type FormState = {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  values?: Record<string, string>;
};

export const initialFormState: FormState = { status: "idle" };

/** Convierte FormData en un objeto plano de strings. */
export function formDataToObject(formData: FormData) {
  const result: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") result[key] = value;
  }
  return result;
}

/** Estado de error a partir de una validación fallida de Zod. */
export function validationError(error: z.ZodError, values: Record<string, string>): FormState {
  return {
    status: "error",
    message: "Revisa los campos marcados.",
    fieldErrors: z.flattenError(error).fieldErrors as FormState["fieldErrors"],
    values,
  };
}

/** Quita los campos sensibles antes de devolver los valores al navegador. */
export function withoutSecrets(values: Record<string, string>) {
  const safe: Record<string, string> = {};
  for (const [key, value] of Object.entries(values)) {
    if (!/password/i.test(key)) safe[key] = value;
  }
  return safe;
}
