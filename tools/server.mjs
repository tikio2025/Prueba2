import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import process from "node:process";

const mimeTypes = new Map([
  [".avif", "image/avif"],
  [".css", "text/css; charset=utf-8"],
  [".gif", "image/gif"],
  [".html", "text/html; charset=utf-8"],
  [".ico", "image/x-icon"],
  [".jpeg", "image/jpeg"],
  [".jpg", "image/jpeg"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml; charset=utf-8"],
  [".txt", "text/plain; charset=utf-8"],
  [".webmanifest", "application/manifest+json; charset=utf-8"],
  [".webp", "image/webp"],
  [".xml", "application/xml; charset=utf-8"]
]);

function readArgument(name, fallback) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : fallback;
}

const root = path.resolve(readArgument("--root", "dist"));
const port = Number.parseInt(readArgument("--port", "4173"), 10);
const requestedBase = readArgument("--base", "/Prueba2/");
const base = `/${requestedBase.replace(/^\/+|\/+$/gu, "")}/`;

if (!Number.isInteger(port) || port < 1 || port > 65_535) {
  throw new Error("El puerto debe ser un número entre 1 y 65535.");
}

async function isFile(candidate) {
  try {
    return (await stat(candidate)).isFile();
  } catch (error) {
    if (error.code === "ENOENT") {
      return false;
    }
    throw error;
  }
}

function setSecurityHeaders(response) {
  response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("X-Frame-Options", "DENY");
}

function sendFile(request, response, candidate, statusCode = 200) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", mimeTypes.get(path.extname(candidate).toLowerCase()) ?? "application/octet-stream");
  response.setHeader(
    "Cache-Control",
    path.extname(candidate) === ".html" ? "no-cache" : "public, max-age=300"
  );

  if (request.method === "HEAD") {
    response.end();
    return;
  }

  createReadStream(candidate).pipe(response);
}

const server = createServer(async (request, response) => {
  setSecurityHeaders(response);

  if (!request.url || !["GET", "HEAD"].includes(request.method ?? "")) {
    response.statusCode = 405;
    response.setHeader("Allow", "GET, HEAD");
    response.end("Método no permitido");
    return;
  }

  const url = new URL(request.url, `http://${request.headers.host ?? "127.0.0.1"}`);
  let pathname;
  try {
    pathname = decodeURIComponent(url.pathname);
  } catch {
    response.statusCode = 400;
    response.end("Ruta inválida");
    return;
  }

  if (pathname === "/") {
    response.statusCode = 302;
    response.setHeader("Location", base);
    response.end();
    return;
  }

  if (!pathname.startsWith(base)) {
    response.statusCode = 404;
    response.end("No encontrado");
    return;
  }

  const relativeUrl = pathname.slice(base.length).replace(/^\/+/, "") || "index.html";
  const candidate = path.resolve(root, relativeUrl);
  const relativeToRoot = path.relative(root, candidate);

  if (relativeToRoot.startsWith("..") || path.isAbsolute(relativeToRoot)) {
    response.statusCode = 403;
    response.end("Ruta rechazada");
    return;
  }

  if (await isFile(candidate)) {
    sendFile(request, response, candidate);
    return;
  }

  const notFound = path.join(root, "404.html");
  if (await isFile(notFound)) {
    sendFile(request, response, notFound, 404);
    return;
  }

  response.statusCode = 404;
  response.end("No encontrado");
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Servidor local: http://127.0.0.1:${port}${base}`);
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
