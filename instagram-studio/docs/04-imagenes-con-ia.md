# 4 · Imágenes y clips con IA (opcional)

El sistema funciona solo con las imágenes de la web, pero para portadas nuevas,
fondos de verso o panorámicas se pueden generar imágenes con IA. La clave es la
**coherencia**: todas deben parecer del mismo mundo.

## Herramientas conectadas en Claude

- **Higgsfield** (`generate_image`, `generate_video`, `upscale_image`, `outpaint_image`): imágenes y clips; `outpaint_image` sirve para ampliar una ilustración a panorámica.
- **Comfy Cloud** (Flux, Seedream, Nano Banana, etc. vía `partner_generate`).
- **Hailuo**: clips de vídeo a partir de una imagen (p. ej. animar un personaje 5 s y usar un fotograma como fondo).
- Skills de apoyo: `video-prompt-builder` (prompts de vídeo), `social-media-covers-auri` (estructura de prompts por sistema visual — adaptar la estética a la de Ángel).

> Nunca generes la cara de Ángel con IA ni "fotos" suyas falsas. Para el autor, usa fotos reales.

## Bloque de estilo (pegar al final de cada prompt)

**Fénix**
```
dark editorial fine-art illustration, glowing embers and ash particles rising, deep charcoal background #140d0a,
molten gold and ember orange light (#e39a52, #ffcf8a), soft painterly texture, cinematic rim light,
lots of negative space in the lower third for typography, 4:5 vertical, no text, no letters
```

**Bosque (Monte Redondo)**
```
enchanted living forest, realismo mágico, painterly fantasy illustration in the style of the existing
Sylvánima character art, moss green and golden light (#566d4a, #c9b46a), floating spores, volumetric light
through ancient trees, Basque countryside atmosphere, negative space in the lower third, 4:5 vertical, no text
```

**Editorial (autor)**
```
moody still life on a dark wooden desk, open notebook with handwritten ink, fountain pen, warm window light,
dark ink tones (#151513) and parchment (#eae6d8), shallow depth of field, film grain, 4:5 vertical, no text
```

## Ejemplos de prompt completo

- Portada de verso: `A phoenix made of burning paper pages rising from ashes, ` + bloque Fénix.
- Fondo panorámico para un carrusel de 5: generar 1:1 y ampliar con `outpaint_image` hasta 5400 × 1350 (5 × 1080). Usar como `"panorama"`.
- Lugar del libro: `The heart of Monte Redondo, a circular clearing with a giant hollow oak and green glowing eyes in the dark, ` + bloque Bosque.

## Dónde guardar

Copia la imagen final a la carpeta del carrusel (`carousels/<slug>/fondo.jpg`) y referénciala
como `"imagen": "fondo.jpg"`. No hace falta tocar `assets/` de la web.
