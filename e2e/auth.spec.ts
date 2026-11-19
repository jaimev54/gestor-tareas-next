import { expect, test } from "@playwright/test";

// Estos tests no inician sesión ni crean cuentas: comprueban la protección de rutas
// y la validación de los formularios, que ocurre antes de llamar a Supabase.

test.describe("Rutas protegidas", () => {
  for (const path of ["/tareas", "/tablero", "/proyectos", "/panel"]) {
    test(`${path} sin sesión redirige al login recordando la página`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveURL(`/login?next=${encodeURIComponent(path)}`);
      await expect(page.getByRole("heading", { level: 1, name: "Inicia sesión" })).toBeVisible();
    });
  }
});

test.describe("Formulario de login", () => {
  test("vacío muestra los errores y enfoca el primer campo", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: "Iniciar sesión" }).click();

    // filter: Next añade su propio role="alert" vacío (anuncia los cambios de página).
    await expect(page.getByRole("alert").filter({ hasText: "Revisa los campos marcados." })).toBeVisible();
    const email = page.getByLabel("Correo");
    await expect(email).toHaveAttribute("aria-invalid", "true");
    await expect(email).toBeFocused();
    await expect(page.getByText("Escribe un correo válido")).toBeVisible();
    await expect(page.getByText("Escribe tu contraseña")).toBeVisible();
  });

  test("un enlace caducado muestra el aviso", async ({ page }) => {
    await page.goto("/login?error=enlace-invalido");
    await expect(page.getByText("El enlace no es válido o ya caducó")).toBeVisible();
  });
});

test.describe("Formulario de registro", () => {
  test("valida la contraseña y que coincidan", async ({ page }) => {
    await page.goto("/registro");
    await page.getByLabel("Nombre").fill("Prueba");
    await page.getByLabel("Correo").fill("prueba@example.com");
    await page.getByLabel("Contraseña", { exact: true }).fill("corta");
    await page.getByLabel("Repite la contraseña").fill("distinta");
    await page.getByRole("button", { name: "Crear cuenta" }).click();

    // exact: la ayuda del campo también empieza por "Mínimo 8 caracteres…"
    await expect(page.getByText("Mínimo 8 caracteres", { exact: true })).toBeVisible();
    await expect(page.getByText("Las contraseñas no coinciden")).toBeVisible();
    // Lo escrito se conserva tras el error (menos las contraseñas).
    await expect(page.getByLabel("Nombre")).toHaveValue("Prueba");
    await expect(page.getByLabel("Contraseña", { exact: true })).toHaveValue("");
  });
});

test("recuperar contraseña rechaza un correo mal escrito", async ({ page }) => {
  await page.goto("/recuperar-contrasena");
  await page.getByLabel("Correo").fill("no-es-un-correo");
  await page.getByRole("button", { name: "Enviar enlace" }).click();
  await expect(page.getByText("Escribe un correo válido")).toBeVisible();
});
