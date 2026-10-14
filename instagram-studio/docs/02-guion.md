# 2 · Guion del carrusel

Un carrusel es un libro de bolsillo: portada, capítulos y contraportada.

## Estructura base (6–9 diapositivas)

| # | Tipo | Función |
|---|---|---|
| 1 | `portada` | **Gancho.** Una promesa o un misterio en ≤ 7 palabras. |
| 2 | `verso` / `cita` / `texto` | **Segundo gancho.** Instagram vuelve a mostrar el carrusel empezando por la 2.ª diapositiva a quien no deslizó: tiene que funcionar sola. Pon aquí lo más fuerte. |
| 3–N | `lista`, `personaje`, `verso`, `texto` | **Desarrollo.** Una idea por diapositiva. Alterna tipos para crear ritmo (texto → imagen → texto). |
| N-1 | `libro` | **Producto** (cuando proceda). |
| N | `cta` | **Acción concreta**: comentar una pregunta, guardar, pedir firmado. |

## Fórmulas de portada que encajan con Ángel

- **Pregunta íntima:** "¿En qué fase estás *tú*?"
- **Misterio:** "Monte Redondo te está *mirando*"
- **Promesa:** "Cómo se *renace* después de arder"
- **Confesión:** "Escribo porque me *dolía*"
- **Lista con número:** "5 Sylvánimas que guardan el *bosque*"

Evita las portadas genéricas ("Nuevo post", "Mi libro"). La portada vende la siguiente diapositiva, no el libro.

## Reglas de escritura

- **Una palabra en `*cursiva*` por título**: la emocional. Es la firma visual de la marca.
- **Títulos ≤ 7 palabras**; textos de apoyo ≤ 25 palabras.
- **Corta los títulos a mano con `\n`** en el sitio donde respira la frase.
- **Versos reales**: nunca inventar poemas en nombre de Ángel. Usa los del libro o pídele nuevos.
- **Habla a una persona** ("tú"), no a "los lectores".
- **Acentos y signos de apertura** (¿ ¡) siempre: es un escritor.

## Del borrador a `carousel.json`

1. Escribe el guion en una lista simple: `1. portada — …`, `2. verso — …`.
2. Elige el tema (`fenix`, `bosque`, `editorial`).
3. `npm run nuevo -- nombre --tema fenix` y rellena el JSON (ver [06-referencia-json.md](06-referencia-json.md)).
4. Escribe `caption.md` a la vez: el caption **amplía**, no repite las diapositivas.

## Caption

- **Primera línea = gancho** (es lo único visible antes de "más").
- 2–4 párrafos cortos, con espacio entre ellos.
- Pregunta para comentarios.
- CTA: "📖 Ejemplares firmados → enlace en la bio".
- **Máximo 5 hashtags** (límite actual de Instagram): 2 de nicho amplio (#poesía, #fantasía), 2 de nicho específico (#elamordelfenix, #escritoresespañoles) y siempre #aptorrescusa.
- Texto alternativo por diapositiva (accesibilidad + SEO interno de Instagram).
