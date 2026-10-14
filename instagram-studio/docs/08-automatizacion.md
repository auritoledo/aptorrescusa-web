# 8 · Publicación programada y agentes

Sistema para que los carruseles se publiquen solos en **@aptorrescusa** a la hora prevista,
con un equipo de agentes que los prepara y **una persona que siempre aprueba**.

```
 AGENTES (Claude Code)                          PERSONA                 AUTOMÁTICO (GitHub Actions)
 ─────────────────────                          ───────                 ───────────────────────────
 analista-metricas ─┐
 estratega ─────────┤  semana-instagram         revisa el PR
 creador ───────────┤  (skill que los           y lo fusiona   ──►  cada 30 min: ¿hay algo
 revisor-marca ─────┤   coordina)                    │                aprobado y en hora?
 programador ───────┘──► PR con carruseles      aprueba cada            │ sí
                         en estado PENDIENTE     carrusel ──────►  render → subida → publica
                                                 (botón en GitHub)       │
                                                                     guarda enlace y estado
                                                                         │
                                          métricas diarias (24 h / 72 h / 7 d) ◄─┘
```

## 1. Estados de cada carrusel (`carousels/<slug>/publicacion.json`)

| Estado | Significa | Quién lo pone |
|---|---|---|
| *(sin archivo)* | Borrador, sin fecha | — |
| `pendiente` | Tiene fecha propuesta; **no se publicará** | Agente programador o `npm run proponer` |
| `programado` | Aprobado: se publicará solo a su hora | **Solo una persona** (`npm run aprobar` o el botón de GitHub) |
| `publicando` | Subiendo a Instagram en este momento | Publicador |
| `publicado` | Publicado; guarda el enlace y el ID | Publicador |
| `error` | Algo falló; el motivo queda en `error` e `historial` | Publicador |

Ver el calendario: `npm run calendario`.

## 2. El equipo de agentes

| Agente | Hace | Nunca hace |
|---|---|---|
| `estratega-instagram` | Plan de 4 semanas con ideas, fuentes oficiales y fechas | Escribir archivos |
| `creador-carruseles` | `carousel.json` + `caption.md`, validados y revisados visualmente | Proponer fechas ni publicar |
| `revisor-marca` | Control de calidad: fuentes, versos literales, arte, límites, ortografía, diseño | Modificar nada |
| `programador-publicaciones` | Propone fechas (estado `pendiente`) y prepara el resumen de aprobación | Aprobar ni publicar |
| `analista-metricas` | Informe mensual en `informes/` y resultados en cada `caption.md` | Tocar la programación |

La skill **`semana-instagram`** los coordina. En Claude Code basta con decir:
*«Prepara las publicaciones de Instagram del próximo mes»*.

Para que se haga sola cada semana, se puede crear una **tarea programada de Claude** (por ejemplo,
los lunes a las 9:00) que ejecute esa skill y abra el PR. El resultado sigue esperando aprobación humana.

## 3. Configuración inicial (una sola vez)

> Esta sección cubre la API oficial. Para comparar con otros caminos (servicios intermedios,
> Make, programadores visuales), ver [09-caminos-de-conexion.md](09-caminos-de-conexion.md).
> Con Instagram Login, el token se renueva solo con el workflow «Instagram · renovar token».

### 3.1 Cuenta de Instagram
- @aptorrescusa debe ser una **cuenta profesional** (Creador o Empresa).
- Para la subida directa de vídeos (recomendado), vincúlala a una **página de Facebook** desde
  Meta Business Suite.

### 3.2 App de Meta
1. En [developers.facebook.com](https://developers.facebook.com) → *Mis apps* → *Crear app* (tipo **Empresa**).
2. Añade el producto **Instagram** y elige el tipo de inicio de sesión:
   - **Facebook Login for Business** (recomendado: `IG_LOGIN=facebook`). Permite subir los vídeos
     directamente, sin alojarlos en ningún sitio. Permisos: `instagram_basic`,
     `instagram_content_publish`, `instagram_manage_insights`, `instagram_manage_comments`,
     `pages_show_list`, `pages_read_engagement`, `business_management`.
   - **Instagram Login** (`IG_LOGIN=instagram`): no necesita página de Facebook, pero los vídeos
     se tienen que alojar en una URL pública (modo `url`). Permisos: `instagram_business_basic`,
     `instagram_business_content_publish`, `instagram_business_manage_insights`,
     `instagram_business_manage_comments`.
3. La app puede quedarse **en modo desarrollo**: como Ángel (o quien la cree) tiene un rol en ella,
   puede publicar en su propia cuenta sin pasar la revisión de Meta.

### 3.3 Token de acceso
- **Facebook Login:** crea en Meta Business Suite un **usuario del sistema** con acceso a la página y a
  la cuenta de Instagram y genera su token con los permisos de arriba. **No caduca.**
- **Instagram Login:** genera un token de larga duración (60 días) y renuévalo antes de que caduque.
- `IG_USER_ID`: el ID de la cuenta de Instagram. Con Facebook Login:
  `GET /me/accounts?fields=instagram_business_account` (Graph API Explorer).

### 3.4 Secretos y variables en GitHub
*Settings → Secrets and variables → Actions*:

| Tipo | Nombre | Valor |
|---|---|---|
| Secret | `IG_USER_ID` | ID de la cuenta de Instagram |
| Secret | `IG_ACCESS_TOKEN` | Token del paso 3.3 |
| Variable | `IG_LOGIN` | `facebook` (por defecto) o `instagram` |
| Variable | `IG_MEDIA_MODE` | `resumable` (por defecto con Facebook Login) o `url` |
| Variable | `IG_API_VERSION` | Opcional; por defecto `v26.0` |
| Variable | `MEDIA_BASE_URL` | Solo modo `url`: URL pública de la carpeta, p. ej. `https://aptorrescusa.com/ig-media` |
| Variable | `MEDIA_FTP_DIR` | Solo modo `url`: carpeta del servidor que corresponde a esa URL |
| Secret | `MEDIA_FTP_HOST` / `MEDIA_FTP_USER` / `MEDIA_FTP_PASSWORD` | Solo modo `url`: acceso FTP al alojamiento |

Las imágenes fijas (`"formato": "imagen"` en `publicacion.json`) siempre necesitan el modo `url`.

### 3.5 Comprobar
1. En el ordenador: `IG_USER_ID=… IG_ACCESS_TOKEN=… npm run instagram:comprobar`
   (dice qué cuenta está conectada y la cuota de publicación).
2. En GitHub: *Actions* → «Instagram · publicar carruseles programados» → *Run workflow* con
   **Simular** marcado.
3. Los workflows programados solo funcionan en la rama principal (`main`).

## 4. Día a día

1. Los agentes preparan los carruseles y abren un PR (o se crean a mano con `npm run nuevo`).
2. La persona revisa las hojas de contactos y **fusiona el PR**.
3. La persona **aprueba** cada carrusel:
   - GitHub (también desde el móvil): *Actions* → «Instagram · aprobar o cancelar» → *Run workflow* →
     escribe el nombre del carrusel → `aprobar`. Se puede cambiar la fecha en el mismo paso.
   - O en el ordenador: `npm run aprobar -- <slug> --por "Ángel"` y subir el cambio.
4. A su hora (con hasta ~30 min de margen), GitHub lo renderiza, lo sube y lo publica, añade el
   primer comentario y guarda el enlace en `publicacion.json`.
5. Cada día se guardan las métricas; una vez al mes, el analista escribe su informe.

Para frenar una publicación: «Instagram · aprobar o cancelar» → `cancelar` (vuelve a `pendiente`).

## 5. Garantías de seguridad

- **Nada se publica sin aprobación humana**: el publicador solo mira el estado `programado`, y ese estado
  solo lo ponen `npm run aprobar` o el workflow de aprobación (que solo puede lanzar quien tiene permiso
  de escritura en el repositorio).
- **Sin duplicados**: antes de llamar a Instagram el estado pasa a `publicando` y se guarda en git. Si un
  intento falla, antes de reintentar se buscan las últimas publicaciones de la cuenta por si ya hubiera
  salido. Como máximo 3 intentos.
- **Sin publicaciones a deshora**: si la hora prevista se pasó más de 12 h (GitHub caído, etc.), no se
  publica; queda en `error` para proponer otra fecha.
- **Máximo 2 publicaciones por ejecución** y control de la cuota de Instagram.
- `npm run aprobar` vuelve a validar el carrusel: no se aprueba nada con errores, sin caption o con más de
  10 diapositivas.

## 6. Límites de la API de Instagram (octubre 2026)

| Límite | Valor |
|---|---|
| Diapositivas por carrusel publicado por API | 2–10 (en la app son 20) |
| Publicaciones por API | 100 en 24 h (algunas páginas de Meta aún dicen 50) |
| Programación nativa | No existe: la hace este sistema |
| Música | **No se puede añadir por API.** Si un carrusel la necesita, publícalo a mano desde la app |
| Texto alternativo | Solo en imágenes; en los vídeos no se puede |
| Hashtags | 5 como máximo |

## 7. Problemas frecuentes

| Síntoma | Causa probable | Solución |
|---|---|---|
| `Faltan variables: IG_USER_ID…` | Secretos no configurados | Paso 3.4 |
| `(code 190)` | Token caducado o revocado | Genera uno nuevo (paso 3.3) |
| `(code 10)` o `(code 200)` | Falta un permiso | Revisa los permisos de la app (paso 3.2) |
| `La subida directa solo funciona con IG_LOGIN=facebook` | Instagram Login + modo `resumable` | Usa `IG_MEDIA_MODE=url` con FTP |
| Contenedor en `ERROR` | Vídeo no aceptado | Vuelve a renderizar; comprueba que dura entre 3 y 60 s |
| Estado `error` «Fuera de plazo» | La hora pasó hace más de 12 h | Propón una fecha nueva y vuelve a aprobar |
| No se ejecuta a su hora | Los workflows solo corren en `main`, o GitHub va con retraso | Fusiona en `main`; el margen normal es de unos minutos |
| `No se pudo guardar el estado en git` | `main` está protegida y no admite commits directos | Permite que GitHub Actions haga push a `main` (o añade una excepción para el bot) |

## Fuentes

- [Meta · Publish Content using the Instagram Platform](https://developers.facebook.com/docs/instagram-platform/content-publishing/)
- [Meta · IG User Media (referencia)](https://developers.facebook.com/docs/instagram-platform/instagram-graph-api/reference/ig-user/media/)
- [Instagram API rate limits (bundle.social)](https://bundle.social/blog/instagram-api-rate-limits)
- [Instagram API alt text (AdaptlyPost)](https://adaptlypost.com/es/blog/instagram-api-alt-text-character-limit)
