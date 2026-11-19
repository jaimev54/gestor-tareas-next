import { defineConfig, devices } from "@playwright/test";

// Genera las capturas del README a partir de la app desplegada (cuenta demo).
// Uso: npm run screenshots
// Otra URL: SCREENSHOT_URL=http://localhost:3000 npm run screenshots

export default defineConfig({
  testDir: "./scripts/screenshots",
  workers: 1, // en serie: cada entrada a la demo reinicia sus datos
  reporter: "list",
  timeout: 60_000,
  use: {
    baseURL: process.env.SCREENSHOT_URL ?? "https://gestor-tareas-next-fnfa.vercel.app",
    locale: "es-MX",
    timezoneId: "America/Monterrey",
  },
  projects: [
    { name: "escritorio", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } } },
    { name: "movil", use: { ...devices["Pixel 7"] } },
  ],
});
