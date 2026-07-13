import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputRoot = path.join(projectRoot, "docs", "evidence", "screenshots");
const baseUrl = "http://127.0.0.1:4175/Prueba2/";

async function waitForServer() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      if ((await fetch(baseUrl)).ok) {
        return;
      }
    } catch {
      // El servidor todavía está iniciando.
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error("No se pudo iniciar el servidor para las capturas.");
}

async function stopProcess(child) {
  if (child.exitCode !== null) {
    return;
  }
  child.kill();
  await Promise.race([once(child, "exit"), new Promise((resolve) => setTimeout(resolve, 1500))]);
}

await mkdir(outputRoot, { recursive: true });
const server = spawn(process.execPath, [
  "tools/server.mjs",
  "--root",
  "dist",
  "--port",
  "4175",
  "--base",
  "/Prueba2/"
], { cwd: projectRoot, stdio: "ignore", windowsHide: true });

let browser;
try {
  await waitForServer();
  browser = await chromium.launch();

  const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  await desktop.goto(baseUrl, { waitUntil: "networkidle" });
  await desktop.locator("#home-products .product-card").first().waitFor();
  await desktop.screenshot({ path: path.join(outputRoot, "inicio-desktop.png"), fullPage: false });

  await desktop.goto(`${baseUrl}catalogo.html`, { waitUntil: "networkidle" });
  await desktop.getByRole("button", { name: "Agregar Grasa de res a mi lista" }).click();
  await desktop.getByRole("button", { name: "Agregar Ropa americana a mi lista" }).click();
  await desktop.locator("[data-consult-open]:visible").first().click();
  await desktop.getByRole("dialog", { name: "Mi lista de consulta" }).waitFor();
  await desktop.screenshot({ path: path.join(outputRoot, "lista-consulta-desktop.png"), fullPage: false });

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  await mobile.goto(`${baseUrl}catalogo.html`, { waitUntil: "networkidle" });
  await mobile.locator(".product-card").first().waitFor();
  await mobile.screenshot({ path: path.join(outputRoot, "catalogo-mobile-390.png"), fullPage: false });

  console.log("Capturas generadas en docs/evidence/screenshots/.");
} finally {
  await browser?.close();
  await stopProcess(server);
}
