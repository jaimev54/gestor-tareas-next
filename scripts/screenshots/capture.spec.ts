import { type Page, expect, test } from "@playwright/test";

const OUT = "docs/screenshots";

/** Fija el tema antes de cargar la página (lo lee el script de tema de la app). */
async function useTheme(page: Page, theme: "light" | "dark") {
  await page.addInitScript((value) => localStorage.setItem("theme", value), theme);
}

async function enterDemo(page: Page) {
  await page.goto("/login");
  await page.getByRole("button", { name: "Probar la demo" }).click();
  await page.waitForURL("**/tareas");
  await expect(page.getByText("cuenta demo")).toBeVisible();
}

/** Espera a que no queden esqueletos de carga antes de capturar. */
async function settle(page: Page) {
  await page.waitForLoadState("networkidle");
  await expect(page.locator(".animate-pulse")).toHaveCount(0);
}

test.describe("escritorio", () => {
  test.skip(({ isMobile }) => isMobile, "solo escritorio");

  test("inicio", async ({ page }) => {
    await useTheme(page, "light");
    await page.goto("/");
    await settle(page);
    await page.screenshot({ path: `${OUT}/inicio.png` });
  });

  test("app (claro)", async ({ page }) => {
    await useTheme(page, "light");
    await enterDemo(page);

    await settle(page);
    await page.screenshot({ path: `${OUT}/tareas.png` });

    await page.goto("/tablero");
    await settle(page);
    await page.screenshot({ path: `${OUT}/tablero.png` });

    await page.goto("/panel");
    await settle(page);
    await page.screenshot({ path: `${OUT}/panel.png`, fullPage: true });
  });

  test("app (oscuro)", async ({ page }) => {
    await useTheme(page, "dark");
    await enterDemo(page);
    await page.goto("/tablero");
    await settle(page);
    await page.screenshot({ path: `${OUT}/tablero-oscuro.png` });
  });
});

test.describe("móvil", () => {
  test.skip(({ isMobile }) => !isMobile, "solo móvil");

  test("tareas y panel", async ({ page }) => {
    await useTheme(page, "light");
    await enterDemo(page);
    await settle(page);
    await page.screenshot({ path: `${OUT}/movil-tareas.png` });

    await page.goto("/panel");
    await settle(page);
    await page.screenshot({ path: `${OUT}/movil-panel.png` });
  });
});
