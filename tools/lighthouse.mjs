import { chromium } from "@playwright/test";
import lighthouse from "lighthouse";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const evidenceRoot = path.join(projectRoot, "docs", "evidence");
const siteUrl = "http://127.0.0.1:4174/Prueba2/";
const debugPort = 9223;
const profile = await mkdtemp(path.join(os.tmpdir(), "vendedor-scz-lighthouse-"));

async function waitFor(url, attempts = 60) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
    } catch {
      // El proceso todavía está arrancando.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`No se pudo iniciar ${url}.`);
}

async function stopProcess(child) {
  if (child.exitCode !== null) {
    return;
  }
  child.kill();
  await Promise.race([
    once(child, "exit"),
    new Promise((resolve) => setTimeout(resolve, 2000))
  ]);
}

const server = spawn(process.execPath, [
  "tools/server.mjs",
  "--root",
  "dist",
  "--port",
  "4174",
  "--base",
  "/Prueba2/"
], { cwd: projectRoot, stdio: "ignore", windowsHide: true });

const chrome = spawn(chromium.executablePath(), [
  "--headless=new",
  `--remote-debugging-port=${debugPort}`,
  `--user-data-dir=${profile}`,
  "--no-first-run",
  "--disable-background-networking",
  "--disable-gpu",
  "about:blank"
], { stdio: "ignore", windowsHide: true });

try {
  await Promise.all([
    waitFor(siteUrl),
    waitFor(`http://127.0.0.1:${debugPort}/json/version`)
  ]);
  const result = await lighthouse(siteUrl, {
    port: debugPort,
    output: "html",
    logLevel: "error",
    onlyCategories: ["performance", "accessibility", "best-practices", "seo"]
  });
  if (!result) {
    throw new Error("Lighthouse no devolvió resultados.");
  }

  const scores = Object.fromEntries(Object.entries(result.lhr.categories).map(([id, category]) => [
    id,
    Math.round((category.score ?? 0) * 100)
  ]));
  const summary = {
    url: siteUrl,
    generatedAt: new Date().toISOString(),
    lighthouseVersion: result.lhr.lighthouseVersion,
    scores
  };
  await mkdir(evidenceRoot, { recursive: true });
  await Promise.all([
    writeFile(path.join(evidenceRoot, "lighthouse-home.html"), result.report, "utf8"),
    writeFile(path.join(evidenceRoot, "lighthouse-summary.json"), `${JSON.stringify(summary, null, 2)}\n`, "utf8"),
    writeFile(path.join(evidenceRoot, "lighthouse-lhr.json"), `${JSON.stringify(result.lhr)}\n`, "utf8")
  ]);
  console.log(`Lighthouse móvil: ${JSON.stringify(scores)}.`);
  const minimums = { performance: 90, accessibility: 95, "best-practices": 95, seo: 95 };
  const failures = Object.entries(minimums).filter(([category, minimum]) => scores[category] < minimum);
  if (failures.length > 0) {
    process.exitCode = 1;
  }
} finally {
  await Promise.all([stopProcess(server), stopProcess(chrome)]);
  await rm(profile, { recursive: true, force: true, maxRetries: 8, retryDelay: 250 });
}
