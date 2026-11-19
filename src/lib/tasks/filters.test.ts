import { describe, expect, it } from "vitest";

import { EMPTY_FILTERS, countActiveFilters, parseTaskFilters, sanitizeSearch, tasksUrl } from "./filters";

const ID = "3f2b8c1e-1234-4abc-8def-0123456789ab";

describe("parseTaskFilters", () => {
  it("lee una URL válida", () => {
    expect(
      parseTaskFilters({ q: " informe ", proyecto: ID, etiqueta: ID, prioridad: "alta", estado: "hecha", vence: "hoy" }),
    ).toEqual({ q: "informe", project: ID, tag: ID, priority: "alta", status: "hecha", due: "hoy" });
  });

  it("sin parámetros devuelve los filtros vacíos", () => {
    expect(parseTaskFilters({})).toEqual(EMPTY_FILTERS);
  });

  it("acepta la bandeja de entrada como proyecto", () => {
    expect(parseTaskFilters({ proyecto: "bandeja" }).project).toBe("bandeja");
  });

  it("ignora valores no válidos en lugar de fallar", () => {
    expect(
      parseTaskFilters({ proyecto: "xx", etiqueta: "1", prioridad: "urgente", estado: "borrada", vence: "ayer" }),
    ).toEqual(EMPTY_FILTERS);
  });

  it("no acepta claves heredadas del prototipo (toString, constructor…)", () => {
    expect(parseTaskFilters({ prioridad: "toString", estado: "constructor" })).toEqual(EMPTY_FILTERS);
  });

  it("si un parámetro se repite, usa el primero", () => {
    expect(parseTaskFilters({ prioridad: ["baja", "alta"] }).priority).toBe("baja");
  });

  it("recorta la búsqueda a 100 caracteres", () => {
    expect(parseTaskFilters({ q: "a".repeat(150) }).q).toHaveLength(100);
  });
});

describe("tasksUrl", () => {
  it("sin filtros devuelve la ruta limpia", () => {
    expect(tasksUrl({})).toBe("/tareas");
  });

  it("solo incluye los filtros con valor", () => {
    expect(tasksUrl({ q: "hola mundo", priority: "alta", tag: "" })).toBe("/tareas?q=hola+mundo&prioridad=alta");
  });

  it("acepta otra ruta base (tablero)", () => {
    expect(tasksUrl({ due: "vencidas" }, "/tablero")).toBe("/tablero?vence=vencidas");
  });

  it("ida y vuelta: construir la URL y leerla da los mismos filtros", () => {
    const filters = { ...EMPTY_FILTERS, tag: ID, due: "semana" as const, q: "café" };
    const query = tasksUrl(filters).split("?")[1];
    expect(parseTaskFilters(Object.fromEntries(new URLSearchParams(query)))).toEqual(filters);
  });
});

describe("sanitizeSearch", () => {
  it("quita los caracteres especiales de PostgREST y LIKE", () => {
    expect(sanitizeSearch('a,b(c)%_*"d:e\\f')).toBe("a b c d e f");
  });

  it("conserva acentos y ñ", () => {
    expect(sanitizeSearch("  Reunión   con Íñigo ")).toBe("Reunión con Íñigo");
  });
});

describe("countActiveFilters", () => {
  it("cuenta solo los que tienen valor", () => {
    expect(countActiveFilters({ ...EMPTY_FILTERS, q: "x", tag: ID, due: "hoy" })).toBe(3);
    expect(countActiveFilters(EMPTY_FILTERS)).toBe(0);
  });
});
