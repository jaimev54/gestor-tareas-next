import { z } from "zod";

import { COLOR_NAMES } from "@/lib/colors";

// Mismos límites que la tabla tags (1-30 caracteres).
export const tagSchema = z.object({
  name: z
    .string({ error: "Escribe un nombre" })
    .trim()
    .min(1, { error: "Escribe un nombre" })
    .max(30, { error: "Máximo 30 caracteres" }),
  color: z.enum(COLOR_NAMES, { error: "Elige un color de la lista" }),
});

/** Lista de ids de etiquetas que llega de las casillas del formulario. */
export const tagIdsSchema = z
  .array(z.uuid({ error: "Etiqueta no válida" }))
  .max(20, { error: "Máximo 20 etiquetas por tarea" });

export const subtaskSchema = z.object({
  title: z
    .string({ error: "Escribe la subtarea" })
    .trim()
    .min(1, { error: "Escribe la subtarea" })
    .max(200, { error: "Máximo 200 caracteres" }),
});
