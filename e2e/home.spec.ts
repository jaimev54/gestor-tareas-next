import { expect, test } from "@playwright/test";

test.describe("Página de inicio", () => {
  test("muestra el titular y lleva al registro", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle("Gestor de tareas");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Organiza tus tareas");

    await page.getByRole("link", { name: "Empieza gratis" }).click();
    await expect(page).toHaveURL("/registro");
    await expect(page.getByRole("heading", { level: 1, name: "Crea tu cuenta" })).toBeVisible();
  });

  test("el enlace 'Saltar al contenido' es lo primero al pulsar Tab", async ({ page, browserName }) => {
    test.skip(browserName !== "chromium", "El foco con Tab varía entre navegadores");
    await page.goto("/");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Saltar al contenido" })).toBeFocused();
  });

  test("el tema elegido se mantiene al recargar", async ({ page }) => {
    await page.goto("/");
    const html = page.locator("html");

    // sistema → claro → oscuro
    await page.getByRole("button", { name: /^Tema: sistema/ }).click();
    await page.getByRole("button", { name: /^Tema: claro/ }).click();
    await expect(html).toHaveAttribute("data-theme", "dark");

    await page.reload();
    await expect(html).toHaveAttribute("data-theme", "dark");
    await expect(page.getByRole("button", { name: /^Tema: oscuro/ })).toBeVisible();
  });
});

test("las respuestas llevan las cabeceras de seguridad", async ({ request }) => {
  const response = await request.get("/");
  const headers = response.headers();
  expect(headers["x-frame-options"]).toBe("DENY");
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
});

test("una ruta inexistente responde 404 con página propia", async ({ page }) => {
  const response = await page.goto("/esta-pagina-no-existe");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "Página no encontrada" })).toBeVisible();
});
