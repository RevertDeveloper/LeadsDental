import { expect, test } from "@playwright/test";

const email = process.env.E2E_EMAIL;
const password = process.env.E2E_PASSWORD;
const aiEnabled = process.env.E2E_AI_ENABLED === "true";
const missingConfiguration = [
  !email && "E2E_EMAIL",
  !password && "E2E_PASSWORD",
  !aiEnabled && "E2E_AI_ENABLED=true",
].filter(Boolean);

test.describe("Vitalis CRM demo flow", () => {
  test.skip(
    missingConfiguration.length > 0,
    `E2E no ejecutable: falta ${missingConfiguration.join(", ")}.`,
  );

  test("completes login, lead lifecycle, activity, AI and deletion", async ({ page }) => {
    const suffix = `${Date.now()}${Math.floor(Math.random() * 1000)}`.slice(-8);
    const initialName = `Lead E2E ${suffix}`;
    const editedName = `${initialName} editado`;
    const phone = `+34 600 ${suffix.slice(0, 3)} ${suffix.slice(3)}`;

    await page.goto("/login");
    await page.getByLabel("Correo electrónico").fill(email!);
    await page.getByLabel("Contraseña").fill(password!);
    await page.getByRole("button", { name: "Entrar al CRM" }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole("heading", { name: /^Hola,/ })).toBeVisible();

    await page.goto("/leads/new");
    await page.getByLabel("Nombre completo").fill(initialName);
    await page.getByLabel("Teléfono").fill(phone);
    await page.getByLabel("Clínica").selectOption({ label: "Clínica Dental Vitalis Madrid" });
    await page.getByLabel("Tratamiento de interés").selectOption("implantes");
    await page.getByLabel("Fuente del lead").selectOption("web");
    await page.getByLabel("Estado").selectOption("nuevo");
    await page.getByRole("button", { name: "Crear lead" }).click();
    await expect(page).toHaveURL(/\/leads$/);
    await expect(page.getByRole("link", { name: initialName, exact: true })).toBeVisible();

    await page.getByRole("link", { name: initialName, exact: true }).click();
    await expect(page).toHaveURL(/\/leads\/[^/]+$/);

    await page.getByLabel("Contenido de la nota").fill("Llamada registrada durante la demo E2E.");
    await page.getByRole("button", { name: "Añadir a la timeline" }).click();
    await expect(page.getByText("Actividad registrada en la timeline.")).toBeVisible();
    await expect(page.getByText("Llamada registrada durante la demo E2E.")).toBeVisible();

    await page.getByRole("button", { name: "Generar mensaje de seguimiento" }).click();
    await expect(page.getByText("Borrador generado")).toBeVisible({ timeout: 60_000 });
    await expect(page.getByText("Mensaje generado por IA").first()).toBeVisible();

    await page.getByRole("link", { name: "Editar lead" }).click();
    await expect(page).toHaveURL(/\/leads\/[^/]+\/edit$/);
    await page.getByLabel("Nombre completo").fill(editedName);
    await page.getByRole("button", { name: "Guardar cambios" }).click();
    await expect(page).toHaveURL(/\/leads$/);
    await expect(page.getByRole("link", { name: editedName, exact: true })).toBeVisible();

    const leadRow = page.getByRole("row").filter({ hasText: editedName });
    await leadRow.getByRole("button", { name: "Eliminar" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByRole("dialog").getByRole("button", { name: "Eliminar lead" }).click();
    await expect(page.getByRole("link", { name: editedName, exact: true })).toHaveCount(0);
  });
});
