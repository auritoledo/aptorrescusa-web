---
name: carrusel-instagram
description: Crea carruseles animados para el Instagram de A.P. Torrescusa (Ángel, @aptorrescusa) con el sistema de instagram-studio/. Úsala siempre que se pida un carrusel, post, publicación de Instagram, contenido para redes, diapositivas animadas, o una pieza sobre El amor del Fénix, Los Portadores del Ojo Verde, Monte Redondo, los Sylvánimas o el autor. También para renderizar, revisar o modificar un carrusel existente.
---

# Carrusel animado para Instagram · A.P. Torrescusa

Sistema en `instagram-studio/`. Antes de empezar, lee `instagram-studio/docs/06-referencia-json.md`
(campos y tipos) y, si el encargo es de contenido nuevo, `docs/02-guion.md`.

## Flujo (no saltarse pasos)

1. **Brief.** Aclara (o deduce del pedido) pilar y objetivo: Fuego (poesía, tema `fenix-acuarela`),
   Bosque (universo, tema `bosque-acuarela`), Tinta (autor, tema `papel`) o Libros (venta).
   Los tres temas reproducen las cubiertas oficiales (papel, tinta y acuarela).
   Si falta información esencial y no se puede deducir, pregunta una sola vez.

2. **Fuentes de verdad.** Solo dos: la web oficial **https://aptorrescusa.com** y el material
   oficial de `instagram-studio/brand/oficial/` (cubiertas, retratos, `LEEME.md` con los textos de
   contraportada y las citas verificadas del manuscrito).
   - **Ignora el resto de este repositorio** (los HTML, `assets/`, CSS…): no es la web oficial.
     No saques de ahí textos, datos, colores ni imágenes.
   - Consulta la web en vivo (WebFetch) antes de escribir cualquier dato nuevo. Si no se puede
     acceder, pide a la persona el texto o capturas de la web y marca en `caption.md` → "Notas" qué
     queda pendiente de verificar. No publiques nada sin verificar.
   - **Nunca inventes versos ni citas de Ángel.** Para versos de *El amor del Fénix*, usa las citas de
     `LEEME.md` o pide el manuscrito (`.docx`, no se guarda en el repositorio) y respeta sus saltos
     de línea. Si no hay fuente, deja `[VERSO DE ÁNGEL]` y avisa.
   - **Arte: solo el de la web oficial**, guardado en `brand/oficial/`. Nada de imágenes generadas
     con IA. El validador da error si una imagen no está en `brand/oficial/` o no viene de
     `https://aptorrescusa.com/`.
   - Instagram oficial: **@aptorrescusa**.

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

## Programar la publicación

Cuando el carrusel esté terminado y revisado: `npm run proponer -- <slug> "AAAA-MM-DD HH:MM"` (hora de
España) y explica a la persona cómo aprobarlo (ver `instagram-studio/docs/08-automatizacion.md`).
**Nunca ejecutes `npm run aprobar` ni `npm run publicar`**: aprobar es siempre cosa de una persona.
Para preparar varias publicaciones de golpe, usa la skill `semana-instagram`.

## Si se pide algo que el motor no hace

- Nuevo tipo de diapositiva: añádelo en `engine/engine.js` (`BUILDERS`) + estilos en
  `engine/slides.css`, respeta las curvas `--ease-*` y el patrón `--d` de retardos, documenta en
  `docs/06-referencia-json.md` y en `scripts/validate.mjs` (`TIPOS`, `REQUERIDOS`).
- Imágenes nuevas: solo arte oficial de aptorrescusa.com (ver `docs/04-arte-oficial.md`). Nunca
  generes imágenes con IA; si no hay arte oficial para una idea, haz la diapositiva solo con
  tipografía y pide la imagen en "Notas" del `caption.md`.
- Todas las animaciones deben ser CSS (keyframes/transitions): el renderizador las congela con
  `document.getAnimations()` y avanza el reloj. Nada de `setTimeout` ni `requestAnimationFrame` propios.

## Identidad (resumen)

Como las cubiertas: papel `#F6EDD9`, tinta `#42382C`, vino `#8F2D4A` (Fénix), musgo `#4F6B2E` y
vaquero `#3F5F7C` (Portadores), acuarela. Playfair Display (títulos, cursiva = voz poética),
Inter (texto), Great Vibes (solo firma).
Lienzo 1080 × 1350, margen 96 px. Tono: íntimo, literario, segunda persona, sin emojis en las diapositivas.
