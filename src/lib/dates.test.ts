import { describe, expect, it } from "vitest";

import { daysBetween, formatIsoDate, isValidIsoDate, localIsoDate } from "./dates";

describe("isValidIsoDate", () => {
  it.each(["2026-11-18", "2028-02-29", "2026-12-31"])("acepta %s", (value) => {
    expect(isValidIsoDate(value)).toBe(true);
  });

  it.each(["2026-02-30", "2026-02-29", "2026-13-01", "18/11/2026", "2026-1-5", ""])("rechaza %s", (value) => {
    expect(isValidIsoDate(value)).toBe(false);
  });
});

describe("formatIsoDate", () => {
  it("omite el año si es el actual", () => {
    expect(formatIsoDate("2026-11-18", 2026)).toBe("18 nov");
  });

  it("muestra el año si es otro", () => {
    expect(formatIsoDate("2027-01-05", 2026)).toBe("5 ene 2027");
  });

  it("no se desplaza un día por la zona horaria", () => {
    // new Date("2026-11-18") sería medianoche UTC = día 17 en México. Aquí no debe pasar.
    expect(formatIsoDate("2026-11-18", 2026)).toContain("18");
  });
});

describe("daysBetween", () => {
  it.each([
    ["2026-11-17", "2026-11-18", 1],
    ["2026-11-18", "2026-11-17", -1],
    ["2026-11-18", "2026-11-18", 0],
    ["2026-12-31", "2027-01-01", 1],
    ["2028-02-28", "2028-03-01", 2],
  ])("de %s a %s son %i días", (a, b, expected) => {
    expect(daysBetween(a, b)).toBe(expected);
  });
});

describe("localIsoDate", () => {
  it("devuelve la fecha local con formato YYYY-MM-DD", () => {
    expect(localIsoDate(new Date(2026, 0, 5, 23, 59))).toBe("2026-01-05");
  });
});
