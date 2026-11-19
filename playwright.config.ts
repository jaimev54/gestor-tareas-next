import { defineConfig, devices } from "@playwright/test";

// Tests de extremo a extremo (e2e): abren la app en un navegador real.
// Playwright compila y arranca la app él solo (webServer) en el puerto 3100.

const PORT = 3100;
const isCI = Boolean(process.env.CI);

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: isCI, // en CI falla si alguien dejó un test.only
  retries: isCI ? 1 : 0,
  reporter: isCI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    locale: "es-MX",
    timezoneId: "America/Monterrey",
    trace: "retain-on-failure", // si un test falla, guarda una traza para ver qué pasó
  },
  projects: [
    { name: "escritorio", use: { ...devices["Desktop Chrome"] } },
    { name: "movil", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: `npm run build && npm run start -- --port ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !isCI,
    timeout: 180_000,
    env: { NEXT_DIST_DIR: ".next-e2e" },
  },
});
