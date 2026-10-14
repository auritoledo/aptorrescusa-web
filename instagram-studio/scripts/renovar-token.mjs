// Renueva el token de Instagram Login (caduca a los 60 días si no se renueva).
// Con Facebook Login y token de usuario del sistema no hace falta: ese token no caduca.
//   node scripts/renovar-token.mjs [--salida <archivo>]
// GitHub Actions lo ejecuta dos veces al mes y guarda el token nuevo como secreto
// (.github/workflows/instagram-renovar-token.yml).
import fs from "node:fs";
import { config } from "./instagram-api.mjs";

const cfg = config();
const i = process.argv.indexOf("--salida");
const salida = i >= 0 ? process.argv[i + 1] : null;

if (cfg.login !== "instagram") {
  console.log("IG_LOGIN no es «instagram»: con Facebook Login y usuario del sistema el token no caduca. Nada que hacer.");
  process.exit(0);
}
if (!cfg.token) {
  console.error("✗ Falta IG_ACCESS_TOKEN");
  process.exit(1);
}
const url = new URL("https://graph.instagram.com/refresh_access_token");
url.searchParams.set("grant_type", "ig_refresh_token");
url.searchParams.set("access_token", cfg.token);
const res = await fetch(url);
const json = await res.json().catch(() => ({}));
if (!res.ok || !json.access_token) {
  console.error(`✗ No se pudo renovar: ${json.error?.message ?? res.statusText}. Si ha caducado, hay que volver a autorizar la app.`);
  process.exit(1);
}
const dias = Math.round((json.expires_in ?? 0) / 86400);
if (salida) fs.writeFileSync(salida, json.access_token, { mode: 0o600 });
console.log(`✓ Token renovado: válido ${dias} días más.${salida ? "" : " (usa --salida para guardarlo)"}`);
