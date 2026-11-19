import path from "node:path";

import { defineConfig } from "vitest/config";

// Tests unitarios de la lógica pura (fechas, filtros, estadísticas, validaciones).
// Los de navegador están en e2e/ y los ejecuta Playwright, no Vitest.
export default defineConfig({
  resolve: {
    // El mismo alias "@/..." que usa Next (tsconfig.json → paths).
    alias: { "@": path.resolve(import.meta.dirname, "src") },
  },
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
  },
});
