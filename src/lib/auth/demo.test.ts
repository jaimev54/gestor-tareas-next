import { describe, expect, it } from "vitest";

import { DEMO_EMAIL, isDemoEmail } from "./demo";

describe("isDemoEmail", () => {
  it("reconoce el correo de la demo sin importar mayúsculas", () => {
    expect(isDemoEmail(DEMO_EMAIL)).toBe(true);
    expect(isDemoEmail("Demo@Example.com")).toBe(true);
  });

  it("no confunde otros correos", () => {
    expect(isDemoEmail("jaime@example.com")).toBe(false);
    expect(isDemoEmail("demo@example.com.mx")).toBe(false);
    expect(isDemoEmail(undefined)).toBe(false);
  });
});
