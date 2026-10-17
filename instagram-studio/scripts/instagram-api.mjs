// Cliente mínimo de la API oficial de Instagram (publicación de contenido).
// Sin dependencias: usa fetch de Node 20+.
//
// Configuración (variables de entorno; en GitHub van como "secrets"):
//   IG_USER_ID        ID de la cuenta profesional de Instagram (@aptorrescusa)
//   IG_ACCESS_TOKEN   Token de acceso de larga duración
//   IG_LOGIN          "instagram" (Instagram Login, por defecto: sin Facebook) o "facebook" (Facebook Login for Business)
//   IG_API_VERSION    Versión de la API (por defecto v26.0)
//   IG_MEDIA_MODE     "url" (Instagram descarga los vídeos de MEDIA_BASE_URL; por defecto con Instagram Login)
//                     o "resumable" (subida directa; solo con IG_LOGIN=facebook)
//   MEDIA_BASE_URL    Solo modo "url": URL pública donde se suben los vídeos (ver subir-medios.mjs)
//   IG_DRY_RUN=1      Simula todo sin llamar a Instagram
import fs from "node:fs";

// En GitHub Actions una variable no configurada llega como "": la tratamos como ausente.
const env = (n) => (process.env[n]?.trim() ? process.env[n].trim() : undefined);

export function config() {
  const dryRun = env("IG_DRY_RUN") === "1" || process.argv.includes("--simular");
  const login = env("IG_LOGIN") ?? "instagram";
  const version = env("IG_API_VERSION") ?? "v26.0";
  const mode = env("IG_MEDIA_MODE") ?? (login === "facebook" ? "resumable" : "url");
  if (!["facebook", "instagram"].includes(login)) throw new Error(`IG_LOGIN debe ser "facebook" o "instagram" (es "${login}")`);
  if (!["resumable", "url"].includes(mode)) throw new Error(`IG_MEDIA_MODE debe ser "resumable" o "url" (es "${mode}")`);
  return {
    userId: env("IG_USER_ID") ?? (dryRun ? "<IG_USER_ID>" : undefined),
    token: env("IG_ACCESS_TOKEN"),
    login,
    version,
    mode,
    host: login === "instagram" ? "https://graph.instagram.com" : "https://graph.facebook.com",
    mediaBaseUrl: env("MEDIA_BASE_URL")?.replace(/\/$/, ""),
    dryRun,
  };
}

export function checkConfig(cfg) {
  const missing = [];
  if (!cfg.dryRun) {
    if (!cfg.userId) missing.push("IG_USER_ID");
    if (!cfg.token) missing.push("IG_ACCESS_TOKEN");
    if (cfg.mode === "url" && !cfg.mediaBaseUrl) missing.push("MEDIA_BASE_URL");
  }
  if (cfg.mode === "resumable" && cfg.login !== "facebook") {
    throw new Error('La subida directa ("resumable") solo funciona con IG_LOGIN=facebook. Usa IG_MEDIA_MODE=url.');
  }
  if (missing.length) throw new Error(`Faltan variables: ${missing.join(", ")} (ver docs/08-automatizacion.md)`);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let fakeId = 1000;

export function createClient(cfg, log = console.log) {
  const base = `${cfg.host}/${cfg.version}`;

  async function call(method, path, params = {}) {
    if (cfg.dryRun) {
      log(`  [simulación] ${method} ${path} ${JSON.stringify(params)}`);
      if (path.endsWith("/media") || path.endsWith("/media_publish")) return { id: String(++fakeId) };
      if (params.fields?.includes("status_code")) return { status_code: "FINISHED" };
      if (params.fields?.includes("permalink")) return { permalink: "https://www.instagram.com/p/SIMULACION/" };
      return { data: [] };
    }
    const url = new URL(`${base}/${path.replace(/^\//, "")}`);
    const body = new URLSearchParams({ ...params, access_token: cfg.token });
    let res;
    if (method === "GET") {
      body.forEach((v, k) => url.searchParams.set(k, v));
      res = await fetch(url);
    } else {
      res = await fetch(url, { method, body });
    }
    const json = await res.json().catch(() => ({}));
    if (!res.ok || json.error) {
      const e = json.error ?? {};
      throw new Error(`Instagram API ${res.status} en ${path}: ${e.message ?? res.statusText} (code ${e.code ?? "?"}, subcode ${e.error_subcode ?? "?"})`);
    }
    return json;
  }

  /** Sube los bytes de un vídeo a un contenedor creado con upload_type=resumable. */
  async function uploadResumable(uploadUri, containerId, file) {
    const size = fs.statSync(file).size;
    if (cfg.dryRun) return log(`  [simulación] subida directa de ${file} (${(size / 1e6).toFixed(1)} MB)`);
    const url = uploadUri ?? `https://rupload.facebook.com/ig-api-upload/${cfg.version}/${containerId}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { Authorization: `OAuth ${cfg.token}`, offset: "0", file_size: String(size) },
      body: fs.readFileSync(file),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || json.success === false) throw new Error(`Subida de ${file} fallida: ${res.status} ${JSON.stringify(json)}`);
  }

  /** Espera a que Instagram termine de procesar un contenedor (vídeos: hasta ~5 min). */
  async function waitFinished(id, { intervalo = 15000, maxIntentos = 40 } = {}) {
    for (let k = 0; k < maxIntentos; k++) {
      const { status_code, status } = await call("GET", id, { fields: "status_code,status" });
      if (status_code === "FINISHED") return;
      if (status_code === "ERROR" || status_code === "EXPIRED") throw new Error(`Contenedor ${id}: ${status_code} ${status ?? ""}`);
      await sleep(cfg.dryRun ? 0 : intervalo);
    }
    throw new Error(`Contenedor ${id}: Instagram no terminó de procesarlo a tiempo`);
  }

  /**
   * Publica un carrusel.
   * items: [{ tipo: "video"|"imagen", archivo, url? , altText? }]  (2–10)
   */
  async function publishCarousel({ items, caption }) {
    if (items.length < 2 || items.length > 10) throw new Error(`La API admite carruseles de 2 a 10 elementos (hay ${items.length}).`);
    const children = [];
    for (const [k, it] of items.entries()) {
      log(`  · Elemento ${k + 1}/${items.length}: ${it.archivo}`);
      const params = { is_carousel_item: "true" };
      if (it.tipo === "video") {
        params.media_type = "VIDEO";
        if (cfg.mode === "resumable") params.upload_type = "resumable";
        else params.video_url = it.url;
      } else {
        params.image_url = it.url; // las imágenes siempre por URL pública (JPEG)
        if (it.altText) params.alt_text = it.altText.slice(0, 1000);
      }
      const created = await call("POST", `${cfg.userId}/media`, params);
      if (it.tipo === "video" && cfg.mode === "resumable") await uploadResumable(created.uri, created.id, it.archivo);
      children.push(created.id);
    }
    for (const id of children) await waitFinished(id);
    log("  · Creando el carrusel…");
    const parent = await call("POST", `${cfg.userId}/media`, { media_type: "CAROUSEL", children: children.join(","), caption });
    await waitFinished(parent.id, { intervalo: 5000 });
    log("  · Publicando…");
    const published = await call("POST", `${cfg.userId}/media_publish`, { creation_id: parent.id });
    // A partir de aquí ya está publicado: cualquier fallo posterior no debe provocar un reintento
    try {
      const { permalink } = await call("GET", published.id, { fields: "permalink" });
      return { mediaId: published.id, permalink };
    } catch {
      return { mediaId: published.id, permalink: null };
    }
  }

  async function comment(mediaId, message) {
    return call("POST", `${mediaId}/comments`, { message });
  }

  async function recentMedia(limit = 10) {
    const { data } = await call("GET", `${cfg.userId}/media`, { fields: "id,caption,permalink,timestamp", limit: String(limit) });
    return data ?? [];
  }

  async function publishingLimit() {
    return call("GET", `${cfg.userId}/content_publishing_limit`, { fields: "config,quota_usage" });
  }

  async function account() {
    return call("GET", cfg.userId ?? "me", { fields: "username,media_count" });
  }

  /** Métricas de una publicación. Se piden una a una: Meta cambia la lista de métricas con frecuencia. */
  async function insights(mediaId, metrics = ["reach", "saved", "shares", "likes", "comments", "total_interactions", "views"]) {
    const out = {};
    for (const m of metrics) {
      try {
        const { data } = await call("GET", `${mediaId}/insights`, { metric: m });
        if (data?.[0]) out[m] = data[0].values?.[0]?.value ?? data[0].total_value?.value ?? null;
      } catch (e) {
        out[m] = null; // métrica no disponible para este tipo de publicación
      }
    }
    return out;
  }

  return { call, publishCarousel, comment, publishingLimit, recentMedia, account, insights };
}
