// Crea un carrusel nuevo a partir de la plantilla.
// Uso: node scripts/nuevo.mjs <nombre> [--tema fenix-acuarela|bosque-acuarela|papel|fenix|bosque|editorial]
//   → carousels/AAAA-MM-DD-<nombre>/ con carousel.json y caption.md listos para editar.
import fs from "node:fs";
import path from "node:path";
import { CAROUSELS_DIR } from "./server.mjs";

const args = process.argv.slice(2);
const name = args.find((a) => !a.startsWith("--"));
const ti = args.indexOf("--tema");
const tema = ti >= 0 ? args[ti + 1] : "papel";

if (!name) {
  console.error("Uso: npm run nuevo -- <nombre> [--tema fenix-acuarela|bosque-acuarela|papel|fenix|bosque|editorial]");
  process.exit(1);
}
const clean = name
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-|-$/g, "");
const slug = `${new Date().toISOString().slice(0, 10)}-${clean}`;
const dest = path.join(CAROUSELS_DIR, slug);
if (fs.existsSync(dest)) {
  console.error(`Ya existe carousels/${slug}`);
  process.exit(1);
}
const tpl = path.join(CAROUSELS_DIR, "_plantilla");
fs.mkdirSync(dest, { recursive: true });
const json = JSON.parse(fs.readFileSync(path.join(tpl, "carousel.json"), "utf8"));
json.titulo = name;
json.tema = tema;
fs.writeFileSync(path.join(dest, "carousel.json"), JSON.stringify(json, null, 2) + "\n");
fs.copyFileSync(path.join(tpl, "caption.md"), path.join(dest, "caption.md"));
console.log(`\n✓ Creado carousels/${slug}\n\n  1. Edita carousel.json y caption.md\n  2. npm run estudio -- ${slug}\n  3. npm run render -- ${slug}\n`);
