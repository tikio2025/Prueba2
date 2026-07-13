import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const outputRoot = path.resolve(process.argv[2] ?? "dist");
const basePath = "/Prueba2/";
const errors = [];

const forbiddenPublicPaths = [
  "docs",
  "internal",
  "tests",
  "tools",
  "coordinacion-ia.html",
  "gemini-code-1783496564365.html",
  "login.html",
  "ramificaciones.html"
];

const secretPatterns = [
  { label: "token de GitHub", pattern: /\bgh[pousr]_[A-Za-z0-9_]{20,}\b/gu },
  { label: "clave de OpenAI", pattern: /\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}\b/gu },
  { label: "clave de Google", pattern: /\bAIza[0-9A-Za-z_-]{30,}\b/gu },
  { label: "clave privada", pattern: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/gu }
];

const knownUnverifiedClaims = [
  { label: "entrega el mismo día", pattern: /entregas? el mismo d[ií]a para pedidos/giu },
  { label: "envío gratuito a Warnes", pattern: /env[ií]os? gratuit[oa]s? a Warnes/giu },
  { label: "servicio financiero no confirmado", pattern: /\bYodlee\b/giu },
  { label: "teléfono TollFree no verificado", pattern: /\bTollFree\b/gu },
  { label: "pintura de pared no confirmada", pattern: /pinturas?.{0,60}(?:litros?|mate|satinad[oa]|pared)/giu }
];

async function exists(candidate) {
  try {
    await stat(candidate);
    return true;
  } catch (error) {
    if (error.code === "ENOENT") {
      return false;
    }
    throw error;
  }
}

async function listFiles(directory, prefix = "") {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const relative = path.posix.join(prefix, entry.name);
    if (entry.isDirectory()) {
      files.push(...await listFiles(path.join(directory, entry.name), relative));
    } else if (entry.isFile()) {
      files.push(relative);
    }
  }

  return files;
}

function report(file, message) {
  errors.push(`${file}: ${message}`);
}

function stripQueryAndHash(value) {
  return value.split("#", 1)[0].split("?", 1)[0];
}

function isExternalReference(value) {
  return /^(?:[a-z][a-z\d+.-]*:|\/\/)/iu.test(value);
}

async function checkLocalReference(sourceFile, rawReference) {
  const reference = rawReference.trim();
  if (!reference || reference.startsWith("#") || isExternalReference(reference)) {
    return;
  }

  const cleanReference = stripQueryAndHash(reference);
  if (!cleanReference) {
    return;
  }

  if (cleanReference.startsWith("/") && !cleanReference.startsWith(basePath)) {
    report(sourceFile, `ruta absoluta incompatible con GitHub Pages: ${reference}`);
    return;
  }

  let decoded;
  try {
    decoded = decodeURIComponent(cleanReference);
  } catch {
    report(sourceFile, `URL local con codificación inválida: ${reference}`);
    return;
  }

  const relativeReference = decoded.startsWith(basePath)
    ? decoded.slice(basePath.length)
    : decoded.replace(/^\.?\//u, "");
  let candidate = decoded.startsWith(basePath)
    ? path.resolve(outputRoot, relativeReference)
    : path.resolve(outputRoot, path.dirname(sourceFile), relativeReference);

  if (decoded.endsWith("/")) {
    candidate = path.join(candidate, "index.html");
  }

  const relativeToRoot = path.relative(outputRoot, candidate);
  if (relativeToRoot.startsWith("..") || path.isAbsolute(relativeToRoot)) {
    report(sourceFile, `referencia fuera de dist/: ${reference}`);
    return;
  }

  if (!(await exists(candidate))) {
    report(sourceFile, `recurso local inexistente: ${reference}`);
  }
}

async function checkHtml(relativeFile, contents) {
  if (!/<html\b[^>]*\blang=["']es-BO["']/iu.test(contents)) {
    report(relativeFile, "debe declarar lang=\"es-BO\"");
  }
  if (!/<title>\s*[^<]+\s*<\/title>/iu.test(contents)) {
    report(relativeFile, "falta un título no vacío");
  }
  if (!/<meta\b(?=[^>]*\bname=["']description["'])(?=[^>]*\bcontent=["'][^"']+["'])[^>]*>/iu.test(contents)) {
    report(relativeFile, "falta meta description no vacía");
  }
  if (!/<meta\b[^>]*\bname=["']viewport["']/iu.test(contents)) {
    report(relativeFile, "falta meta viewport");
  }

  if (relativeFile !== "404.html") {
    const publicRoute = relativeFile === "index.html" ? "" : relativeFile;
    const expectedCanonical = `https://tikio2025.github.io${basePath}${publicRoute}`;
    const canonicalTag = [...contents.matchAll(/<link\b[^>]*>/giu)].find(
      ([tag]) => /\brel=["']canonical["']/iu.test(tag)
    );
    const canonicalHref = canonicalTag?.[0].match(/\bhref=["']([^"']+)["']/iu)?.[1];
    if (canonicalHref !== expectedCanonical) {
      report(relativeFile, `canonical incorrecto; se esperaba ${expectedCanonical}`);
    }
  }

  const attributePattern = /\b(?:action|href|poster|src)\s*=\s*(["'])(.*?)\1/giu;
  for (const match of contents.matchAll(attributePattern)) {
    await checkLocalReference(relativeFile, match[2]);
  }

  const srcsetPattern = /\bsrcset\s*=\s*(["'])(.*?)\1/giu;
  for (const match of contents.matchAll(srcsetPattern)) {
    for (const candidate of match[2].split(",")) {
      await checkLocalReference(relativeFile, candidate.trim().split(/\s+/u)[0]);
    }
  }

  if (/\b(?:href|src)=["'][^"']*(?:login|coordinacion-ia|ramificaciones|gemini-code)/iu.test(contents)) {
    report(relativeFile, "enlaza una página interna o una función no disponible");
  }
}

async function checkCss(relativeFile, contents) {
  const urlPattern = /url\(\s*(["']?)(.*?)\1\s*\)/giu;
  for (const match of contents.matchAll(urlPattern)) {
    await checkLocalReference(relativeFile, match[2]);
  }
}

async function checkSitemap(relativeFile, contents) {
  const locationPattern = /<loc>\s*(.*?)\s*<\/loc>/giu;
  for (const match of contents.matchAll(locationPattern)) {
    let url;
    try {
      url = new URL(match[1]);
    } catch {
      report(relativeFile, `URL inválida en sitemap: ${match[1]}`);
      continue;
    }

    if (!url.pathname.startsWith(basePath)) {
      report(relativeFile, `URL fuera de ${basePath}: ${url.pathname}`);
      continue;
    }

    await checkLocalReference(relativeFile, url.pathname);
  }
}

async function main() {
  if (!(await exists(outputRoot))) {
    throw new Error(`No existe ${outputRoot}. Ejecuta npm run build primero.`);
  }

  const files = await listFiles(outputRoot);

  for (const forbidden of forbiddenPublicPaths) {
    if (files.some((file) => file === forbidden || file.startsWith(`${forbidden}/`))) {
      report(forbidden, "archivo o carpeta interna incluida en producción");
    }
  }

  for (const relativeFile of files) {
    const extension = path.extname(relativeFile).toLowerCase();
    if (![".css", ".html", ".js", ".json", ".txt", ".webmanifest", ".xml"].includes(extension)) {
      continue;
    }

    const contents = await readFile(path.join(outputRoot, relativeFile), "utf8");
    for (const { label, pattern } of [...secretPatterns, ...knownUnverifiedClaims]) {
      pattern.lastIndex = 0;
      if (pattern.test(contents)) {
        report(relativeFile, `contiene ${label}`);
      }
    }

    if (extension === ".html") {
      await checkHtml(relativeFile, contents);
    } else if (extension === ".css") {
      await checkCss(relativeFile, contents);
    } else if (relativeFile === "sitemap.xml") {
      await checkSitemap(relativeFile, contents);
    }
  }

  if (errors.length > 0) {
    console.error(`Control de contenido falló con ${errors.length} problema(s):`);
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log(`Contenido verificado: ${files.length} archivos públicos, sin rutas rotas locales ni secretos detectados.`);
}

await main();
