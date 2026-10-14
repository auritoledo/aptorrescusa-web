# 3 · Dirección de arte y animación

## Identidad

La referencia visual oficial son **las cubiertas de los libros** (`brand/oficial/`): papel crema,
tinta marrón, acuarela y un título manuscrito. Todos los temas salen de ellas.

| Tema | Base | Acento | Atmósfera |
|---|---|---|---|
| **`fenix-acuarela`** | papel `#F6EDD9`, tinta `#42382C` | vino `#8F2D4A` | Manchas arcoíris (rosa, azul, oro, lila) y pan de oro que flota. |
| **`bosque-acuarela`** | papel, tinta | musgo `#4F6B2E` y vaquero `#3F5F7C` | Acuarela azul a un lado y musgo al otro, como la cubierta, y hojas que caen. |
| **`papel`** | papel, tinta | sepia `#8A6A3E`, cursivas en vino | Neutro, para el autor y las noticias. |

**Tipografía:** Playfair Display (títulos; la cursiva es la voz poética), Inter (textos de apoyo)
y Great Vibes (solo la firma "A.P. Torrescusa"). Se eligieron para acompañar las cubiertas; si la
web oficial usa otras, se cambian en `brand/fonts/` y `brand/tokens.css`.

Los tokens viven en [`brand/tokens.css`](../brand/tokens.css) y las fuentes están en local
(`brand/fonts/`) para que el render sea idéntico sin conexión.

## Composición (lienzo 1080 × 1350, 4:5)

- **Margen seguro: 96 px.** El grid del perfil recorta ~34 px por lado; nada importante fuera del margen.
- **Jerarquía de tres niveles**: kicker (mayúsculas espaciadas, color de acento) → título (serif grande) → apoyo (sans o serif cursiva).
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

- **Solo arte de la web oficial**, guardado en `brand/oficial/` (ver [04-arte-oficial.md](04-arte-oficial.md)).
  Nada de imágenes de otras fuentes ni generadas con IA.
- Pide los originales en la mayor resolución posible (ideal 1600 px o más de ancho): el Ken Burns amplía un 14 %.
- Retratos del autor: los oficiales en blanco y negro (`autor-retrato-1.jpg`, `autor-retrato-2.jpg`).
- Sin arte oficial para una idea, la diapositiva se hace solo con tipografía.

## Checklist visual antes de renderizar

- [ ] La portada se entiende en miniatura (mírala en la "Tira continua" del estudio).
- [ ] Una sola palabra en cursiva por título.
- [ ] Ningún texto toca el hilo dorado ni se sale del margen.
- [ ] Las caras no quedan tapadas por el título (ajusta `enfoque`).
- [ ] La diapositiva 2 funciona por sí sola.
