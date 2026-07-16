import { expect, test } from "@playwright/test";

async function openCatalog(page) {
  await page.goto("catalogo.html", { waitUntil: "networkidle" });
  await expect(page.locator("#results-summary")).toContainText("11 líneas");
}

test("buscador, filtros, orden y estado sin resultados", async ({ page }) => {
  await openCatalog(page);

  await page.locator("#catalog-search").fill("ninos");
  await expect(page.locator("#results-summary")).toHaveText("1 línea encontrada");
  await expect(page.locator(".product-card h3")).toHaveText("Ropa para niños");

  await page.locator("#catalog-search").fill("peluches");
  await expect(page.locator("#results-summary")).toHaveText("1 línea encontrada");
  await expect(page.locator(".product-card h3")).toHaveText("Peluches");

  await page.locator("#catalog-search").fill("");
  if (!(await page.locator("#category-filter").isVisible())) {
    await page.getByRole("button", { name: "Mostrar filtros" }).click();
  }
  await page.locator("#category-filter").selectOption("ropa");
  await expect(page.locator("#results-summary")).toHaveText("4 líneas encontradas");
  await expect(page).toHaveURL(/category=ropa/u);

  await page.locator("#catalog-sort").selectOption("name-desc");
  await expect(page.locator(".product-card h3").first()).toHaveText("Ropa para niños");

  await page.getByRole("button", { name: /Quitar filtro Ropa/u }).click();
  await page.locator("#status-filter").selectOption("available");
  await expect(page.locator("#results-summary")).toHaveText("4 líneas encontradas");
  await expect(page.getByRole("heading", { name: "Grasa de res" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Ropa americana" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Ropa para niños" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Peluches" })).toBeVisible();
  await expect(page.locator(".product-card__price").first()).toHaveText("Bs 15 / kg");

  await page.getByRole("button", { name: /Quitar filtro Disponible/u }).click();
  await page.locator("#catalog-search").fill("producto inexistente");
  await expect(page.locator("#catalog-empty")).toBeVisible();
  await page.getByRole("button", { name: "Ver todo el catálogo" }).click();
  await expect(page.locator("#results-summary")).toContainText("11 líneas");
});

test("ficha de producto accesible y precio confirmado dentro del diálogo", async ({ page }) => {
  await openCatalog(page);
  const trigger = page.getByRole("button", { name: "Ver detalle de Grasa de res" });
  await trigger.focus();
  await trigger.click();

  const dialog = page.getByRole("dialog", { name: "Detalle: Grasa de res" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText("Bs 15 / kg")).toBeVisible();
  await dialog.getByRole("button", { name: "Agregar Grasa de res a mi lista" }).click();
  await expect(dialog.getByRole("status")).toHaveText("Grasa de res se agregó a tu lista.");
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(page.locator("[data-consult-count]").first()).toHaveText("1");
});

test("lista, kilos, unidades, nota, persistencia y mensaje de WhatsApp", async ({ page }) => {
  await openCatalog(page);
  await page.getByRole("button", { name: "Agregar Grasa de res a mi lista" }).click();
  await page.getByRole("button", { name: "Agregar Ropa americana a mi lista" }).click();

  await page.locator("[data-consult-open]:visible").first().click();
  const dialog = page.getByRole("dialog", { name: "Mi lista de consulta" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Aumentar cantidad de Grasa de res" }).click();
  await expect(dialog.getByText("2 kg")).toBeVisible();
  await expect(dialog.getByText("1 unidad")).toBeVisible();

  const note = dialog.getByLabel("Nota para la consulta (opcional)");
  await expect(note).toHaveAttribute("maxlength", "500");
  await note.fill("Confirmar detalles, por favor.");
  await expect(dialog.getByText("2 líneas en la lista")).toBeVisible();

  const whatsappHref = await dialog.getByRole("link", { name: "Abrir WhatsApp" }).getAttribute("href");
  const whatsappUrl = new URL(whatsappHref);
  expect(whatsappUrl.hostname).toBe("wa.me");
  expect(whatsappUrl.pathname).toBe("/59175103979");
  const message = whatsappUrl.searchParams.get("text");
  expect(message).toContain("1. Grasa de res — 2 kg");
  expect(message).toContain("2. Ropa americana — 1 unidad");
  expect(message).toContain("Nota: Confirmar detalles, por favor.");
  expect(message).toContain("¿Me confirma disponibilidad, precio final, forma de pago y entrega?");

  await page.keyboard.press("Escape");
  await page.reload({ waitUntil: "networkidle" });
  await expect(page.locator("[data-consult-count]").first()).toHaveText("2");
  await page.locator("[data-consult-open]:visible").first().click();
  await expect(page.getByLabel("Nota para la consulta (opcional)")).toHaveValue("Confirmar detalles, por favor.");
  page.once("dialog", (confirmation) => confirmation.accept());
  await page.getByRole("button", { name: "Vaciar lista" }).click();
  await expect(page.getByText("Tu lista está vacía")).toBeVisible();
  await expect(page.locator("[data-consult-count]").first()).toHaveText("0");
});

test("la lista conserva el foco al cambiar cantidad y al eliminar", async ({ page }) => {
  await openCatalog(page);
  await page.getByRole("button", { name: "Agregar Grasa de res a mi lista" }).click();
  await page.getByRole("button", { name: "Agregar Ropa americana a mi lista" }).click();
  await page.locator("[data-consult-open]:visible").first().click();
  const dialog = page.getByRole("dialog", { name: "Mi lista de consulta" });

  const increase = dialog.getByRole("button", { name: "Aumentar cantidad de Grasa de res" });
  await increase.click();
  await expect(increase).toBeFocused();

  await dialog.getByRole("button", { name: "Eliminar Grasa de res" }).click();
  await expect(dialog.getByRole("button", { name: "Eliminar Ropa americana" })).toBeFocused();
});

test("recupera de almacenamiento local corrupto", async ({ page }) => {
  await page.goto("catalogo.html", { waitUntil: "networkidle" });
  await page.evaluate(() => {
    globalThis.localStorage.setItem("vendedor-scz:consultation:v2", "{dato roto");
  });
  await page.reload({ waitUntil: "networkidle" });
  await expect(page.locator("[data-consult-count]").first()).toHaveText("0");
  await page.locator("[data-consult-open]:visible").first().click();
  await expect(page.getByText("Tu lista está vacía")).toBeVisible();
});

test("alcanzar 999 kg no provoca un error de página", async ({ page }) => {
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.goto("catalogo.html", { waitUntil: "networkidle" });
  await page.evaluate(() => {
    globalThis.localStorage.setItem("vendedor-scz:consultation:v2", JSON.stringify({
      schemaVersion: 2,
      items: [{ id: "grasa-de-res", name: "Grasa de res", quantity: 999, unit: "kg", step: 1 }],
      note: ""
    }));
  });
  await page.reload({ waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Agregar Grasa de res a mi lista" }).click();
  await expect(page.locator("[data-toast]")).toHaveText("Alcanzaste la cantidad máxima para este producto.");
  await expect(page.locator("[data-consult-count]").first()).toHaveText("1");
  expect(pageErrors).toEqual([]);
});
