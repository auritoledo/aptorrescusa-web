// Revisa un carrusel antes de renderizar: estructura, textos, imágenes y caption.
// Uso: node scripts/validate.mjs <slug>   (sin slug revisa todos)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CAROUSELS_DIR, SITE_ROOT, listCarousels } from "./server.mjs";

const TIPOS = ["portada", "verso", "personaje", "libro", "texto", "lista", "cita", "cta"];
const REQUERIDOS = {
  portada: ["titulo"],
  verso: ["lineas"],
  personaje: ["nombre", "imagen"],
  libro: ["titulo", "portada"],
  texto: ["titulo"],
  lista: ["titulo", "items"],
  cita: ["texto"],
  cta: ["titulo"],
};
// Límites editoriales: si se superan, el texto deja de leerse bien en un móvil.
const LIMITES = { titulo: 60, subtitulo: 110, texto: 260, nombre: 22, rol: 32, kicker: 34, etiqueta: 30, boton: 40 };

const plain = (s) => String(s ?? "").replace(/\*/g, "");

// Regla de marca: solo se usa arte oficial de aptorrescusa.com, guardado en brand/oficial/
// o enlazado directamente desde la web.
const ARTE_OFICIAL = (src) => /^https:\/\/(www\.)?aptorrescusa\.com\//.test(src) || src.replace(/^\//, "").startsWith("instagram-studio/brand/oficial/");

function resolveAsset(src, slug) {
  if (/^(https?:|data:)/.test(src)) return null;
  const rel = src.replace(/^\//, "");
  if (rel.startsWith("assets/") || rel.startsWith("instagram-studio/")) return path.join(SITE_ROOT, rel);
  return path.join(CAROUSELS_DIR, slug, src.replace(/^\.\//, ""));
}

export function validate(slug) {
  const errors = [];
  const warns = [];
  const dir = path.join(CAROUSELS_DIR, slug);
  const file = path.join(dir, "carousel.json");
  let c;
  try {
    c = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (e) {
    return { errors: [`carousel.json ilegible: ${e.message}`], warns };
  }

  const slides = c.slides ?? [];
  if (slides.length < 2) errors.push("Instagram necesita al menos 2 diapositivas en un carrusel.");
  if (slides.length > 20) errors.push(`Hay ${slides.length} diapositivas; el máximo de Instagram es 20.`);
  if (slides.length > 10) warns.push("Más de 10 diapositivas: la tasa de finalización suele caer. Valora dividirlo en dos publicaciones.");
  if (slides[0] && slides[0].tipo !== "portada") warns.push("La primera diapositiva no es una portada: el gancho visual es lo que decide el deslizamiento.");
  if (slides.length && slides.at(-1).tipo !== "cta") warns.push("La última diapositiva no es un CTA: cierra siempre con una acción (guardar, comentar, firmados…).");
  const TEMAS = ["fenix", "bosque", "editorial", "fenix-acuarela", "bosque-acuarela", "papel"];
  for (const t of [c.tema, ...slides.map((s) => s.tema)]) if (t && !TEMAS.includes(t)) errors.push(`Tema desconocido "${t}" (usa ${TEMAS.join(", ")}).`);

  const images = [];
  slides.forEach((s, i) => {
    const at = `Diapositiva ${i + 1} (${s.tipo})`;
    if (!TIPOS.includes(s.tipo)) return errors.push(`${at}: tipo desconocido. Tipos válidos: ${TIPOS.join(", ")}`);
    for (const k of REQUERIDOS[s.tipo]) if (s[k] === undefined || s[k] === "" || (Array.isArray(s[k]) && !s[k].length)) errors.push(`${at}: falta "${k}".`);
    for (const [k, max] of Object.entries(LIMITES)) {
      if (typeof s[k] === "string" && plain(s[k]).length > max) warns.push(`${at}: "${k}" tiene ${plain(s[k]).length} caracteres (recomendado ≤ ${max}).`);
    }
    if (s.tipo === "verso" && s.lineas?.length > 8) warns.push(`${at}: ${s.lineas.length} versos; más de 8 pierde fuerza. Divide en dos diapositivas.`);
    if (s.tipo === "lista" && s.items?.length > 4) warns.push(`${at}: ${s.items.length} elementos; máximo recomendado 4.`);
    if (s.duracion && (s.duracion < 3 || s.duracion > 60)) errors.push(`${at}: duración ${s.duracion}s fuera del rango de Instagram (3–60 s).`);
    for (const k of ["imagen", "portada", "libro"]) if (s[k]) images.push([at, s[k]]);
    for (const b of s.libros ?? []) images.push([at, b]);
  });
  if (c.panorama) images.push(["Panorama", typeof c.panorama === "string" ? c.panorama : c.panorama.imagen]);
  if (c.marca?.logo) images.push(["Logo", c.marca.logo]);
  for (const [at, src] of images) {
    if (!ARTE_OFICIAL(src)) {
      errors.push(`${at}: "${src}" no es arte oficial. Usa solo arte de aptorrescusa.com (guárdalo en brand/oficial/ o enlaza https://aptorrescusa.com/...).`);
      continue;
    }
    const p = resolveAsset(src, slug);
    if (p && !fs.existsSync(p)) errors.push(`${at}: no existe la imagen "${src}".`);
  }

  const capFile = path.join(dir, "caption.md");
  if (!fs.existsSync(capFile)) {
    warns.push("Falta caption.md (texto de la publicación, hashtags y texto alternativo).");
  } else {
    const cap = fs.readFileSync(capFile, "utf8");
    const body = cap.split(/^## /m).find((b) => b.toLowerCase().startsWith("caption")) ?? "";
    const text = body.replace(/^caption.*\n/i, "").trim();
    if (text.length > 2200) errors.push(`El caption tiene ${text.length} caracteres; Instagram admite 2.200.`);
    const tags = cap.match(/(^|\s)#[\p{L}\p{N}_]+/gu) ?? [];
    if (tags.length > 5) errors.push(`caption.md tiene ${tags.length} hashtags; Instagram admite como máximo 5 por publicación.`);
  }
  return { errors, warns, total: slides.length };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const slugs = process.argv[2] ? [process.argv[2]] : listCarousels();
  let failed = false;
  for (const slug of slugs) {
    const { errors, warns, total } = validate(slug);
    console.log(`\n■ ${slug}${total ? ` · ${total} diapositivas` : ""}`);
    errors.forEach((e) => console.log(`  ✗ ${e}`));
    warns.forEach((w) => console.log(`  ! ${w}`));
    if (!errors.length && !warns.length) console.log("  ✓ Todo correcto");
    if (errors.length) failed = true;
  }
  process.exit(failed ? 1 : 0);
}
