import { describe, expect, it } from "vitest";

import { loginSchema, signupSchema } from "./auth";
import { projectSchema } from "./projects";
import { tagIdsSchema } from "./tags";
import { createTaskSchema, moveTaskSchema, updateTaskSchema } from "./tasks";

const ID = "3f2b8c1e-1234-4abc-8def-0123456789ab";

/** Primer mensaje de error de un campo, para comprobar los textos en español. */
function firstError(result: { success: boolean; error?: { issues: { path: PropertyKey[]; message: string }[] } }, field: string) {
  return result.error?.issues.find((issue) => issue.path[0] === field)?.message;
}

describe("signupSchema", () => {
  const valid = { fullName: "Ana", email: "ANA@Example.com ", password: "secreta123", confirmPassword: "secreta123" };

  it("acepta datos válidos y normaliza el correo", () => {
    const result = signupSchema.safeParse(valid);
    expect(result.success).toBe(true);
    expect(result.data?.email).toBe("ana@example.com");
  });

  it.each([
    ["corta1", "Mínimo 8 caracteres"],
    ["sololetras", "Debe incluir al menos un número"],
    ["12345678", "Debe incluir al menos una letra"],
  ])("rechaza la contraseña %s", (password, message) => {
    const result = signupSchema.safeParse({ ...valid, password, confirmPassword: password });
    expect(firstError(result, "password")).toBe(message);
  });

  it("exige que las contraseñas coincidan", () => {
    const result = signupSchema.safeParse({ ...valid, confirmPassword: "otra12345" });
    expect(firstError(result, "confirmPassword")).toBe("Las contraseñas no coinciden");
  });
});

describe("loginSchema", () => {
  it("rechaza un correo mal escrito", () => {
    expect(firstError(loginSchema.safeParse({ email: "ana@", password: "x" }), "email")).toBe(
      "Escribe un correo válido",
    );
  });
});

describe("projectSchema", () => {
  it("recorta espacios y exige nombre", () => {
    expect(firstError(projectSchema.safeParse({ name: "   ", color: "indigo" }), "name")).toBe("Escribe un nombre");
  });

  it("solo acepta colores de la paleta", () => {
    expect(projectSchema.safeParse({ name: "Casa", color: "fucsia" }).success).toBe(false);
  });
});

describe("createTaskSchema", () => {
  it("con solo el título usa los valores por defecto", () => {
    expect(createTaskSchema.parse({ title: "  Llamar al banco " })).toEqual({
      title: "Llamar al banco",
      projectId: null,
      priority: "medium",
      dueDate: null,
    });
  });

  it("convierte los campos vacíos del formulario en null", () => {
    const result = createTaskSchema.parse({ title: "X", projectId: "", dueDate: "", priority: "high" });
    expect(result.projectId).toBeNull();
    expect(result.dueDate).toBeNull();
  });

  it("rechaza fechas que no existen", () => {
    expect(firstError(createTaskSchema.safeParse({ title: "X", dueDate: "2026-02-30" }), "dueDate")).toBe(
      "Fecha no válida",
    );
  });
});

describe("updateTaskSchema", () => {
  it("rechaza un estado inventado", () => {
    const result = updateTaskSchema.safeParse({
      title: "X",
      description: "",
      projectId: "",
      status: "archivada",
      priority: "low",
      dueDate: "",
    });
    expect(firstError(result, "status")).toBe("Estado no válido");
  });
});

describe("tagIdsSchema y moveTaskSchema", () => {
  it("limita a 20 etiquetas por tarea", () => {
    expect(tagIdsSchema.safeParse(Array(21).fill(ID)).success).toBe(false);
  });

  it("un movimiento necesita estado válido e ids UUID", () => {
    expect(moveTaskSchema.safeParse({ taskId: ID, status: "done", orderedIds: [ID] }).success).toBe(true);
    expect(moveTaskSchema.safeParse({ taskId: ID, status: "hecha", orderedIds: [ID] }).success).toBe(false);
    expect(moveTaskSchema.safeParse({ taskId: ID, status: "done", orderedIds: ["1"] }).success).toBe(false);
  });
});
