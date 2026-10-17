// Calendario de publicaciones: estado de cada carrusel en carousels/<slug>/publicacion.json
//
//   npm run calendario                                  → ver todo lo planificado
//   npm run proponer -- <slug> "2026-10-20 19:30"       → fecha propuesta (hora de España), queda PENDIENTE
//   npm run aprobar  -- <slug> --por "Ángel"            → APROBADO: se publicará solo a su hora
//   npm run cancelar -- <slug>                          → vuelve a PENDIENTE (no se publica)
//
// Estados: pendiente → programado → publicando → publicado   (o error)
// Solo una persona aprueba. Los agentes proponen, nunca aprueban.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CAROUSELS_DIR, listCarousels } from "./server.mjs";
import { validate } from "./validate.mjs";

export const ZONA = "Europe/Madrid";
const file = (slug) => path.join(CAROUSELS_DIR, slug, "publicacion.json");

export function readState(slug) {
  try {
    return JSON.parse(fs.readFileSync(file(slug), "utf8"));
  } catch {
    return null;
  }
}

export function writeState(slug, state) {
  fs.writeFileSync(file(slug), JSON.stringify(state, null, 2) + "\n");
}

export function historial(state, texto) {
  state.historial = [...(state.historial ?? []), `${new Date().toISOString()} · ${texto}`];
  return state;
}

/** "2026-10-20 19:30" en hora de España → ISO UTC (tiene en cuenta el horario de verano). */
export function madridToISO(local) {
  const m = String(local).trim().match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{1,2}):(\d{2})$/);
  if (!m) throw new Error(`Fecha no válida "${local}". Formato: AAAA-MM-DD HH:MM (hora de España)`);
  const [, y, mo, d, h, mi] = m.map(Number);
  let guess = Date.UTC(y, mo - 1, d, h, mi);
  for (let k = 0; k < 2; k++) {
    const parts = Object.fromEntries(
      new Intl.DateTimeFormat("en-GB", { timeZone: ZONA, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })
        .formatToParts(new Date(guess))
        .map((p) => [p.type, p.value])
    );
    const shown = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute);
    guess += Date.UTC(y, mo - 1, d, h, mi) - shown;
  }
  return new Date(guess).toISOString();
}

export const fmtMadrid = (iso) =>
  iso ? new Intl.DateTimeFormat("es-ES", { timeZone: ZONA, dateStyle: "medium", timeStyle: "short" }).format(new Date(iso)) : "—";

/** Extrae una sección "## Título" de caption.md. */
export function captionSection(slug, titulo) {
  const p = path.join(CAROUSELS_DIR, slug, "caption.md");
  if (!fs.existsSync(p)) return "";
  const md = fs.readFileSync(p, "utf8");
  const block = md.split(/^## /m).find((b) => b.toLowerCase().startsWith(titulo.toLowerCase()));
  if (!block) return "";
  const text = block.split("\n").slice(1).join("\n").trim();
  return /^\(.*\)$/s.test(text) ? "" : text; // ignora los textos de ayuda entre paréntesis de la plantilla
}

function propose(slug, local) {
  if (!fs.existsSync(path.join(CAROUSELS_DIR, slug, "carousel.json"))) throw new Error(`No existe carousels/${slug}`);
  const fecha = madridToISO(local);
  const state = readState(slug) ?? {};
  if (["publicando", "publicado"].includes(state.estado)) throw new Error(`"${slug}" ya está ${state.estado}.`);
  const otros = listCarousels().filter((s) => s !== slug).map((s) => [s, readState(s)]).filter(([, st]) => st?.fecha && ["pendiente", "programado"].includes(st.estado));
  for (const [s, st] of otros) {
    if (Math.abs(new Date(st.fecha) - new Date(fecha)) < 20 * 3600 * 1000) console.log(`  ! Aviso: "${s}" está a menos de 20 h (${fmtMadrid(st.fecha)}).`);
  }
  writeState(slug, historial({ ...state, estado: "pendiente", fecha, aprobadoPor: null, aprobadoEn: null }, `propuesto para ${local} (${ZONA})`));
  console.log(`✓ ${slug}: propuesto para ${fmtMadrid(fecha)}. Falta la aprobación de una persona (npm run aprobar -- ${slug}).`);
}

function approve(slug, por) {
  const state = readState(slug);
  if (!state?.fecha) throw new Error(`"${slug}" no tiene fecha. Primero: npm run proponer -- ${slug} "AAAA-MM-DD HH:MM"`);
  if (state.estado !== "pendiente") throw new Error(`"${slug}" está ${state.estado}; solo se aprueba lo pendiente.`);
  if (new Date(state.fecha) < new Date()) throw new Error(`La fecha (${fmtMadrid(state.fecha)}) ya ha pasado. Propón otra.`);
  const { errors, total } = validate(slug);
  if (errors.length) throw new Error(`No se puede aprobar: ${errors.join(" | ")}`);
  if (total > 10) throw new Error(`La API de Instagram publica como máximo 10 diapositivas (hay ${total}).`);
  if (!captionSection(slug, "Caption")) throw new Error("caption.md no tiene sección «## Caption».");
  writeState(slug, historial({ ...state, estado: "programado", aprobadoPor: por, aprobadoEn: new Date().toISOString(), intentos: 0, error: null }, `aprobado por ${por}`));
  console.log(`✓ ${slug}: APROBADO por ${por}. Se publicará el ${fmtMadrid(state.fecha)}.`);
}

function cancel(slug) {
  const state = readState(slug);
  if (!state) throw new Error(`"${slug}" no tiene programación.`);
  if (["publicando", "publicado"].includes(state.estado)) throw new Error(`"${slug}" ya está ${state.estado}.`);
  writeState(slug, historial({ ...state, estado: "pendiente", aprobadoPor: null, aprobadoEn: null }, "cancelado (vuelve a pendiente)"));
  console.log(`✓ ${slug}: cancelado. No se publicará hasta que se apruebe de nuevo.`);
}

function calendar() {
  const rows = listCarousels()
    .map((s) => ({ s, st: readState(s) }))
    .sort((a, b) => String(a.st?.fecha ?? "9").localeCompare(String(b.st?.fecha ?? "9")));
  console.log(`\nCalendario de Instagram (@aptorrescusa) · hora de España\n`);
  for (const { s, st } of rows) {
    const estado = (st?.estado ?? "sin fecha").toUpperCase().padEnd(10);
    const extra = st?.estado === "publicado" ? ` → ${st.permalink}` : st?.estado === "error" ? ` → ${st.error}` : st?.aprobadoPor ? ` (aprobado por ${st.aprobadoPor})` : "";
    console.log(`  ${estado} ${fmtMadrid(st?.fecha).padEnd(24)} ${s}${extra}`);
  }
  console.log("");
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [cmd, slug, ...rest] = process.argv.slice(2);
  if (slug && !/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
    console.error(`✗ Nombre de carrusel no válido: "${slug}"`);
    process.exit(1);
  }
  const opt = (n) => {
    const i = rest.indexOf(`--${n}`);
    return i >= 0 ? rest[i + 1] : undefined;
  };
  try {
    if (cmd === "calendario" || !cmd) calendar();
    else if (cmd === "proponer") propose(slug, rest.filter((a) => !a.startsWith("--")).join(" "));
    else if (cmd === "aprobar") approve(slug, opt("por") ?? process.env.USER ?? "persona");
    else if (cmd === "cancelar") cancel(slug);
    else if (cmd === "toca") {
      // Para GitHub Actions: ¿hay algo aprobado cuya hora ha llegado? (evita instalar nada si no)
      const toca = listCarousels().some((s) => {
        const st = readState(s);
        return st?.estado === "programado" && st.fecha && new Date(st.fecha) <= new Date();
      });
      console.log(toca ? "Hay publicaciones pendientes." : "Nada que publicar ahora.");
      if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `toca=${toca}\n`);
    }
    else throw new Error(`Comando desconocido "${cmd}". Usa: calendario | proponer | aprobar | cancelar | toca`);
  } catch (e) {
    console.error(`✗ ${e.message}`);
    process.exit(1);
  }
}
