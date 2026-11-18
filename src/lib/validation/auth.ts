import { z } from "zod";

// Esquemas de validación de los formularios de autenticación.
// Se usan en el servidor (Server Actions): la validación del navegador es solo comodidad.

const email = z
  .string({ error: "Escribe tu correo" })
  .trim()
  .toLowerCase()
  .pipe(z.email({ error: "Escribe un correo válido" }));

const newPassword = z
  .string({ error: "Escribe una contraseña" })
  .min(8, { error: "Mínimo 8 caracteres" })
  .max(72, { error: "Máximo 72 caracteres" })
  .regex(/[a-zA-Z]/, { error: "Debe incluir al menos una letra" })
  .regex(/[0-9]/, { error: "Debe incluir al menos un número" });

export const loginSchema = z.object({
  email,
  password: z.string({ error: "Escribe tu contraseña" }).min(1, { error: "Escribe tu contraseña" }),
});

export const signupSchema = z
  .object({
    fullName: z
      .string({ error: "Escribe tu nombre" })
      .trim()
      .min(1, { error: "Escribe tu nombre" })
      .max(80, { error: "Máximo 80 caracteres" }),
    email,
    password: newPassword,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({ email });

export const resetPasswordSchema = z
  .object({ password: newPassword, confirmPassword: z.string() })
  .refine((data) => data.password === data.confirmPassword, {
    error: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });
