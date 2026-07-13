import {
  copyFile,
  mkdir,
  readFile,
  readdir,
  rm,
  stat
} from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputRoot = path.join(projectRoot, "dist");

const requiredFiles = [
  "404.html",
  "catalogo.html",
  "contacto.html",
  "faq.html",
  "index.html",
  "privacidad.html",
  "robots.txt",
  "sitemap.xml",
  "styles.css"
];

const optionalFiles = [".nojekyll", "manifest.webmanifest"];
const publicDirectories = ["data"];
const scannableExtensions = new Set([".css", ".html", ".js", ".json", ".webmanifest", ".xml"]);
const assetReferencePattern = /(?:\/Prueba2\/|(?:\.\.?\/)?)assets\/[^\s"'`()<>?,#]+/gu;
const scriptReferencePattern = /(?:\/Prueba2\/|(?:\.\.?\/)?)js\/[A-Za-z\d_./-]+\.js/gu;
const moduleReferencePattern = /(?:\bfrom\s*|\bimport\s*(?:\(\s*)?)(["'])([^"']+\.js)\1/gu;

function assertInsideProject(candidate) {
  const relative = path.relative(projectRoot, candidate);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`Ruta fuera del proyecto rechazada: ${candidate}`);
  }
}

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

async function copyProjectFile(relativePath) {
  const normalized = relativePath.replaceAll("\\", "/").replace(/^\/+/, "");
  const source = path.resolve(projectRoot, normalized);
  const destination = path.resolve(outputRoot, normalized);
  assertInsideProject(source);

  if (!(await exists(source))) {
    throw new Error(`Falta el archivo público requerido: ${normalized}`);
  }

  await mkdir(path.dirname(destination), { recursive: true });
  await copyFile(source, destination);
  return normalized;
}

async function listFiles(directory, prefix = "") {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.isSymbolicLink()) {
      throw new Error(`No se permiten enlaces simbólicos en archivos públicos: ${entry.name}`);
    }

    const absolute = path.join(directory, entry.name);
    const relative = path.posix.join(prefix, entry.name);
    if (entry.isDirectory()) {
      files.push(...await listFiles(absolute, relative));
    } else if (entry.isFile()) {
      files.push(relative);
    }
  }

  return files;
}

async function copyDirectory(relativeDirectory) {
  const source = path.join(projectRoot, relativeDirectory);
  if (!(await exists(source))) {
    return [];
  }

  const files = await listFiles(source);
  return Promise.all(files.map((file) => copyProjectFile(path.posix.join(relativeDirectory, file))));
}

function normalizeAssetReference(reference) {
  return reference
    .replace(/^\/Prueba2\//u, "")
    .replace(/^\.\//u, "")
    .replace(/^\.\.\//u, "")
    .replaceAll("%20", " ");
}

async function discoverReferencedAssets(sourceFiles) {
  const assets = new Set();

  for (const relativePath of sourceFiles) {
    if (!scannableExtensions.has(path.extname(relativePath))) {
      continue;
    }

    const contents = await readFile(path.join(projectRoot, relativePath), "utf8");
    for (const match of contents.matchAll(assetReferencePattern)) {
      const asset = normalizeAssetReference(match[0]);
      if (asset.startsWith("assets/")) {
        assets.add(asset);
      }
    }
  }

  return [...assets].sort();
}

function normalizeScriptReference(reference, importer = "") {
  if (reference.startsWith("/Prueba2/")) {
    return reference.slice("/Prueba2/".length);
  }
  if (reference.startsWith("js/")) {
    return reference;
  }
  return path.posix.normalize(path.posix.join(path.posix.dirname(importer), reference));
}

async function discoverReferencedScripts(sourceFiles) {
  const scripts = new Set();

  for (const relativePath of sourceFiles) {
    if (!scannableExtensions.has(path.extname(relativePath))) {
      continue;
    }
    const contents = await readFile(path.join(projectRoot, relativePath), "utf8");
    for (const match of contents.matchAll(scriptReferencePattern)) {
      scripts.add(normalizeScriptReference(match[0].replace(/^\.\//u, "")));
    }
  }

  const queue = [...scripts];
  while (queue.length > 0) {
    const script = queue.shift();
    if (!script.startsWith("js/")) {
      throw new Error(`Módulo público fuera de js/: ${script}`);
    }

    const source = path.join(projectRoot, script);
    if (!(await exists(source))) {
      throw new Error(`Falta el módulo público requerido: ${script}`);
    }

    const contents = await readFile(source, "utf8");
    for (const match of contents.matchAll(moduleReferencePattern)) {
      const dependency = normalizeScriptReference(match[2], script);
      if (!dependency.startsWith("js/")) {
        throw new Error(`Importación fuera de js/ rechazada en ${script}: ${match[2]}`);
      }
      if (!scripts.has(dependency)) {
        scripts.add(dependency);
        queue.push(dependency);
      }
    }
  }

  return [...scripts].sort();
}

async function build() {
  await rm(outputRoot, { recursive: true, force: true });
  await mkdir(outputRoot, { recursive: true });

  const copiedSources = [];
  for (const file of requiredFiles) {
    copiedSources.push(await copyProjectFile(file));
  }

  for (const file of optionalFiles) {
    if (await exists(path.join(projectRoot, file))) {
      copiedSources.push(await copyProjectFile(file));
    }
  }

  for (const directory of publicDirectories) {
    copiedSources.push(...await copyDirectory(directory));
  }

  const scripts = await discoverReferencedScripts(copiedSources);
  for (const script of scripts) {
    copiedSources.push(await copyProjectFile(script));
  }

  const assets = await discoverReferencedAssets(copiedSources);
  for (const asset of assets) {
    await copyProjectFile(asset);
  }

  console.log(
    `Build listo: ${copiedSources.length + assets.length} archivos públicos en dist/ ` +
    `(${assets.length} activos referenciados).`
  );
}

await build();
