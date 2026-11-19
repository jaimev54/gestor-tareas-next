import { describe, expect, it } from "vitest";

import { DEFAULT_AFTER_LOGIN, matchesPrefix, safeNextPath } from "./routes";

describe("safeNextPath (protección contra open redirect)", () => {
  it.each(["/tareas", "/proyectos?x=1", "/tablero#col"])("acepta la ruta interna %s", (path) => {
    expect(safeNextPath(path)).toBe(path);
  });

  it.each([
    "https://sitio-malo.com",
    "//sitio-malo.com",
    "/\\sitio-malo.com",
    "javascript:alert(1)",
    "tareas",
    "",
    null,
    undefined,
  ])("rechaza %s y usa la ruta por defecto", (path) => {
    expect(safeNextPath(path)).toBe(DEFAULT_AFTER_LOGIN);
  });
});

describe("matchesPrefix", () => {
  it("coincide con la ruta y sus subrutas", () => {
    expect(matchesPrefix("/tareas", ["/tareas"])).toBe(true);
    expect(matchesPrefix("/tareas/123", ["/tareas"])).toBe(true);
  });

  it("no confunde rutas que solo empiezan igual", () => {
    expect(matchesPrefix("/tareas-viejas", ["/tareas"])).toBe(false);
  });
});
