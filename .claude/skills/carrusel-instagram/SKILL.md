---
name: carrusel-instagram
description: Crea carruseles animados para el Instagram de A.P. Torrescusa (Ángel, @angel19643) con el sistema de instagram-studio/. Úsala siempre que se pida un carrusel, post, publicación de Instagram, contenido para redes, diapositivas animadas, o una pieza sobre El amor del Fénix, Los Portadores del Ojo Verde, Monte Redondo, los Sylvánimas, los libros firmados o el autor. También para renderizar, revisar o modificar un carrusel existente.
---

# Carrusel animado para Instagram · A.P. Torrescusa

Sistema en `instagram-studio/`. Antes de empezar, lee `instagram-studio/docs/06-referencia-json.md`
(campos y tipos) y, si el encargo es de contenido nuevo, `docs/02-guion.md`.

## Flujo (no saltarse pasos)

1. **Brief.** Aclara (o deduce del pedido) pilar y objetivo: Fuego (poesía, tema `fenix-acuarela`),
   Bosque (universo, tema `bosque-acuarela`), Tinta (autor, tema `papel`) o Libros (venta).
   Los temas de acuarela reproducen las cubiertas oficiales y son los de por defecto; los oscuros
   (`fenix`, `bosque`, `editorial`) solo si se piden.
   Si falta información esencial y no se puede deducir, pregunta una sola vez.

2. **Fuentes de verdad.** La única fuente oficial es la web publicada **https://aptorrescusa.com**.
   Los HTML de este repositorio NO son la versión oficial y pueden estar desactualizados: no saques
   de ellos precios, ISBN, páginas, tiendas, textos ni descripciones de personajes.
   - Consulta la web en vivo (WebFetch) antes de escribir cualquier dato. Si no se puede acceder,
     pide a la persona el texto o capturas de la web y marca en `caption.md` → "Notas" qué datos
     quedan pendientes de verificar. No publiques nada sin verificar.
   - **Nunca inventes versos ni citas de Ángel**: usa solo los publicados en la web oficial o deja
     un marcador `[VERSO DE ÁNGEL]` y avisa.
   - **Material oficial ya disponible**: `instagram-studio/brand/oficial/` (cubiertas vigentes de
     los dos libros y los textos de sus contraportadas en `LEEME.md`). Úsalo antes que nada.
   - Las imágenes de `assets/images/` (sobre todo las portadas antiguas) pueden estar desfasadas:
     usa siempre las cubiertas de `brand/oficial/` y confirma los retratos de personajes.

3. **Guion.** Propón la estructura en una lista (6–9 diapositivas):
   portada (gancho ≤ 7 palabras) → 2.ª diapositiva igual de fuerte (Instagram la muestra primero a veces)
   → desarrollo alternando tipos → `libro` si procede → `cta` con acción concreta.
   Una sola palabra en `*cursiva*` por título. Español con tildes y ¿¡.

4. **Crear.** `cd instagram-studio && npm run nuevo -- <nombre> --tema <tema>` y escribe
   `carousel.json` + `caption.md` (gancho en la 1.ª línea, ≤ 5 hashtags siempre con #aptorrescusa,
   texto alternativo por diapositiva, música sugerida, primer comentario).
   Fecha de la carpeta = día previsto de publicación (renombra si hace falta).

5. **Validar.** `npm run validar -- <slug>` hasta que no haya ✗. Atiende también los avisos (!).

6. **Revisar diseño.** `npm run fijas -- <slug>` y **mira** `output/<slug>/_hoja-contactos.png`
   y las diapositivas una a una con la herramienta de lectura de imágenes. Comprueba: textos
   que no tocan el hilo dorado ni el margen, caras sin tapar (ajusta `enfoque`), cortes de línea
   bonitos (`\n`), portada legible en miniatura. Itera hasta que esté bien.

7. **Render final.** `npm run render -- <slug>` (≈25 s por diapositiva). Para comprobar el
   movimiento, extrae fotogramas: `ffmpeg -i output/<slug>/02-verso.mp4 -vf "select='eq(n\,15)+eq(n\,60)+eq(n\,120)',scale=360:-1,tile=3x1" -frames:v 1 /tmp/frames.png`.

8. **Entrega.** Resume: estructura, archivos en `output/<slug>/` (MP4 en orden + `caption.md`),
   y los pasos de publicación de `docs/05-render-y-publicacion.md`. `output/` no se commitea;
   sí `carousels/<slug>/`.

## Si se pide algo que el motor no hace

- Nuevo tipo de diapositiva: añádelo en `engine/engine.js` (`BUILDERS`) + estilos en
  `engine/slides.css`, respeta las curvas `--ease-*` y el patrón `--d` de retardos, documenta en
  `docs/06-referencia-json.md` y en `scripts/validate.mjs` (`TIPOS`, `REQUERIDOS`).
- Imágenes nuevas: sigue `docs/04-imagenes-con-ia.md` (bloques de estilo por tema). Nunca generes
  la cara de Ángel con IA.
- Todas las animaciones deben ser CSS (keyframes/transitions): el renderizador las congela con
  `document.getAnimations()` y avanza el reloj. Nada de `setTimeout` ni `requestAnimationFrame` propios.

## Identidad (resumen)

Como las cubiertas: papel `#F6EDD9`, tinta `#42382C`, vino `#8F2D4A` (Fénix), musgo `#4F6B2E` y
vaquero `#3F5F7C` (Portadores), acuarela. Playfair Display (títulos, cursiva = voz poética),
Inter (texto), Great Vibes (solo firma).
Lienzo 1080 × 1350, margen 96 px. Tono: íntimo, literario, segunda persona, sin emojis en las diapositivas.
