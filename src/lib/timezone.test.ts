import { describe, expect, it } from "vitest";

import { addDaysIso, isValidTimeZone, isoDateInTimeZone } from "./timezone";

describe("isValidTimeZone", () => {
  it.each(["America/Monterrey", "America/Mexico_City", "UTC", "Europe/Madrid"])("acepta %s", (tz) => {
    expect(isValidTimeZone(tz)).toBe(true);
  });

  it.each(["", "Marte/Olympus", "a".repeat(80)])("rechaza %s", (tz) => {
    expect(isValidTimeZone(tz)).toBe(false);
  });
});

describe("isoDateInTimeZone", () => {
  // 2026-11-19 02:00 UTC = 2026-11-18 20:00 en Monterrey (UTC-6)
  const instant = new Date("2026-11-19T02:00:00Z");

  it("a las 20:00 en Monterrey sigue siendo el mismo día", () => {
    expect(isoDateInTimeZone(instant, "America/Monterrey")).toBe("2026-11-18");
  });

  it("en UTC ya es el día siguiente", () => {
    expect(isoDateInTimeZone(instant, "UTC")).toBe("2026-11-19");
  });
});

describe("addDaysIso", () => {
  it.each([
    ["2026-11-28", 6, "2026-12-04"],
    ["2026-12-31", 1, "2027-01-01"],
    ["2026-03-01", -1, "2026-02-28"],
    ["2028-03-01", -1, "2028-02-29"],
  ])("%s + %i días = %s", (iso, days, expected) => {
    expect(addDaysIso(iso, days)).toBe(expected);
  });
});
