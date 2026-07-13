import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const publicPages = [
  "",
  "catalogo.html",
  "contacto.html",
  "faq.html",
  "privacidad.html",
  "404.html"
];

for (const route of publicPages) {
  test(`${route || "inicio"}: carga sin errores graves`, async ({ page }) => {
    const runtimeErrors = [];
    page.on("console", (message) => {
      if (message.type() === "error") {
        runtimeErrors.push(`console: ${message.text()}`);
      }
    });
    page.on("pageerror", (error) => runtimeErrors.push(`pageerror: ${error.message}`));

    const response = await page.goto(route, { waitUntil: "networkidle" });
    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(/\S+/u);
    expect(runtimeErrors).toEqual([]);

    const horizontalOverflow = await page.evaluate(() => {
      const root = globalThis.document.documentElement;
      return root.scrollWidth > root.clientWidth + 1;
    });
    expect(horizontalOverflow).toBe(false);

    const accessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(accessibility.violations).toEqual([]);
  });
}

test("las páginas internas no se publican", async ({ request }) => {
  for (const route of ["login.html", "coordinacion-ia.html", "ramificaciones.html"]) {
    const response = await request.get(route);
    expect(response.status(), route).toBe(404);
  }
});

test("la 404 personalizada funciona desde una ruta anidada", async ({ page }) => {
  const runtimeErrors = [];
  page.on("response", (response) => {
    if (response.status() >= 400 && response.request().resourceType() !== "document") {
      runtimeErrors.push(`${response.status()} ${response.url()}`);
    }
  });
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  const response = await page.goto("ruta/que-no-existe", { waitUntil: "networkidle" });
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "Esta página no está en la vitrina." })).toBeVisible();
  expect(await page.evaluate(() => globalThis.document.styleSheets.length)).toBeGreaterThan(0);
  expect(runtimeErrors).toEqual([]);
});

test("el menú móvil abre, cierra con Escape y restaura el foco", async ({ page }) => {
  await page.goto("", { waitUntil: "networkidle" });
  const toggle = page.locator("[data-nav-toggle]");
  const navigation = page.locator("[data-nav]");
  if (await toggle.isVisible()) {
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await expect(navigation).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(toggle).toBeFocused();
  } else {
    await expect(navigation).toBeVisible();
  }
});

test("inicio y catálogo no desbordan en anchos objetivo", async ({ page }) => {
  for (const width of [320, 360, 390, 430, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ["", "catalogo.html"]) {
      await page.goto(route, { waitUntil: "networkidle" });
      const dimensions = await page.evaluate(() => {
        const root = globalThis.document.documentElement;
        return { client: root.clientWidth, scroll: root.scrollWidth };
      });
      expect(dimensions.scroll, `${route || "inicio"} a ${width}px`).toBeLessThanOrEqual(
        dimensions.client + 1
      );
    }
  }
});
