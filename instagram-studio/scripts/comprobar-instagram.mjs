// Comprueba que la conexión con Instagram está bien configurada (sin publicar nada).
//   npm run instagram:comprobar
import { config, checkConfig, createClient } from "./instagram-api.mjs";

const cfg = config();
try {
  checkConfig(cfg);
  console.log(`Conexión: ${cfg.login === "facebook" ? "Facebook Login for Business" : "Instagram Login"} · API ${cfg.version} · subida: ${cfg.mode}${cfg.dryRun ? " · SIMULACIÓN" : ""}`);
  const ig = createClient(cfg);
  const acc = await ig.account();
  console.log(`✓ Cuenta: @${acc.username ?? "?"} (${acc.media_count ?? "?"} publicaciones)`);
  if (acc.username && acc.username !== "aptorrescusa") console.log(`! Ojo: la cuenta conectada no es @aptorrescusa.`);
  const lim = await ig.publishingLimit();
  const d = lim.data?.[0];
  if (d) console.log(`✓ Cuota de publicación: ${d.quota_usage} usadas de ${d.config?.quota_total ?? "?"} en 24 h`);
  console.log("\nTodo listo para publicar de forma programada.");
} catch (e) {
  console.error(`✗ ${e.message}`);
  process.exit(1);
}
