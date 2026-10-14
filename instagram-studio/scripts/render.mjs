// Renderiza un carrusel a vídeos MP4 (uno por diapositiva) + PNG fijos + vista previa.
//
// Uso:
//   node scripts/render.mjs <slug>                 → calidad final (1080×1350, 30 fps)
//   node scripts/render.mjs <slug> --borrador      → rápido, para revisar (540×676, 12 fps)
//   node scripts/render.mjs <slug> --solo 1,4      → solo esas diapositivas
//   node scripts/render.mjs <slug> --fijas         → solo imágenes PNG (sin vídeo)
//
// Cómo funciona: abre cada diapositiva en Chromium, congela las animaciones CSS
// y avanza el reloj fotograma a fotograma. Cada captura se envía a ffmpeg.
// Resultado determinista: el vídeo es exactamente lo que ves en el estudio.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn, execSync } from "node:child_process";
import { createRequire } from "node:module";
import { startServer, STUDIO_DIR } from "./server.mjs";
import { validate } from "./validate.mjs";

const args = process.argv.slice(2);
const slug = args.find((a) => !a.startsWith("--") && !/^\d[\d,]*$/.test(a));
const flag = (n) => args.includes(`--${n}`);
const opt = (n) => {
  const i = args.indexOf(`--${n}`);
  return i >= 0 ? args[i + 1] : undefined;
};

if (!slug) {
  console.error("Uso: node scripts/render.mjs <slug> [--borrador] [--solo 1,3] [--fijas] [--fps 30]");
  process.exit(1);
}

const BORRADOR = flag("borrador");
const FIJAS = flag("fijas");

/* ---------- Dependencias: Playwright y ffmpeg ---------- */
async function loadPlaywright() {
  try {
    return await import("playwright");
  } catch {
    const globalRoot = execSync("npm root -g").toString().trim();
    return createRequire(path.join(globalRoot, "noop.js"))("playwright");
  }
}
async function ffmpegPath() {
  try {
    return (await import("ffmpeg-static")).default;
  } catch {
    return "ffmpeg";
  }
}

function run(bin, argv, input) {
  return new Promise((resolve, reject) => {
    const p = spawn(bin, argv, { stdio: [input ? "pipe" : "ignore", "ignore", "pipe"] });
    let err = "";
    p.stderr.on("data", (d) => (err += d));
    p.on("error", reject);
    p.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`${bin} terminó con código ${code}\n${err.slice(-1500)}`))));
    if (input) input(p.stdin);
  });
}

/* ---------- Render ---------- */
const { errors, warns } = validate(slug);
warns.forEach((w) => console.log(`  ! ${w}`));
if (errors.length) {
  errors.forEach((e) => console.log(`  ✗ ${e}`));
  console.error("\nCorrige los errores antes de renderizar (npm run validar).");
  process.exit(1);
}

const carousel = JSON.parse(fs.readFileSync(path.join(STUDIO_DIR, "carousels", slug, "carousel.json"), "utf8"));
const fps = Number(opt("fps") ?? (BORRADOR ? 12 : carousel.fps ?? 30));
const total = carousel.slides.length;
const solo = opt("solo") ? opt("solo").split(",").map((n) => Number(n) - 1) : [...Array(total).keys()];
const outDir = path.join(STUDIO_DIR, "output", slug + (BORRADOR ? "-borrador" : ""));
fs.mkdirSync(outDir, { recursive: true });

const { chromium } = await loadPlaywright();
const ffmpeg = await ffmpegPath();
const { server, port } = await startServer(0);
const browser = await chromium.launch();
const scale = BORRADOR ? 0.5 : 1;
const t0 = Date.now();

async function renderSlide(i) {
  const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: scale });
  page.on("pageerror", (e) => console.error(`  [diapositiva ${i + 1}] ${e.message}`));
  await page.goto(`http://127.0.0.1:${port}/instagram-studio/engine/studio.html?render=1&c=${encodeURIComponent(slug)}&slide=${i}`);
  await page.waitForFunction(() => window.__ready || window.__error, null, { timeout: 30000 });
  const err = await page.evaluate(() => window.__error);
  if (err) throw new Error(`Diapositiva ${i + 1}: ${err}`);
  const { dur, tipo } = await page.evaluate(() => window.__info);
  const base = path.join(outDir, `${String(i + 1).padStart(2, "0")}-${tipo}`);

  const seekTo = (ms) => page.evaluate((t) => new Promise((r) => { window.__seek(t); requestAnimationFrame(() => r()); }), ms);

  // Fotograma fijo: el instante en que todo ha entrado (para publicar como imagen estática)
  await seekTo(Math.max(0, dur - 400));
  await page.screenshot({ path: `${base}.png`, type: "png" });

  if (!FIJAS) {
    const frames = Math.round((dur / 1000) * fps);
    await run(
      ffmpeg,
      ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(fps), "-i", "-",
        "-c:v", "libx264", "-pix_fmt", "yuv420p", "-profile:v", "high", "-preset", BORRADOR ? "veryfast" : "slow",
        "-crf", BORRADOR ? "26" : "16", "-r", String(fps), "-movflags", "+faststart", `${base}.mp4`],
      async (stdin) => {
        for (let f = 0; f < frames; f++) {
          await seekTo((f * 1000) / fps);
          const buf = await page.screenshot({ type: "jpeg", quality: BORRADOR ? 80 : 95 });
          if (!stdin.write(buf)) await new Promise((r) => stdin.once("drain", r));
        }
        stdin.end();
      }
    );
  }
  await page.close();
  console.log(`  ✓ ${path.basename(base)} · ${(dur / 1000).toFixed(1)} s`);
  return base;
}

console.log(`\nRenderizando "${slug}" · ${solo.length} diapositiva(s) · ${FIJAS ? "solo PNG" : `${fps} fps`}${BORRADOR ? " · BORRADOR" : ""}`);
try {
  // Varias diapositivas en paralelo (cada una en su pestaña)
  const queue = [...solo];
  const done = [];
  const workers = Array.from({ length: Math.min(3, Math.max(1, os.cpus().length - 1), queue.length) }, async () => {
    while (queue.length) {
      const i = queue.shift();
      done[i] = await renderSlide(i);
    }
  });
  await Promise.all(workers);

  const bases = done.filter(Boolean);
  // Hoja de contactos: todas las diapositivas en una sola imagen para aprobar de un vistazo
  if (bases.length > 1) {
    const list = bases.map((b) => ["-i", `${b}.png`]).flat();
    const w = BORRADOR ? 270 : 360;
    await run(ffmpeg, ["-y", "-loglevel", "error", ...list, "-filter_complex",
      bases.map((_, k) => `[${k}:v]scale=${w}:-1[s${k}]`).join(";") + ";" + bases.map((_, k) => `[s${k}]`).join("") + `hstack=inputs=${bases.length}`,
      path.join(outDir, "_hoja-contactos.png")]);
  }
  // Vista previa: todas las diapositivas seguidas (útil para revisar o reutilizar como Reel)
  if (!FIJAS && bases.length > 1) {
    const listFile = path.join(outDir, "_lista.txt");
    fs.writeFileSync(listFile, bases.map((b) => `file '${b}.mp4'`).join("\n"));
    await run(ffmpeg, ["-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", listFile, "-c", "copy", path.join(outDir, "_vista-previa.mp4")]);
    fs.unlinkSync(listFile);
  }
  const cap = path.join(STUDIO_DIR, "carousels", slug, "caption.md");
  if (fs.existsSync(cap)) fs.copyFileSync(cap, path.join(outDir, "caption.md"));
  console.log(`\nListo en ${((Date.now() - t0) / 1000).toFixed(0)} s → ${path.relative(process.cwd(), outDir) || outDir}\n`);
} catch (e) {
  console.error(`\n✗ ${e.message}`);
  process.exitCode = 1;
} finally {
  await browser.close();
  server.close();
}
