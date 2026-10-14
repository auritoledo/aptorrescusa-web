# 5 · Render y publicación

## Instalación (una sola vez, en el ordenador de Ángel)

1. Instalar [Node.js 20 o superior](https://nodejs.org).
2. En una terminal, dentro de `instagram-studio/`:
   ```bash
   npm install
   npx playwright install chromium
   ```
   (`npm install` trae también ffmpeg, no hace falta instalarlo aparte.)

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run nuevo -- nombre --tema fenix` | Crea `carousels/AAAA-MM-DD-nombre/` desde la plantilla. |
| `npm run estudio` | Abre el estudio en `http://localhost:4321`: vista previa animada, ← → para navegar, **R** repite, **T** muestra la tira continua. |
| `npm run validar` | Revisa todos los carruseles (o `npm run validar -- slug`). |
| `npm run fijas -- slug` | Solo PNG (segundos). Ideal para revisar diseño. |
| `npm run borrador -- slug` | Vídeo rápido a media resolución para revisar el movimiento. |
| `npm run render -- slug` | Calidad final: MP4 1080 × 1350, 30 fps, H.264 (~25 s de proceso por diapositiva). |
| `npm run render -- slug --solo 2,5` | Rehace solo esas diapositivas. |

## Qué sale en `output/<slug>/`

- `01-portada.mp4`, `02-verso.mp4`… → **lo que se sube a Instagram**, en ese orden.
- `01-portada.png`… → versión fija de cada diapositiva (para mezclar fijas y animadas, o para historias).
- `_hoja-contactos.png` → todas en fila, para aprobar de un vistazo (enviar a Ángel por WhatsApp).
- `_vista-previa.mp4` → todas seguidas: sirve para revisar y también como **Reel**.
- `caption.md` → copia del texto de publicación.

`output/` no se sube a git (pesa mucho); se regenera cuando haga falta.

## Publicar en Instagram (desde el móvil)

1. Pasa los MP4 al móvil (AirDrop, Google Drive, WhatsApp "como documento" para no perder calidad).
2. Instagram → **+** → Publicación → icono de selección múltiple → elige los vídeos **en orden**.
3. Comprueba que el formato sea **4:5** (la primera diapositiva fija el formato de todas).
4. **Música**: añádela en la pantalla siguiente (las diapositivas salen sin audio a propósito; la música de la biblioteca de Instagram evita problemas de derechos). Sugerencia en `caption.md`.
5. Pega el caption de `caption.md` (máximo 5 hashtags).
6. **Configuración avanzada → Accesibilidad → Texto alternativo**: pega el de cada diapositiva.
7. Ubicación: Castro Urdiales. Etiqueta colaboradores si los hay.
8. Publica entre 19:00 y 21:00. Durante la primera hora, responde a todos los comentarios.
9. Publica el "Primer comentario" del `caption.md` justo después.

## Especificaciones (octubre 2026)

| Dato | Valor |
|---|---|
| Formato | 1080 × 1350 px (4:5) |
| Diapositivas | 2–20 (ideal 6–10) |
| Vídeo por diapositiva | 3–60 s, MP4 H.264, 30 fps |
| Caption | ≤ 2.200 caracteres |
| Hashtags | ≤ 5 por publicación |

## Después de publicar

A los 7 días, añade al final de `caption.md`:

```md
## Resultados (7 días)
- Alcance: · Guardados: · Compartidos: · Comentarios: · Clics en bio:
- Aprendizaje:
```
