# 3 · Dirección de arte y animación

## Identidad

> Paleta y tipografías tomadas de la hoja de estilos de este repositorio (`premium-v2.css`).
> Si la web oficial publicada usa otros colores o fuentes, actualiza `brand/tokens.css` y esta tabla.

| Elemento | Valor | Uso |
|---|---|---|
| Fondo | `#151513` tinta | Oscuro editorial, deja brillar las imágenes. |
| Texto | `#eae6d8` papel | Nunca blanco puro. |
| Acento | `#d4a373` oro | Kickers, cursivas, líneas, botones. |
| Verde | `#566d4a` musgo | Atmósfera del bosque. |
| Titulares | **Playfair Display** | Serif editorial; la cursiva es la voz poética. |
| Texto | **Inter** | Lectura limpia en el móvil. |
| Firma | *Great Vibes* | Solo para la firma "A.P. Torrescusa". Nunca para párrafos. |

Los tokens viven en [`brand/tokens.css`](../brand/tokens.css) y las fuentes están en local
(`brand/fonts/`) para que el render sea idéntico sin conexión.

### Los tres temas

- **`fenix`** — carbón, brasas naranjas que suben, brillo rojizo. Para poesía, pérdida, renacimiento.
- **`bosque`** — verde profundo, esporas/hojas que flotan, luz dorada. Para Monte Redondo.
- **`editorial`** — tinta y papel, polvo en suspensión. Para el autor, noticias, firmados.

## Composición (lienzo 1080 × 1350, 4:5)

- **Margen seguro: 96 px.** El grid del perfil recorta ~34 px por lado; nada importante fuera del margen.
- **Jerarquía de tres niveles**: kicker (mayúsculas espaciadas, oro) → título (serif grande) → apoyo (sans o serif cursiva).
- **Cromo constante**: marca arriba a la izquierda, contador `02 / 07` arriba a la derecha, usuario abajo, y el **hilo dorado** que cruza de borde a borde: al deslizar, la línea continúa y el carrusel se siente como una sola pieza.
- **Grano de película y viñeta** en todas las diapositivas: unifican fotos de distinto origen.

## Principios de movimiento

Inspirados en las reglas de diseño de interfaces de Emil Kowalski (skill `emil-design-eng`) y en el lenguaje de títulos de cine:

1. **Curva "expo-out"** (`cubic-bezier(.16,1,.3,1)`): todo arranca con energía y se posa despacio. Nada rebota: es literatura, no un anuncio.
2. **Escalonado**: palabras cada 80–110 ms, versos cada 650 ms (ritmo de lectura en voz alta).
3. **Entrada en ≤ 3 s, luego respiro**: el motor añade 2,6 s de calma tras la última animación para leer. Instagram repite el vídeo en bucle.
4. **Movimiento ambiental continuo**: Ken Burns lento en imágenes, partículas, brillo que deriva. Así la diapositiva "vive" aunque el texto ya esté quieto.
5. **Un gesto protagonista por tipo**: palabras que suben desde una máscara (títulos), desenfoque → nitidez (versos), arco que se dibuja (personajes), libro 3D con destello (producto), botón que respira (CTA).
6. **Determinismo**: todas las animaciones son CSS y el renderizador avanza el reloj fotograma a fotograma. Lo que ves en el estudio es exactamente lo que sale en el MP4.

## Imágenes

- Retratos de personajes: usa los `.jpg` de `assets/images/personajes/` (más ligeros).
- Imágenes nuevas: mínimo 1080 px de ancho, preferible 1600+ (el Ken Burns amplía un 14 %).
- Para fotos de Ángel, mejor en blanco y negro o luz cálida: encajan con la paleta.
- Ver [04-imagenes-con-ia.md](04-imagenes-con-ia.md) para generar fondos coherentes.

## Checklist visual antes de renderizar

- [ ] La portada se entiende en miniatura (mírala en la "Tira continua" del estudio).
- [ ] Una sola palabra en cursiva por título.
- [ ] Ningún texto toca el hilo dorado ni se sale del margen.
- [ ] Las caras no quedan tapadas por el título (ajusta `enfoque`).
- [ ] La diapositiva 2 funciona por sí sola.
