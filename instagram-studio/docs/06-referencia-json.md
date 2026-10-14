# Referencia de `carousel.json`

Cada carrusel vive en `carousels/AAAA-MM-DD-nombre/` con dos archivos:

- `carousel.json` → las diapositivas (lo que se anima).
- `caption.md` → el texto de la publicación, hashtags, texto alternativo y música.

Las imágenes pueden ser:

- **Arte oficial guardado**: `"brand/oficial/fenix-portada.jpg"` (ver `brand/oficial/LEEME.md`).
- **Enlace directo a la web**: `"https://aptorrescusa.com/…"` (el render necesitará conexión).

Ninguna otra imagen es válida: el validador rechaza cualquier ruta fuera de `brand/oficial/`,
archivos sueltos en la carpeta del carrusel o imágenes generadas. Ver [04-arte-oficial.md](04-arte-oficial.md).

## Formato de texto

| Escribes | Se ve |
|---|---|
| `*palabra*` | *cursiva en color acento* (úsalo 1 vez por título, en la palabra emocional) |
| `**palabra**` | **negrita en acento** |
| `\n` | salto de línea (controla dónde corta el título) |

## Opciones del carrusel

| Campo | Valores | Por defecto | Qué hace |
|---|---|---|---|
| `titulo` | texto | — | Nombre interno (no se muestra). |
| `tema` | `fenix-acuarela` · `bosque-acuarela` · `papel` | `papel` | Paleta, manchas de acuarela y partículas (pan de oro, hojas, motas de papel). |
| `hilo` | `true` / `false` | `true` | Línea dorada que cruza todas las diapositivas y "une" el deslizamiento. |
| `panorama` | ruta o `{ "imagen": ruta, "opacidad": 0.45 }` | — | Una imagen panorámica repartida entre todas las diapositivas (efecto de lienzo continuo). Usa una imagen muy ancha (p. ej. 1080·N × 1350). |
| `particulas` | número o `false` | según tema | Cantidad de partículas. |
| `duracion` | segundos | 6 | Duración mínima por diapositiva (el motor alarga si el texto lo necesita). |
| `fps` | 24 · 30 | 30 | Fotogramas por segundo del vídeo. |
| `marca` | `{ "usuario": "@…", "web": "…", "logo": ruta }` | @aptorrescusa · aptorrescusa.com · sin logo | Datos de firma. Sin `logo`, el cierre muestra el nombre en versalitas espaciadas, como en las cubiertas. |

Cualquier diapositiva puede sobrescribir `tema`, `hilo`, `particulas`, `duracion` (3–60 s) y `enfoque`.

## Tipos de diapositiva

### `portada` — el gancho
```json
{ "tipo": "portada", "kicker": "El amor del Fénix", "titulo": "Cómo se *renace*\ndespués de arder",
  "subtitulo": "Promesa concreta.", "imagen": "brand/oficial/autor-retrato-1.jpg", "enfoque": "62% 18%", "deslizar": "Desliza" }
```
Imagen opcional (sin imagen = fondo atmosférico del tema). `enfoque` = qué parte de la imagen queda centrada (`"50% 20%"` = arriba).
Con `"libro": "brand/oficial/portadores-portada.jpg"` la portada muestra el libro en 3D como protagonista y el título debajo.

### `verso` — poesía línea a línea
```json
{ "tipo": "verso", "etiqueta": "Fénix en Cicatrices", "marca": "III",
  "lineas": ["El dolor es solo", "leña mojada,"], "firma": "A.P. Torrescusa", "imagen": "opcional (se oscurece y desenfoca)" }
```
Cada verso aparece con desenfoque → nitidez. `marca` dibuja un número o letra gigante en contorno detrás. Máximo 8 versos.

### `personaje` — ficha del universo
```json
{ "tipo": "personaje", "numero": "01", "rol": "El Guardián Marcado", "nombre": "Unai",
  "texto": "Una o dos frases.", "imagen": "brand/oficial/personaje-unai.jpg", "estilo": "arco | completo" }
```
`arco` (por defecto): retrato en un arco dorado que se dibuja solo. `completo`: ilustración a sangre, texto abajo.

### `libro` — producto
```json
{ "tipo": "libro", "kicker": "Poemario · 173 páginas", "titulo": "El amor del Fénix", "texto": "Frase gancho.",
  "portada": "brand/oficial/fenix-portada.jpg", "datos": ["Formato · precio"], "precio": "aptorrescusa.com" }
```
La portada entra en 3D, flota y recibe un destello de luz. `precio` se muestra como píldora destacada.

### `texto` — una idea
```json
{ "tipo": "texto", "kicker": "El universo", "titulo": "No es un paisaje.", "texto": "Párrafo.\n\nSegundo párrafo.", "imagen": "opcional (banda superior)" }
```

### `lista` — 2 a 4 puntos
```json
{ "tipo": "lista", "kicker": "Tres raíces", "titulo": "De dónde nace la *escritura*",
  "items": [ { "titulo": "Dos tierras", "texto": "Explicación breve." } ] }
```

### `cita` — frase memorable
```json
{ "tipo": "cita", "texto": "Escribo porque hay heridas que necesitan convertirse en *tinta*.", "autor": "A.P. Torrescusa" }
```

### `cta` — cierre con acción
```json
{ "tipo": "cta", "kicker": "Tu turno", "titulo": "¿En qué fase estás *tú*?", "texto": "Instrucción clara.",
  "libros": ["brand/oficial/fenix-portada.jpg"], "boton": "El libro, en aptorrescusa.com", "url": "Enlace en la bio", "logo": true }
```

## Límites que vigila `npm run validar`

- 2–20 diapositivas (ideal 6–10). Primera = `portada`, última = `cta`.
- Títulos ≤ 60 caracteres, textos ≤ 260, nombres ≤ 22.
- Versos ≤ 8 por diapositiva, listas ≤ 4 puntos.
- Duración por diapositiva entre 3 y 60 s.
- Caption ≤ 2.200 caracteres y **máximo 5 hashtags** (límite de Instagram desde diciembre de 2025).
- Todas las imágenes existen.
