# 7 · Skills y herramientas (investigación, octubre 2026)

Qué se investigó para montar un flujo profesional y cómo encaja cada pieza.

## La skill propia del proyecto

**`.claude/skills/carrusel-instagram/`** (en la raíz del repositorio). Claude Code la carga
sola cuando se le pide "hazme un carrusel sobre…". Sigue el flujo completo: brief → guion →
JSON → validar → revisar PNG → render → caption. Es la pieza central del sistema.

## Skills disponibles en la cuenta y para qué usarlas

| Skill | Uso en este flujo |
|---|---|
| `emil-design-eng` | Criterio de animación (curvas, duraciones, nada de rebotes). Ya aplicado en `engine/slides.css`. |
| `marketing:content-creation`, `small-business:social-content-engine` | Lluvia de ideas y calendarios de contenido. |
| `design:design-critique` | Segunda opinión sobre una hoja de contactos antes de publicar. |
| `design:ux-copy` | Afinar CTAs y microtextos. |

Conectores útiles: **Google Drive** (pasar los MP4 al móvil).

> Se descartan las herramientas de imagen con IA (Higgsfield, Comfy Cloud, Hailuo y las skills
> `social-media-covers-auri` y `video-prompt-builder`): por decisión de marca, solo se usa el arte
> oficial de aptorrescusa.com.

## Alternativa evaluada: Remotion

[Remotion](https://www.remotion.dev) (vídeo con React) tiene una skill oficial para Claude Code
y es el estándar en 2026 para vídeo programático. Se descartó como motor principal porque:

- Este sistema necesita **plantillas fijas de marca**, no edición de vídeo libre.
- HTML + CSS + Playwright + ffmpeg no requiere aprender React ni montar un proyecto aparte,
  y reutiliza tipografías y paleta de la web tal cual.
- El resultado es igual de determinista (avance fotograma a fotograma).

Si un día se quieren Reels largos con audio sincronizado o montajes con muchos clips, Remotion
es el siguiente paso natural: las plantillas de `engine/` se traducen casi una a una a componentes.

## Datos de Instagram que condicionan el diseño

- 1080 × 1350 (4:5) y hasta 20 diapositivas; la primera fija el formato de todas.
- Vídeo por diapositiva hasta 60 s, MP4 H.264.
- **Máximo 5 hashtags por publicación** desde el 18/12/2025 (antes 30).
- Instagram puede volver a mostrar un carrusel empezando por la 2.ª diapositiva → la 2.ª también debe enganchar.

## Fuentes

- [Remotion · Claude Code plugin y Agent Skills](https://convert.remotion.dev/docs/ai/claude-code-plugin)
- [How to Use Remotion Agent Skills With Claude Code (Tella)](https://www.tella.com/blog/how-to-use-remotion-agent-skills-with-claude-code.md)
- [remotion-video-skill (comunidad)](https://claudemarketplaces.com/skills/wshuyi/remotion-video-skill/remotion-video)
- [Instagram Carousel Size Guide 2026 (TryMyPost)](https://www.trymypost.com/blog/instagram-carousel-sizes-guide)
- [Instagram carousel size & format 2026 (Contentdrips)](https://contentdrips.com/blog/2026/05/instagram-carousel-size-format/)
- [Instagram limita los hashtags a 5 (Ruche Pollen)](https://ruche-pollen.com/blog-social-media/instagram-limite-les-hashtags-a-5-maximum-ce-qui-change-pour-les-marques)
- [Instagram hashtag limit (Lilach Bullock)](https://www.lilachbullock.com/instagram-hashtag-limit/)
- [Instagram Carousel Algorithm 2026 (TryMyPost)](https://www.trymypost.com/blog/instagram-carousel-algorithm-strategy-2026)
- [Instagram carousel (WaveGen)](https://wavegen.ai/instagram-carousel)
