import { z } from "zod";

import { COLOR_NAMES } from "@/lib/colors";

// Mismos límites que los CHECK de la tabla projects (1-80 caracteres).
export const projectSchema = z.object({
  name: z
    .string({ error: "Escribe un nombre" })
    .trim()
    .min(1, { error: "Escribe un nombre" })
    .max(80, { error: "Máximo 80 caracteres" }),
  color: z.enum(COLOR_NAMES, { error: "Elige un color de la lista" }),
});

export const idSchema = z.uuid({ error: "Identificador no válido" });
