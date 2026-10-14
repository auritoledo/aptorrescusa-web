# 4 · Arte: solo el de la web oficial

**Regla:** en los carruseles solo se usa arte publicado en [aptorrescusa.com](https://aptorrescusa.com):
cubiertas, retratos del autor, ilustraciones de personajes y logotipos de la web.

- **No** se usan imágenes de ningún otro sitio (tampoco de otros repositorios o webs antiguas).
- **No** se generan imágenes con IA ni se usan bancos de imágenes.
- **No** se repinta el arte oficial. Solo se permiten recortes y márgenes de papel.

`npm run validar` da error si una diapositiva usa una imagen que no sea oficial.

## Qué cuenta como decoración (sí permitido)

Lo que dibuja el motor con CSS no es arte, es parte del diseño: manchas de acuarela difusas,
pan de oro y hojas que flotan, grano de papel, el hilo dorado y la tipografía. Así el carrusel
sigue teniendo vida aunque una diapositiva no lleve imagen.

## Cómo añadir arte nuevo de la web

1. Descarga la imagen desde aptorrescusa.com (clic derecho → Guardar imagen) o pide el original
   en alta resolución.
2. Guárdala en `brand/oficial/` con un nombre claro (`personaje-unai.jpg`, `autor-retrato-3.jpg`).
3. Añade una línea a `brand/oficial/LEEME.md`: qué es, de qué página de la web sale y para qué se usa.
4. Úsala en el carrusel con `"imagen": "brand/oficial/personaje-unai.jpg"`.

También se puede enlazar directamente (`"imagen": "https://aptorrescusa.com/assets/..."`), pero
entonces el render necesita conexión. Es mejor guardar una copia.

## Recortes ya preparados

| Archivo | Recorte de | Para |
|---|---|---|
| `fenix-portada.jpg` | Portada plana de la cubierta completa | `libro`, `cta` |
| `fenix-ave.jpg` | El fénix de la portada, con fundido inferior al papel (sin la frase de la cubierta) | Fondo de `portada` |
| `portadores-portada.jpg` | Portada plana de la cubierta completa | `libro`, `portada` con `"libro"` |
| `portadores-rostros.jpg` | Franja superior de la portada (los dos rostros) | Banda de imagen en `texto` |

Para recortar se usa ImageMagick, sin tocar el contenido:

```bash
convert brand/oficial/portadores-portada.jpg -crop 618x470+0+0 +repage brand/oficial/portadores-rostros.jpg
```

## Si falta arte para una idea

Construye la diapositiva solo con tipografía (`texto`, `cita`, `verso`, `lista`). En los temas de
acuarela quedan elegantes sin imagen. Apunta en "Notas" de `caption.md` qué imagen oficial
mejoraría la pieza, para pedírsela a Ángel.
