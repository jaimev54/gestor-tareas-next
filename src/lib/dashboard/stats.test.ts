import { describe, expect, it } from "vitest";

import { completedLast7Days, completedPerWeek, summarizeOpen, weekStart } from "./stats";

const TZ = "America/Monterrey";
const TODAY = "2026-11-18"; // miércoles

describe("weekStart", () => {
  it.each([
    ["2026-11-18", "2026-11-16"], // miércoles → lunes
    ["2026-11-22", "2026-11-16"], // domingo → lunes anterior
    ["2026-11-16", "2026-11-16"], // lunes → el mismo
    ["2027-01-01", "2026-12-28"], // cruza de año
  ])("la semana de %s empieza el %s", (day, monday) => {
    expect(weekStart(day)).toBe(monday);
  });
});

describe("completedPerWeek", () => {
  const weeks = completedPerWeek(
    [
      "2026-11-16T15:00:00Z", // lunes de esta semana
      "2026-11-16T05:30:00Z", // domingo 15, 23:30 en Monterrey → semana anterior
      "2026-11-10T12:00:00Z", // semana anterior
      "2026-09-01T12:00:00Z", // hace más de 8 semanas → no cuenta
    ],
    TODAY,
    TZ,
  );

  it("devuelve 8 semanas, de la más antigua a la actual", () => {
    expect(weeks).toHaveLength(8);
    expect(weeks[0].weekStart).toBe("2026-09-28");
    expect(weeks[7].weekStart).toBe("2026-11-16");
  });

  it("agrupa según el día en la zona del usuario, no en UTC", () => {
    expect(weeks[7].count).toBe(1);
    expect(weeks[6].count).toBe(2);
  });

  it("ignora las completadas fuera del rango", () => {
    expect(weeks.reduce((sum, w) => sum + w.count, 0)).toBe(3);
  });

  it("sin datos, todas las semanas a cero", () => {
    expect(completedPerWeek([], TODAY, "UTC").every((w) => w.count === 0)).toBe(true);
  });
});

describe("summarizeOpen", () => {
  it("cuenta vencidas, de hoy, de la semana y por prioridad", () => {
    const summary = summarizeOpen(
      [
        { dueDate: "2026-11-17", priority: "high" }, // vencida
        { dueDate: "2026-11-18", priority: "high" }, // hoy
        { dueDate: "2026-11-24", priority: "low" }, // dentro de 7 días (último día)
        { dueDate: "2026-11-25", priority: "medium" }, // fuera de la semana
        { dueDate: null, priority: "medium" },
      ],
      TODAY,
    );
    expect(summary).toEqual({
      total: 5,
      overdue: 1,
      dueToday: 1,
      dueThisWeek: 2,
      byPriority: { high: 2, medium: 2, low: 1 },
    });
  });
});

describe("completedLast7Days", () => {
  it("compara los últimos 7 días (12-18) con los 7 anteriores (5-11)", () => {
    const result = completedLast7Days(
      [
        "2026-11-18T18:00:00Z",
        "2026-11-12T18:00:00Z",
        "2026-11-11T18:00:00Z",
        "2026-11-05T18:00:00Z",
        "2026-11-04T18:00:00Z", // fuera de ambos periodos
      ],
      TODAY,
      TZ,
    );
    expect(result).toEqual({ current: 2, previous: 2, delta: 0 });
  });
});
