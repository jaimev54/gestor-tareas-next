import { z } from "zod";

import { isValidIsoDate } from "@/lib/dates";
import { TASK_PRIORITIES, TASK_STATUSES } from "@/lib/tasks/constants";

// Los formularios envían "" cuando un campo opcional está vacío: lo convertimos a null.
const emptyToNull = (v: unknown) => (typeof v === "string" && v.trim() === "" ? null : v);

const title = z
  .string({ error: "Escribe un título" })
  .trim()
  .min(1, { error: "Escribe un título" })
  .max(200, { error: "Máximo 200 caracteres" });

const projectId = z.preprocess(
  emptyToNull,
  z.uuid({ error: "Proyecto no válido" }).nullable(),
);

const priority = z.enum(TASK_PRIORITIES, { error: "Prioridad no válida" });

const dueDate = z.preprocess(
  emptyToNull,
  z.string().refine(isValidIsoDate, { error: "Fecha no válida" }).nullable(),
);

/** Alta rápida: solo título obligatorio. */
export const createTaskSchema = z.object({
  title,
  projectId: projectId.optional().default(null),
  priority: priority.optional().default("medium"),
  dueDate: dueDate.optional().default(null),
});

/** Edición completa. */
export const updateTaskSchema = z.object({
  title,
  description: z.preprocess(
    emptyToNull,
    z.string().trim().max(5000, { error: "Máximo 5000 caracteres" }).nullable(),
  ),
  projectId,
  status: z.enum(TASK_STATUSES, { error: "Estado no válido" }),
  priority,
  dueDate,
});
