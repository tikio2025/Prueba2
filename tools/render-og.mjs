import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(projectRoot, "assets", "og-vendedor-scz.svg");
const output = path.join(projectRoot, "assets", "og-vendedor-scz.png");

await mkdir(path.dirname(output), { recursive: true });
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(source).href, { waitUntil: "load" });
  await page.screenshot({ path: output, fullPage: false, animations: "disabled" });
  console.log(`Imagen social generada: ${path.relative(projectRoot, output)} (1200 × 630).`);
} finally {
  await browser.close();
}
