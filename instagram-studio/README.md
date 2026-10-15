# Instagram Studio · A.P. Torrescusa

Sistema completo para crear **carruseles animados** para el Instagram de Ángel
([@aptorrescusa](https://www.instagram.com/aptorrescusa/)).

> **Fuente oficial: la web [aptorrescusa.com](https://aptorrescusa.com)** y el material oficial
> guardado en `brand/oficial/` (cubiertas, retratos y textos verificados).
> Esta carpeta es independiente: no usa nada del resto del repositorio en el que está.
> Se puede copiar a cualquier ordenador y funciona sola.

Escribes el contenido en un archivo de texto (`carousel.json`), lo ves animado en el
navegador y con un comando obtienes los vídeos MP4 listos para subir.

```
Idea → Guion → carousel.json → Estudio (vista previa) → Render MP4 → Aprobación → Publicación automática
```

Un **equipo de agentes** (Claude Code) prepara los carruseles y **GitHub Actions los publica solos**
a la hora programada, con música integrada, siempre después de que una persona los apruebe.
**Para conectarlo por primera vez: [docs/10-puesta-en-marcha.md](docs/10-puesta-en-marcha.md).** Ver
[Publicación programada y agentes](docs/08-automatizacion.md).

## Empezar en 3 minutos

```bash
cd instagram-studio
npm install && npx playwright install chromium   # solo la primera vez

npm run estudio                                    # vista previa → http://localhost:4321
npm run render -- 2026-10-20-fenix-fases-del-renacimiento
```

Los vídeos aparecen en `output/2026-10-20-fenix-fases-del-renacimiento/`.

**Con Claude Code** basta con pedir: *"Hazme un carrusel con versos de la fase Vuelo"*
(skill [`carrusel-instagram`](../.claude/skills/carrusel-instagram/SKILL.md)) o
*"Prepara las publicaciones del próximo mes"* (skill [`semana-instagram`](../.claude/skills/semana-instagram/SKILL.md),
que coordina a los agentes de `.claude/agents/`).

## Qué hay en cada carpeta

| Carpeta | Contenido |
|---|---|
| `brand/` | Paleta, temas y tipografías en local. `brand/oficial/` guarda las cubiertas oficiales y sus textos. |
| `engine/` | El motor: 8 tipos de diapositiva animada y el estudio de vista previa. |
| `carousels/` | Un carrusel por carpeta (`carousel.json` + `caption.md`). `_plantilla/` es la base. |
| `scripts/` | `nuevo`, `validar`, `render`, servidor local, calendario (`proponer`/`aprobar`), `publicar` y `metricas`. |
| `informes/` | Informes mensuales del agente analista. |
| `docs/` | Guías del flujo de trabajo (leer en orden). |
| `output/` | Vídeos e imágenes generados (no se guardan en git). |

## Calendario y publicación

```bash
npm run calendario                                   # qué hay previsto y en qué estado
npm run proponer -- <slug> "2026-10-20 19:30"        # fecha propuesta (hora de España)
npm run aprobar  -- <slug> --por "Ángel"             # aprobado: se publicará solo
npm run cancelar -- <slug>                           # frenar una publicación
npm run publicar:simular                             # ver qué publicaría ahora, sin tocar Instagram
```

## Guías

1. [Estrategia de contenido](docs/01-estrategia.md) — pilares, calendario, métricas.
2. [Guion del carrusel](docs/02-guion.md) — estructura, fórmulas de portada, caption.
3. [Dirección de arte y animación](docs/03-direccion-de-arte.md) — identidad, composición, movimiento.
4. [Arte oficial](docs/04-arte-oficial.md) — solo arte de aptorrescusa.com: cómo añadirlo y recortarlo.
5. [Render y publicación](docs/05-render-y-publicacion.md) — comandos, subida a Instagram, checklist.
6. [Referencia de `carousel.json`](docs/06-referencia-json.md) — todos los campos y tipos.
7. [Skills y herramientas](docs/07-skills-y-herramientas.md) — investigación y alternativas.
8. [Publicación programada y agentes](docs/08-automatizacion.md) — calendario, aprobación, publicación automática, métricas.
9. [Caminos para conectar Instagram](docs/09-caminos-de-conexion.md) — API oficial, intermediarios, Make/n8n, programadores; comparativa y recomendación.
10. [Puesta en marcha](docs/10-puesta-en-marcha.md) — **lista paso a paso para conectar @aptorrescusa (camino A2)**.

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

## Carruseles de ejemplo

Hechos solo con material oficial: cubiertas, contraportadas, retratos y el manuscrito de
*El amor del Fénix*. Las fuentes de cada texto están en "Notas" de su `caption.md`.

- `2026-10-20-fenix-fases-del-renacimiento` — «Lo que el tiempo no se lleva» y las cuatro fases, tema `fenix-acuarela`, 8 diapositivas.
- `2026-10-27-guardianes-de-monte-redondo` — «El bosque está muriendo», tema `bosque-acuarela`, 8 diapositivas.
- `2026-11-03-tinta-de-cicatrices` — el autor, tema `papel`, 5 diapositivas.

