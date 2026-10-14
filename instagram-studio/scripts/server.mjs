// Servidor estático mínimo (sin dependencias) con raíz en la web completa,
// para que los carruseles reutilicen las imágenes de /assets sin copiarlas.
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const STUDIO_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const SITE_ROOT = path.resolve(STUDIO_DIR, "..");
export const CAROUSELS_DIR = path.join(STUDIO_DIR, "carousels");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".mp4": "video/mp4",
};

/** Lista los carruseles (carpetas con carousel.json, sin las que empiezan por "_"). */
export function listCarousels() {
  return fs
    .readdirSync(CAROUSELS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith("_") && fs.existsSync(path.join(CAROUSELS_DIR, d.name, "carousel.json")))
    .map((d) => d.name)
    .sort()
    .reverse();
}

export function startServer(port = 0) {
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, "http://localhost");
    if (url.pathname === "/") {
      res.writeHead(302, { Location: "/instagram-studio/engine/studio.html" });
      return res.end();
    }
    if (url.pathname === "/__carousels.json") {
      res.writeHead(200, { "Content-Type": MIME[".json"], "Cache-Control": "no-store" });
      return res.end(JSON.stringify(listCarousels()));
    }
    const file = path.join(SITE_ROOT, decodeURIComponent(url.pathname));
    if (!file.startsWith(SITE_ROOT)) {
      res.writeHead(403);
      return res.end();
    }
    fs.readFile(file, (err, data) => {
      if (err) {
        res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
        return res.end(`No encontrado: ${url.pathname}`);
      }
      res.writeHead(200, { "Content-Type": MIME[path.extname(file).toLowerCase()] ?? "application/octet-stream", "Cache-Control": "no-store" });
      res.end(data);
    });
  });
  return new Promise((resolve) => server.listen(port, "127.0.0.1", () => resolve({ server, port: server.address().port })));
}

// `node scripts/server.mjs` → abre el estudio de vista previa
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT ?? 4321);
  const { port: p } = await startServer(port);
  const slug = process.argv[2];
  console.log(`\n  Estudio de carruseles listo:\n  → http://localhost:${p}/instagram-studio/engine/studio.html${slug ? `?c=${slug}` : ""}\n\n  (Ctrl+C para cerrar)\n`);
}
