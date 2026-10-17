// Publicador automático: publica en Instagram los carruseles APROBADOS cuya hora ha llegado.
// Lo ejecuta GitHub Actions cada 30 minutos (.github/workflows/instagram-publicar.yml).
//
//   node scripts/publicar.mjs              → publica lo que toque ahora
//   node scripts/publicar.mjs --simular    → enseña qué haría, sin tocar Instagram
//   node scripts/publicar.mjs --solo <slug>
//   node scripts/publicar.mjs --commit     → guarda cada cambio de estado en git (lo usa GitHub Actions)
//
// Garantías:
//   - Solo publica estado "programado" (aprobado por una persona) y con la fecha cumplida.
//   - Antes de llamar a Instagram marca "publicando" y lo guarda en git: si algo se corta,
//     nunca se publica dos veces; queda para revisar a mano.
//   - Si la ventana se pasa más de 12 h (servidor caído, etc.), no publica tarde: marca error.
import fs from "node:fs";
import path from "node:path";
import { spawnSync, execFileSync } from "node:child_process";
import { STUDIO_DIR, CAROUSELS_DIR, listCarousels } from "./server.mjs";
import { readState, writeState, historial, captionSection, fmtMadrid } from "./programacion.mjs";
import { config, checkConfig, createClient } from "./instagram-api.mjs";

const args = process.argv.slice(2);
const opt = (n) => {
  const i = args.indexOf(`--${n}`);
  return i >= 0 ? args[i + 1] : undefined;
};
const COMMIT = args.includes("--commit");
const SOLO = opt("solo");
const MAX_RETRASO_H = 12;
const MAX_INTENTOS = 3;
const MAX_POR_EJECUCION = 2;

const cfg = config();
const FFMPEG = await import("ffmpeg-static").then((m) => m.default).catch(() => "ffmpeg");
const ig = createClient(cfg);

function git(...a) {
  return execFileSync("git", a, { cwd: STUDIO_DIR, stdio: ["ignore", "pipe", "pipe"] }).toString().trim();
}
function save(slug, state, mensaje) {
  if (cfg.dryRun) return console.log(`  [simulación] estado → ${state.estado}`);
  writeState(slug, state);
  if (!COMMIT) return;
  git("add", path.join(CAROUSELS_DIR, slug, "publicacion.json"));
  try {
    git("commit", "-m", `instagram: ${mensaje} [skip ci]`);
    try {
      git("push");
    } catch {
      git("pull", "--rebase"); // alguien ha subido cambios mientras tanto
      git("push");
    }
  } catch (e) {
    // Si no se puede guardar el estado "publicando", no seguimos: evitar duplicados manda.
    throw new Error(`No se pudo guardar el estado en git: ${e.stderr?.toString() ?? e.message}`);
  }
}

/** Asegura los MP4/PNG renderizados del carrusel (los genera si faltan). */
function ensureRender(slug, total, formato) {
  const dir = path.join(STUDIO_DIR, "output", slug);
  const ext = formato === "imagen" ? ".png" : ".mp4";
  const list = () => (fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => /^\d\d-/.test(f) && f.endsWith(ext)).sort() : []);
  if (list().length !== total) {
    console.log(`  · Renderizando ${slug}…`);
    const r = spawnSync(process.execPath, [path.join(STUDIO_DIR, "scripts/render.mjs"), slug, ...(formato === "imagen" ? ["--fijas"] : [])], { stdio: "inherit" });
    if (r.status !== 0) throw new Error("El render ha fallado");
  }
  const files = list();
  if (files.length !== total) throw new Error(`Se esperaban ${total} archivos ${ext} y hay ${files.length}`);
  if (formato !== "imagen") return files.map((f) => path.join(dir, f));
  // Instagram solo acepta JPEG para imágenes
  return files.map((f) => {
    const png = path.join(dir, f);
    const jpg = png.replace(/\.png$/, ".jpg");
    if (!fs.existsSync(jpg)) execFileSync(FFMPEG, ["-y", "-loglevel", "error", "-i", png, "-q:v", "2", jpg]);
    return jpg;
  });
}

async function ftpClient() {
  const { Client } = await import("basic-ftp");
  const client = new Client();
  await client.access({
    host: process.env.MEDIA_FTP_HOST,
    user: process.env.MEDIA_FTP_USER,
    password: process.env.MEDIA_FTP_PASSWORD,
    secure: (process.env.MEDIA_FTP_SECURE ?? "").trim() !== "0",
  });
  return client;
}
const ftpDir = (slug) => `${process.env.MEDIA_FTP_DIR ?? "/"}/${slug}`.replace(/\/+/g, "/");

/** Tras publicar, borra los vídeos del alojamiento: Instagram ya tiene su copia. */
async function cleanupFtp(slug) {
  if (cfg.dryRun) return console.log(`  [simulación] borrar ${ftpDir(slug)} del alojamiento`);
  const client = await ftpClient();
  try {
    await client.removeDir(ftpDir(slug));
    console.log("  ✓ Vídeos temporales borrados del alojamiento");
  } finally {
    client.close();
  }
}

/** Modo "url": sube los archivos por FTP al alojamiento que sirve MEDIA_BASE_URL. */
async function uploadFtp(slug, files) {
  if (cfg.dryRun) return files.map((f) => `${cfg.mediaBaseUrl ?? "https://ejemplo"}/${slug}/${path.basename(f)}`);
  const client = await ftpClient();
  try {
    await client.ensureDir(ftpDir(slug));
    for (const f of files) await client.uploadFrom(f, path.basename(f));
  } finally {
    client.close();
  }
  return files.map((f) => `${cfg.mediaBaseUrl}/${slug}/${path.basename(f)}`);
}

function altTexts(slug) {
  const block = captionSection(slug, "Texto alternativo");
  const map = {};
  for (const m of block.matchAll(/Diapositiva (\d+)(?:\s*(?:a|y)\s*(\d+))?:\s*(.+)/g)) {
    for (let n = +m[1]; n <= +(m[2] ?? m[1]); n++) map[n] = m[3].trim();
  }
  return map;
}

async function publishOne(slug, state) {
  const carousel = JSON.parse(fs.readFileSync(path.join(CAROUSELS_DIR, slug, "carousel.json"), "utf8"));
  const total = carousel.slides.length;
  const formato = state.formato ?? "video";
  const caption = captionSection(slug, "Caption");
  if (!caption) throw new Error("caption.md sin sección «## Caption»");

  // Reintento: comprobar que no se publicó ya en un intento anterior (respuesta perdida, etc.)
  if ((state.intentos ?? 0) > 0) {
    const huella = caption.slice(0, 80);
    const ya = (await ig.recentMedia()).find((m) => m.caption?.startsWith(huella) && new Date(m.timestamp) >= new Date(state.fecha));
    if (ya) {
      save(slug, historial({ ...state, estado: "publicado", mediaId: ya.id, permalink: ya.permalink, publicadoEn: ya.timestamp, error: null }, "ya estaba publicado"), `publicado ${slug}`);
      return console.log(`  ✓ Ya estaba publicado: ${ya.permalink}`);
    }
  }

  const files = ensureRender(slug, total, formato);
  const needsUrl = formato === "imagen" || cfg.mode === "url";
  const urls = needsUrl ? await uploadFtp(slug, files) : [];
  const alts = altTexts(slug);
  const items = files.map((archivo, k) => ({ tipo: formato === "imagen" ? "imagen" : "video", archivo, url: urls[k], altText: alts[k + 1] }));

  // Punto de no retorno: queda registrado ANTES de llamar a Instagram
  save(slug, historial({ ...state, estado: "publicando", intentos: (state.intentos ?? 0) + 1 }, "publicando"), `publicando ${slug}`);

  const { mediaId, permalink } = await ig.publishCarousel({ items, caption });
  const done = historial({ ...readState(slug), estado: "publicado", mediaId, permalink, publicadoEn: new Date().toISOString(), error: null }, `publicado ${permalink}`);
  if (cfg.dryRun) Object.assign(state, done);
  save(slug, done, `publicado ${slug}`);
  console.log(`  ✓ Publicado: ${permalink}`);
  if (needsUrl) await cleanupFtp(slug).catch((e) => console.log(`  ! No se pudieron borrar los vídeos temporales: ${e.message}`));

  const primer = state.primerComentario === false ? "" : captionSection(slug, "Primer comentario");
  if (primer) {
    try {
      await ig.comment(mediaId, primer);
      console.log("  ✓ Primer comentario publicado");
    } catch (e) {
      console.log(`  ! No se pudo publicar el primer comentario: ${e.message}`);
    }
  }
}

async function main() {
  checkConfig(cfg);
  const now = Date.now();
  const due = listCarousels()
    .filter((s) => !SOLO || s === SOLO)
    .map((slug) => ({ slug, state: readState(slug) }))
    .filter(({ state }) => state?.estado === "programado" && state.fecha && new Date(state.fecha).getTime() <= now)
    .sort((a, b) => a.state.fecha.localeCompare(b.state.fecha));

  if (!due.length) return console.log(`Nada que publicar ahora (${fmtMadrid(new Date().toISOString())}).`);

  const limit = cfg.dryRun ? null : await ig.publishingLimit().catch(() => null);
  if (limit?.data?.[0]) console.log(`Cuota de publicación usada en 24 h: ${limit.data[0].quota_usage}`);

  for (const { slug, state } of due.slice(0, MAX_POR_EJECUCION)) {
    console.log(`\n■ ${slug} (previsto ${fmtMadrid(state.fecha)})`);
    const retraso = (now - new Date(state.fecha).getTime()) / 3600000;
    if (retraso > MAX_RETRASO_H) {
      save(slug, historial({ ...state, estado: "error", error: `Fuera de plazo: ${retraso.toFixed(1)} h de retraso. Propón otra fecha.` }, "fuera de plazo"), `fuera de plazo ${slug}`);
      console.log(`  ✗ Fuera de plazo (${retraso.toFixed(1)} h). No se publica tarde.`);
      continue;
    }
    try {
      await publishOne(slug, state);
    } catch (e) {
      const current = readState(slug) ?? state;
      // Los fallos llegan siempre ANTES de media_publish (después ya no se lanzan errores),
      // así que se puede reintentar sin riesgo de duplicar, hasta MAX_INTENTOS.
      const intentos = current.intentos ?? 1;
      const estado = current.estado === "publicando" && intentos < MAX_INTENTOS ? "programado" : "error";
      const nota = estado === "error" ? " Revisa el error y vuelve a proponer/aprobar." : " Se reintentará en la próxima ejecución.";
      save(slug, historial({ ...current, estado, error: e.message + nota }, `error: ${e.message}`), `error ${slug}`);
      console.error(`  ✗ ${e.message}${nota}`);
      process.exitCode = 1;
    }
  }
}

main().catch((e) => {
  console.error(`✗ ${e.message}`);
  process.exit(1);
});
