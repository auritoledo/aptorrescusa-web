// Comprueba que todo está bien configurado, sin publicar nada:
//   1. el token y la cuenta de Instagram (@aptorrescusa) y la cuota de publicación;
//   2. en modo "url", que el FTP sube archivos y que se ven en MEDIA_BASE_URL.
//   npm run instagram:comprobar          (o el workflow «Instagram · comprobar conexión»)
import { config, checkConfig, createClient } from "./instagram-api.mjs";

const cfg = config();
let fallos = 0;
const ok = (m) => console.log(`✓ ${m}`);
const ko = (m) => {
  fallos++;
  console.log(`✗ ${m}`);
};

console.log(`Conexión: ${cfg.login === "facebook" ? "Facebook Login for Business" : "Instagram Login"} · API ${cfg.version} · vídeos: ${cfg.mode}${cfg.dryRun ? " · SIMULACIÓN" : ""}\n`);
try {
  checkConfig(cfg);
} catch (e) {
  ko(e.message);
  process.exit(1);
}

const ig = createClient(cfg, () => {});
try {
  const acc = await ig.account();
  if (acc.username && acc.username !== "aptorrescusa") ko(`La cuenta conectada es @${acc.username}, no @aptorrescusa.`);
  else ok(`Cuenta: @${acc.username ?? "?"} (${acc.media_count ?? "?"} publicaciones)`);
  const d = (await ig.publishingLimit()).data?.[0];
  if (d) ok(`Cuota de publicación: ${d.quota_usage} usadas de ${d.config?.quota_total ?? "?"} en 24 h`);
} catch (e) {
  ko(`Instagram: ${e.message}`);
}

if (cfg.mode === "url" && !cfg.dryRun) {
  const nombre = `comprobacion-${Date.now()}.txt`;
  const dir = `${process.env.MEDIA_FTP_DIR ?? "/"}/_comprobacion`.replace(/\/+/g, "/");
  try {
    const { Client } = await import("basic-ftp");
    const { Readable } = await import("node:stream");
    const client = new Client();
    await client.access({
      host: process.env.MEDIA_FTP_HOST,
      user: process.env.MEDIA_FTP_USER,
      password: process.env.MEDIA_FTP_PASSWORD,
      secure: (process.env.MEDIA_FTP_SECURE ?? "").trim() !== "0",
    });
    await client.ensureDir(dir);
    await client.uploadFrom(Readable.from(["aptorrescusa"]), nombre);
    ok("FTP: se puede subir al alojamiento");
    const url = `${cfg.mediaBaseUrl}/_comprobacion/${nombre}`;
    const res = await fetch(url);
    const txt = await res.text();
    if (res.ok && txt.trim() === "aptorrescusa") ok(`URL pública correcta: ${cfg.mediaBaseUrl}`);
    else ko(`El archivo subido no se ve en ${url} (HTTP ${res.status}). Revisa que MEDIA_FTP_DIR corresponda a MEDIA_BASE_URL.`);
    await client.remove(nombre).catch(() => {});
    client.close();
  } catch (e) {
    ko(`FTP: ${e.message}`);
  }
}

console.log(fallos ? `\n${fallos} problema(s). Revisa docs/10-puesta-en-marcha.md` : "\nTodo listo para publicar de forma programada.");
process.exit(fallos ? 1 : 0);
