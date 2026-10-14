/* ==========================================================================
   Motor de carruseles animados · A.P. Torrescusa
   Convierte un carousel.json en diapositivas HTML animadas (1080 × 1350).
   Lo usan tanto la vista previa (studio.html) como el renderizador (render.mjs).
   ========================================================================== */

export const TIPOS = ["portada", "verso", "personaje", "libro", "texto", "lista", "cita", "cta"];

export const MARCA_POR_DEFECTO = {
  nombre: "A.P. Torrescusa",
  usuario: "@angel19643",
  web: "aptorrescusa.com",
  logo: "assets/images/logo.png",
};

const DURACION_BASE = 6000; // ms por diapositiva si el contenido no pide más
const RESPIRO = 2600;       // ms de "lectura" tras la última animación de entrada

/* ---------- Utilidades ---------- */

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/** Texto con formato mínimo: *cursiva acento*, **negrita** y saltos de línea. */
export function inline(s) {
  return esc(s)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/\n/g, "<br>");
}

/** Resuelve rutas de imagen: "assets/..." sale de la web, el resto de la carpeta del carrusel. */
export function resolveAsset(src, slug) {
  if (!src) return "";
  if (/^(https?:|data:)/.test(src)) return src;
  if (src.startsWith("/")) return src;
  if (src.startsWith("assets/") || src.startsWith("instagram-studio/")) return "/" + src;
  return `/instagram-studio/carousels/${slug}/${src.replace(/^\.\//, "")}`;
}

/** Divide un texto en palabras enmascaradas con retardo escalonado. */
function words(text, t0, step = 80) {
  let t = t0;
  let em = false;
  const html = String(text ?? "")
    .split("\n")
    .map((line) =>
      line
        .split(/\s+/)
        .filter(Boolean)
        .map((tok) => {
          const m = tok.match(/^(\*?)(.*?)(\*?)([.,;:!?…»”")]*)$/);
          const [, open, word, close, punct] = m;
          if (open) em = true;
          const inner = em ? `<em>${esc(word)}</em>${esc(punct)}` : esc(word + punct);
          if (close) em = false;
          const out = `<span class="w"><span class="wi" style="--d:${t}ms">${inner}</span></span>`;
          t += step;
          return out;
        })
        .join(" ")
    )
    .join("<br>");
  return { html, end: t + 1100 };
}

/** Tamaño de letra según la línea más larga (tabla [maxCaracteres, px]). */
function fit(text, table) {
  const longest = Math.max(...String(text ?? "").replace(/\*/g, "").split("\n").map((l) => l.length));
  for (const [max, px] of table) if (longest <= max) return px;
  return table[table.length - 1][1];
}

/** Generador pseudoaleatorio con semilla: mismas partículas en vista previa y en vídeo. */
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function particles(tema, seed, cantidad) {
  const defecto = { fenix: 34, bosque: 22, editorial: 14, "fenix-acuarela": 26, "bosque-acuarela": 18, papel: 10 }[tema] ?? 14;
  const n = cantidad === false ? 0 : typeof cantidad === "number" ? cantidad : defecto;
  if (!n) return "";
  const r = rng(seed * 7919 + 13);
  let html = "";
  for (let k = 0; k < n; k++) {
    const pd = 7 + r() * 8;
    const size = tema === "fenix" ? 3 + r() * 7 : tema === "bosque" ? 4 + r() * 7 : tema.endsWith("acuarela") ? 5 + r() * 9 : tema === "papel" ? 3 + r() * 4 : 2 + r() * 3;
    html += `<i class="p" style="--x:${(r() * 100).toFixed(2)}%;--s:${size.toFixed(1)}px;--pd:${pd.toFixed(2)}s;--pdl:${(-r() * pd).toFixed(2)}s;--dx:${((r() - 0.5) * 240).toFixed(0)}px"></i>`;
  }
  return `<div class="layer particles">${html}</div>`;
}

const img = (src, slug, cls = "", extra = "") => `<img class="${cls}" src="${esc(resolveAsset(src, slug))}" alt="" ${extra}>`;
const kicker = (text, d, center = false) => (text ? `<div class="kicker ${center ? "center" : ""} fade-up" style="--d:${d}ms">${inline(text)}</div>` : "");

/* ---------- Constructores por tipo ---------- */

const BUILDERS = {
  portada(s, ctx) {
    const fs = fit(s.titulo, [[8, 170], [11, 150], [14, 128], [18, 108], [22, 92], [999, 78]]);
    const title = words(s.titulo, 650, 95);
    const subD = title.end - 500;
    return {
      clase: s.libro ? "con-libro" : "",
      bg: s.imagen ? `<div class="layer bg-img">${img(s.imagen, ctx.slug)}</div><div class="layer shade"></div>` : "",
      html: `
        ${s.libro ? `<div class="stage3d"><div class="book">${img(s.libro, ctx.slug)}</div></div>` : ""}
        <div class="content">
          ${kicker(s.kicker, 300)}
          <h1 class="title" style="--fs:${s.tamano ?? fs}px">${title.html}</h1>
          ${s.subtitulo ? `<p class="sub fade-up" style="--d:${subD}ms">${inline(s.subtitulo)}</p>` : ""}
        </div>
        <div class="swipe fade" style="--d:${subD + 300}ms">${esc(s.deslizar ?? "Desliza")}
          <svg viewBox="0 0 64 24"><path d="M0 12h60M50 2l10 10-10 10" fill="none" stroke-width="2.5"/></svg>
        </div>`,
      end: subD + 1400,
      sinContador: true,
    };
  },

  verso(s, ctx) {
    const lineas = s.lineas ?? [];
    const longest = Math.max(...lineas.map((l) => l.replace(/\*/g, "").length), 1);
    let fs = longest <= 22 ? 66 : longest <= 30 ? 58 : longest <= 38 ? 50 : 44;
    if (lineas.length > 6) fs -= 6;
    let t = 700;
    const lines = lineas
      .map((l) => {
        const out = `<div class="line" style="--d:${t}ms">${inline(l)}</div>`;
        t += 650;
        return out;
      })
      .join("");
    return {
      bg: s.imagen ? `<div class="layer bg-img dim">${img(s.imagen, ctx.slug)}</div>` : "",
      html: `
        ${s.marca ? `<div class="marca">${esc(s.marca)}</div>` : ""}
        <div class="content">
          ${kicker(s.etiqueta, 250, true)}
          <div class="lines" style="--fs:${s.tamano ?? fs}px">${lines}</div>
          ${s.firma ? `<div class="script fade-up" style="--d:${t + 200}ms">${inline(s.firma)}</div>` : ""}
        </div>`,
      end: t + 1600,
    };
  },

  personaje(s, ctx) {
    const completo = s.estilo === "completo";
    const fs = fit(s.nombre, [[8, 104], [12, 92], [16, 80], [999, 68]]);
    const name = words(s.nombre, 1100, 110);
    const textoD = name.end - 400;
    const content = `
      <div class="content">
        ${kicker(s.rol, 900, !completo)}
        <h2 class="title" style="--fs:${s.tamano ?? fs}px">${name.html}</h2>
        ${s.texto ? `<p class="body fade-up" style="--d:${textoD}ms">${inline(s.texto)}</p>` : ""}
      </div>`;
    if (completo) {
      return {
        bg: `<div class="layer bg-img">${img(s.imagen, ctx.slug)}</div><div class="layer shade"></div>`,
        html: content,
        end: textoD + 1200,
        clase: "completo",
      };
    }
    return {
      html: `
        <div class="arch mask-up" style="--d:200ms">${img(s.imagen, ctx.slug)}</div>
        <svg class="arch-line" viewBox="0 0 668 768"><path d="M1 767V334A333 333 0 0 1 667 334V767Z"/></svg>
        ${s.numero ? `<div class="num fade" style="--d:1400ms">${esc(s.numero)}</div>` : ""}
        ${content}`,
      end: textoD + 1200,
    };
  },

  libro(s, ctx) {
    const fs = fit(s.titulo, [[14, 80], [20, 70], [28, 60], [999, 52]]);
    const title = words(s.titulo, 1100, 90);
    let t = title.end - 400;
    const textoD = t;
    if (s.texto) t += 300;
    const pills = (s.datos ?? [])
      .map((d) => {
        t += 180;
        return `<span class="pill fade-up" style="--d:${t}ms">${inline(d)}</span>`;
      })
      .join("");
    if (s.precio) t += 220;
    return {
      html: `
        <div class="stage3d"><div class="book">${img(s.portada, ctx.slug)}</div></div>
        <div class="content">
          ${kicker(s.kicker, 900, true)}
          <h2 class="title" style="--fs:${s.tamano ?? fs}px">${title.html}</h2>
          ${s.texto ? `<p class="body fade-up" style="--d:${textoD}ms;font-size:30px;max-width:820px">${inline(s.texto)}</p>` : ""}
          <div class="facts">${pills}${s.precio ? `<span class="pill accent fade-up" style="--d:${t}ms">${inline(s.precio)}</span>` : ""}</div>
        </div>`,
      end: t + 1200,
    };
  },

  texto(s, ctx) {
    const fs = fit(s.titulo, [[12, 104], [18, 88], [24, 76], [999, 66]]);
    const base = s.imagen ? 900 : 500;
    const title = words(s.titulo, base + 200, 85);
    let t = title.end - 450;
    const paras = String(s.texto ?? "")
      .split(/\n\s*\n/)
      .filter(Boolean)
      .map((p) => {
        const out = `<p class="body fade-up" style="--d:${t}ms">${inline(p.trim())}</p>`;
        t += 350;
        return out;
      })
      .join("");
    return {
      html: `
        ${s.imagen ? `<div class="band mask-up" style="--d:150ms;--enfoque:${esc(s.enfoque ?? "50% 40%")}">${img(s.imagen, ctx.slug)}</div>` : ""}
        <div class="content">
          ${kicker(s.kicker, base)}
          ${s.titulo ? `<h2 class="title" style="--fs:${s.tamano ?? fs}px">${title.html}</h2>` : ""}
          ${paras}
        </div>`,
      end: t + 1100,
      clase: s.imagen ? "con-imagen" : "",
    };
  },

  lista(s) {
    const fs = fit(s.titulo, [[12, 92], [18, 80], [24, 70], [999, 60]]);
    const title = words(s.titulo, 500, 85);
    let t = title.end - 400;
    const items = (s.items ?? [])
      .map((it, k) => {
        const out = `
          <div class="item" style="--d:${t}ms">
            <span class="n fade" style="--d:${t + 150}ms">${String(k + 1).padStart(2, "0")}</span>
            <span class="it fade-up" style="--d:${t + 200}ms">${inline(it.titulo)}</span>
            ${it.texto ? `<span class="ix fade-up" style="--d:${t + 380}ms">${inline(it.texto)}</span>` : ""}
          </div>`;
        t += 420;
        return out;
      })
      .join("");
    return {
      html: `
        <div class="content">
          ${kicker(s.kicker, 300)}
          <h2 class="title" style="--fs:${s.tamano ?? fs}px">${title.html}</h2>
          <div class="items">${items}</div>
        </div>`,
      end: t + 1300,
    };
  },

  cita(s, ctx) {
    const len = String(s.texto ?? "").replace(/\*/g, "").length;
    const fs = len <= 60 ? 86 : len <= 100 ? 74 : len <= 150 ? 62 : 54;
    const q = words(s.texto, 700, 70);
    return {
      bg: s.imagen ? `<div class="layer bg-img dim">${img(s.imagen, ctx.slug)}</div>` : "",
      html: `
        <div class="content">
          <div class="qmark fade" style="--d:200ms">“</div>
          <blockquote class="title" style="--fs:${s.tamano ?? fs}px;margin:0">${q.html}</blockquote>
          ${s.autor ? `<div class="script fade-up" style="--d:${q.end - 200}ms">${inline(s.autor)}</div>` : ""}
        </div>`,
      end: q.end + 1200,
    };
  },

  cta(s, ctx) {
    const fs = fit(s.titulo, [[12, 96], [18, 82], [24, 70], [999, 60]]);
    const title = words(s.titulo, 800, 90);
    let t = title.end - 400;
    const textoD = t;
    if (s.texto) t += 300;
    const books = (s.libros ?? [])
      .map((b) => {
        t += 200;
        return `<span class="fade-up" style="--d:${t}ms">${img(b, ctx.slug)}</span>`;
      })
      .join("");
    const botonD = t + 300;
    return {
      html: `
        <div class="content">
          ${s.logo === false ? "" : `<img class="logo fade" style="--d:150ms" src="${esc(resolveAsset(ctx.marca.logo, ctx.slug))}" alt="">`}
          ${kicker(s.kicker, 500, true)}
          <h2 class="title" style="--fs:${s.tamano ?? fs}px">${title.html}</h2>
          ${s.texto ? `<p class="body fade-up" style="--d:${textoD}ms;max-width:840px">${inline(s.texto)}</p>` : ""}
          ${books ? `<div class="books">${books}</div>` : ""}
          ${s.boton ? `<span class="pill accent" style="--d:${botonD}ms">${inline(s.boton)}</span>` : ""}
          <div class="url fade" style="--d:${botonD + 400}ms">${esc(s.url ?? `${ctx.marca.web} · enlace en la bio`)}</div>
        </div>`,
      end: botonD + 1600,
    };
  },
};

/* ---------- Ensamblado ---------- */

/**
 * Construye la diapositiva `i` del carrusel.
 * Devuelve { el, dur } — dur en milisegundos.
 */
export function buildSlide(c, i) {
  const s = c.slides[i];
  const n = c.slides.length;
  const tema = s.tema ?? c.tema ?? "editorial";
  const marca = { ...MARCA_POR_DEFECTO, ...(c.marca ?? {}) };
  const ctx = { slug: c.slug, marca, i, n };
  const builder = BUILDERS[s.tipo];
  if (!builder) throw new Error(`Diapositiva ${i + 1}: tipo desconocido "${s.tipo}". Usa: ${TIPOS.join(", ")}`);
  const part = builder(s, ctx);

  const autoDur = Math.max(DURACION_BASE, (c.duracion ?? 0) * 1000, Math.ceil((part.end + RESPIRO) / 500) * 500);
  const dur = s.duracion ? s.duracion * 1000 : autoDur;

  const pano = c.panorama ? (typeof c.panorama === "string" ? { imagen: c.panorama } : c.panorama) : null;
  const panoHtml = pano
    ? `<div class="layer panorama" style="--n:${n};--px:${n > 1 ? (i / (n - 1)) * 100 : 50}%;--pano-op:${pano.opacidad ?? 0.45};background-image:url('${esc(resolveAsset(pano.imagen, c.slug))}')"></div>`
    : "";
  const hilo = (s.hilo ?? c.hilo ?? true) ? `<div class="hilo" style="--nodo:${(12 + (n > 1 ? i / (n - 1) : 0.5) * 76).toFixed(1)}%"><i></i></div>` : "";
  const counter = part.sinContador ? "" : `<span class="count"><b>${String(i + 1).padStart(2, "0")}</b> / ${String(n).padStart(2, "0")}</span>`;

  const el = document.createElement("section");
  el.className = `slide t-${s.tipo} ${part.clase ?? ""}`;
  el.dataset.tema = tema;
  el.style.setProperty("--dur", `${dur}ms`);
  if (s.enfoque) el.style.setProperty("--enfoque", s.enfoque);
  el.innerHTML = `
    <div class="layer bg-base"></div>
    ${panoHtml}
    ${part.bg ?? ""}
    <div class="layer glow"></div>
    ${particles(tema, i + 1, s.particulas ?? c.particulas)}
    <div class="layer vignette"></div>
    ${part.html}
    <header class="chrome-top fade" style="--d:100ms"><span class="brand">${esc(marca.nombre)}</span>${counter}</header>
    ${hilo}
    ${s.tipo === "portada" ? "" : `<div class="handle fade" style="--d:400ms">${esc(marca.usuario)}</div>`}
    <div class="layer grain" style="z-index:9"></div>`;
  return { el, dur };
}

export async function loadCarousel(slug) {
  const res = await fetch(`/instagram-studio/carousels/${encodeURIComponent(slug)}/carousel.json`, { cache: "no-store" });
  if (!res.ok) throw new Error(`No encuentro carousels/${slug}/carousel.json (${res.status})`);
  const c = await res.json();
  c.slug = slug;
  return c;
}

/** Espera a que tipografías e imágenes estén listas (imprescindible antes de renderizar). */
export async function whenReady(root) {
  const faces = ['600 80px "Playfair Display"', 'italic 400 80px "Playfair Display"', 'italic 500 80px "Playfair Display"', '400 30px "Inter"', '600 30px "Inter"', '76px "Great Vibes"'];
  await Promise.all(faces.map((f) => document.fonts.load(f, "AaÁáÉéÍíÓóÚúÑñ¿¡€“”").catch(() => {})));
  await document.fonts.ready;
  const imgs = [...root.querySelectorAll("img")];
  await Promise.all(imgs.map((im) => (im.complete && im.naturalWidth ? Promise.resolve() : im.decode().catch(() => console.warn("Imagen no cargada:", im.src)))));
  // Las imágenes de fondo CSS (panorama) también deben estar decodificadas
  const bgs = [...root.querySelectorAll(".panorama")].map((p) => getComputedStyle(p).backgroundImage.match(/url\("?(.*?)"?\)/)?.[1]).filter(Boolean);
  await Promise.all(bgs.map((u) => new Promise((r) => { const im = new Image(); im.onload = im.onerror = r; im.src = u; })));
}

/** Congela todas las animaciones en el instante `ms` (lo usa el renderizador fotograma a fotograma). */
export function seek(ms, root = document) {
  const list = root === document ? document.getAnimations() : root.getAnimations({ subtree: true });
  for (const a of list) {
    a.pause();
    a.currentTime = ms;
  }
}

/** Reinicia las animaciones de una diapositiva (vista previa). */
export function replay(el) {
  for (const a of el.getAnimations({ subtree: true })) {
    a.cancel();
    a.play();
  }
}
