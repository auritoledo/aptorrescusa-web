# Instagram Studio · A.P. Torrescusa

Sistema completo para crear **carruseles animados** para el Instagram de Ángel
([@angel19643](https://www.instagram.com/angel19643/)) con la misma identidad visual que
[aptorrescusa.com](https://aptorrescusa.com).

Escribes el contenido en un archivo de texto (`carousel.json`), lo ves animado en el
navegador y con un comando obtienes los vídeos MP4 listos para subir.

```
Idea → Guion → carousel.json → Estudio (vista previa) → Render MP4 → Publicar
```

## Empezar en 3 minutos

```bash
cd instagram-studio
npm install && npx playwright install chromium   # solo la primera vez

npm run estudio                                    # vista previa → http://localhost:4321
npm run render -- 2026-10-20-fenix-fases-del-renacimiento
```

Los vídeos aparecen en `output/2026-10-20-fenix-fases-del-renacimiento/`.

**Con Claude Code** basta con pedir: *"Hazme un carrusel sobre los Sylvánimas que faltan"*.
La skill [`carrusel-instagram`](../.claude/skills/carrusel-instagram/SKILL.md) se encarga del flujo entero.

## Qué hay en cada carpeta

| Carpeta | Contenido |
|---|---|
| `brand/` | Paleta, temas (`fenix`, `bosque`, `editorial`) y tipografías en local. |
| `engine/` | El motor: 8 tipos de diapositiva animada y el estudio de vista previa. |
| `carousels/` | Un carrusel por carpeta (`carousel.json` + `caption.md`). `_plantilla/` es la base. |
| `scripts/` | `nuevo`, `validar`, `render` y el servidor local. |
| `docs/` | Guías del flujo de trabajo (leer en orden). |
| `output/` | Vídeos e imágenes generados (no se guardan en git). |

## Guías

1. [Estrategia de contenido](docs/01-estrategia.md) — pilares, calendario, métricas.
2. [Guion del carrusel](docs/02-guion.md) — estructura, fórmulas de portada, caption.
3. [Dirección de arte y animación](docs/03-direccion-de-arte.md) — identidad, composición, movimiento.
4. [Imágenes con IA](docs/04-imagenes-con-ia.md) — prompts coherentes con el universo.
5. [Render y publicación](docs/05-render-y-publicacion.md) — comandos, subida a Instagram, checklist.
6. [Referencia de `carousel.json`](docs/06-referencia-json.md) — todos los campos y tipos.
7. [Skills y herramientas](docs/07-skills-y-herramientas.md) — investigación y alternativas.

## Tipos de diapositiva

| Tipo | Animación protagonista |
|---|---|
| `portada` | Palabras que suben desde una máscara + Ken Burns + "Desliza →" |
| `verso` | Versos que pasan de desenfocados a nítidos, uno a uno, con número gigante en contorno |
| `personaje` | Retrato que se revela en un arco dorado que se dibuja solo |
| `libro` | Portada en 3D que entra, flota y recibe un destello |
| `texto` | Título por palabras + párrafo, con banda de imagen opcional |
| `lista` | Puntos numerados con líneas que se trazan |
| `cita` | Comillas gigantes + frase palabra a palabra + firma manuscrita |
| `cta` | Logo, pregunta, portadas y botón que respira |

Todas comparten: partículas del tema, grano de película, viñeta, contador y el **hilo dorado**
que continúa de una diapositiva a la siguiente.

## Carruseles de ejemplo (listos para publicar)

- `2026-10-20-fenix-fases-del-renacimiento` — poesía, tema fénix, 7 diapositivas.
- `2026-10-27-guardianes-de-monte-redondo` — personajes, tema bosque, 9 diapositivas.
- `2026-11-03-tinta-de-cicatrices` — el autor, tema editorial, 5 diapositivas.

> Esta carpeta es una herramienta interna: su `.htaccess` impide que se sirva públicamente
> si se sube al hosting junto a la web.
