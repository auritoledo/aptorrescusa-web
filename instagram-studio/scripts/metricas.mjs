// Recoge las métricas de los carruseles publicados (a las 24 h, 72 h y 7 días)
// y las guarda en carousels/<slug>/metricas.json. Lo ejecuta GitHub Actions una vez al día.
//   node scripts/metricas.mjs [--simular] [--commit]
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { STUDIO_DIR, CAROUSELS_DIR, listCarousels } from "./server.mjs";
import { readState } from "./programacion.mjs";
import { config, checkConfig, createClient } from "./instagram-api.mjs";

const cfg = config();
const ig = createClient(cfg);
const HITOS = [{ clave: "24h", horas: 24 }, { clave: "72h", horas: 72 }, { clave: "7d", horas: 168 }];

checkConfig(cfg);
const changed = [];
for (const slug of listCarousels()) {
  const st = readState(slug);
  if (st?.estado !== "publicado" || !st.mediaId) continue;
  const file = path.join(CAROUSELS_DIR, slug, "metricas.json");
  const data = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : { mediaId: st.mediaId, permalink: st.permalink };
  const horas = (Date.now() - new Date(st.publicadoEn).getTime()) / 3600000;
  // Solo el último hito alcanzado: si el robot estuvo parado, no se copian las mismas cifras en varios hitos
  const hito = [...HITOS].reverse().find((h) => horas >= h.horas);
  if (hito && !data[hito.clave]) {
    data[hito.clave] = { fecha: new Date().toISOString(), ...(await ig.insights(st.mediaId)) };
    console.log(`✓ ${slug} · ${hito.clave}: ${JSON.stringify(data[hito.clave])}`);
    changed.push(file);
  }
  if (changed.includes(file) && !cfg.dryRun) fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
}
if (!changed.length) console.log("No hay métricas nuevas que recoger.");
else if (process.argv.includes("--commit") && !cfg.dryRun) {
  execFileSync("git", ["add", ...changed], { cwd: STUDIO_DIR });
  execFileSync("git", ["commit", "-m", "instagram: métricas actualizadas [skip ci]"], { cwd: STUDIO_DIR });
  execFileSync("git", ["push"], { cwd: STUDIO_DIR });
}
