# 9 · Todos los caminos para conectar Instagram y publicar en automático

Hay cinco familias de caminos. Se diferencian en **quién habla con Instagram** (nuestro sistema,
un servicio intermedio o una persona) y en **dónde se ejecuta** la publicación.

| # | Camino | ¿Automático? | Coste | Dificultad | Música | Encaja con este sistema |
|---|---|---|---|---|---|---|
| **A1** | API oficial · Facebook Login + usuario del sistema | ✅ Total | 0 € | Media (una vez) | ❌ | ✅ Ya implementado |
| **A2** | API oficial · Instagram Login (sin página de Facebook) | ✅ Total | 0 € | Media | ❌ | ✅ Ya implementado (vídeos por FTP) |
| **B** | Servicio de publicación con API (Upload-Post, Ayrshare…) | ✅ Total | 16–600 $/mes | Baja | ❌ | 🟡 Requiere un adaptador pequeño |
| **C** | Automatizador sin código (Make, n8n, Zapier) | ✅ Total | 0–30 €/mes | Media | ❌ | 🟡 Exportar a Drive + escenario |
| **D** | Programadores visuales (Meta Business Suite, app de Instagram, Metricool…) | 🟡 Se sube a mano una vez; se publica solo | 0–30 €/mes | Muy baja | ✅ En la app | ✅ Con los MP4 de `output/` |

**Recomendación:** **A1** como camino principal (gratis, oficial, sin token que caduque y sin alojar
vídeos) y **D** (programar en la propia app de Instagram) para los carruseles que necesiten música.

---

## A · API oficial de Meta (lo que ya hace este sistema)

Nuestro publicador habla directamente con Instagram. Es el camino más fiable y no depende de
terceros. Detalle técnico completo en [08-automatizacion.md](08-automatizacion.md).

### A1 · Facebook Login for Business + token de usuario del sistema ★ recomendado

**Requisitos**
- @aptorrescusa como cuenta **profesional** (Creador o Empresa).
- Una **página de Facebook** vinculada a la cuenta (Meta Business Suite → Configuración → Cuentas).
- Un **portfolio empresarial** en Meta Business Suite (gratis).

**Pasos**
1. developers.facebook.com → *Crear app* → tipo **Empresa** → asociarla al portfolio empresarial.
2. Añadir el producto **Instagram** con *Facebook Login for Business*.
3. Meta Business Suite → *Configuración del negocio* → *Usuarios del sistema* → crear uno (rol Admin),
   asignarle la app, la página y la cuenta de Instagram.
4. *Generar token* con los permisos `instagram_basic`, `instagram_content_publish`,
   `instagram_manage_insights`, `instagram_manage_comments`, `pages_show_list`,
   `pages_read_engagement` y `business_management`. **Este token no caduca.**
5. Sacar el `IG_USER_ID` en el Graph API Explorer: `GET /me/accounts?fields=instagram_business_account`.
6. En GitHub, guardar los secretos `IG_USER_ID` e `IG_ACCESS_TOKEN` (no hace falta ninguna variable).

**Ventajas:** gratis; los vídeos se suben directamente (sin alojarlos en ningún sitio); token permanente;
métricas y primer comentario incluidos. La app puede quedarse en modo desarrollo: no requiere revisión de Meta.
**Inconvenientes:** hay que crear la página de Facebook si no existe; la configuración inicial lleva una tarde.

### A2 · Instagram Login (sin página de Facebook)

**Requisitos:** cuenta profesional. No necesita página de Facebook.

**Pasos**
1. developers.facebook.com → app tipo **Empresa** → producto **Instagram** con *Instagram Login*.
2. Añadir @aptorrescusa como **Instagram tester** de la app y aceptarlo desde la app de Instagram.
3. Generar el token desde el panel de la app (*Generate token*) con `instagram_business_basic`,
   `instagram_business_content_publish`, `instagram_business_manage_insights` e
   `instagram_business_manage_comments`. Dura **60 días**.
4. Configurar en GitHub:
   - Secretos `IG_USER_ID` e `IG_ACCESS_TOKEN`; variable `IG_LOGIN=instagram`.
   - **Alojamiento de los vídeos**: con este login Instagram tiene que descargarlos de una URL pública.
     Lo más sencillo es el propio alojamiento de aptorrescusa.com por FTP: variables `IG_MEDIA_MODE=url`,
     `MEDIA_BASE_URL` (p. ej. `https://aptorrescusa.com/ig-media`) y `MEDIA_FTP_DIR`; secretos
     `MEDIA_FTP_HOST`, `MEDIA_FTP_USER` y `MEDIA_FTP_PASSWORD`.
   - **Renovación automática del token**: secreto `GH_SECRETS_TOKEN` (token de GitHub *fine-grained*
     con permiso *Secrets: Read and write* sobre el repositorio). El workflow «Instagram · renovar token»
     lo renueva los días 1 y 15 de cada mes.

**Ventajas:** no necesita Facebook. **Inconvenientes:** hay que alojar los vídeos y mantener la
renovación del token (si pasan 60 días sin renovar, hay que volver a autorizar).

### Dónde se ejecuta el publicador (para A1 y A2)

| Opción | Cómo | Pros | Contras |
|---|---|---|---|
| **GitHub Actions** ★ | Ya configurado (`.github/workflows/`) | Gratis, siempre encendido, deja registro | Retraso de unos minutos |
| **Ordenador de Ángel** | Tarea programada (Windows: Programador de tareas; Mac: `launchd`) que ejecute `npm run publicar` cada 30 min | Control total | El ordenador tiene que estar encendido |
| **Servidor propio (VPS)** | `cron` con `npm run publicar` | Puntual | Coste y mantenimiento. El alojamiento compartido de la web no sirve: no puede ejecutar Chromium |

---

## B · Servicio de publicación con API (intermediario)

Un servicio que ya tiene su app aprobada por Meta: se conecta @aptorrescusa con un clic (OAuth) y
nuestro sistema le envía los MP4, el caption y la fecha por su API. Ellos guardan los tokens y programan.

| Servicio | Precio orientativo | Notas |
|---|---|---|
| **Upload-Post** | Gratis 10 subidas/mes; desde ~16–24 $/mes | El más barato; API sencilla |
| **Ayrshare** | Desde ~149 $/mes | La API más completa |
| **Postproxy** | Por uso | API orientada a desarrolladores |
| **Publer** | Plan Business | La API solo está en el plan alto |

**Qué cambiaría aquí:** un adaptador en `scripts/publicar.mjs` que llame a la API del servicio en lugar de a
la de Meta (unas 50 líneas). El resto (agentes, aprobación, calendario) sigue igual.
**Ventajas:** nada de apps de Meta ni tokens. **Inconvenientes:** cuota mensual, dependencia de un tercero
que ve las publicaciones y el acceso a la cuenta, y los mismos límites de la API (10 diapositivas, sin música).

---

## C · Automatizadores sin código

| Herramienta | Cómo | Estado |
|---|---|---|
| **Make** | Módulo *Instagram for Business → Create a carousel post* (fotos y vídeos, con Facebook Login). Escenario: una hoja de Google con fechas + carpeta de Drive con los MP4 → publica a la hora | ✅ Funciona; hay quejas de inestabilidad con carruseles |
| **n8n** | Nodos HTTP contra la API de Meta (mismo flujo que A) | ✅ Si ya se usa n8n; si no, A es más directo |
| **Zapier** | Integración de Instagram for Business | ⚠️ No consta que admita carruseles de vídeo |

**Qué cambiaría aquí:** exportar `output/<slug>/` a una carpeta de Google Drive con enlaces públicos y una
fila por publicación en una hoja (fecha, slug, caption). La aprobación sería marcar la fila.
**Ventajas:** visual, sin código. **Inconvenientes:** necesita igualmente la app de Meta (Make la gestiona),
otro servicio más y peor control de errores y duplicados que A.

---

## D · Programadores visuales (semi-automático)

Una persona sube los MP4 de `output/<slug>/` y el texto de `caption.md` una vez; la herramienta lo publica
sola a la hora elegida.

| Herramienta | Precio | Notas |
|---|---|---|
| **App de Instagram** (*Configuración avanzada → Programar*) | Gratis | Admite **música** de la biblioteca. Algunos ajustes extra pueden impedir programar: si avisa, quitar el extra, programar y añadirlo después |
| **Meta Business Suite** (planificador) | Gratis | Oficial, desde ordenador; programa carruseles de foto y vídeo |
| **Metricool** | Gratis / desde ~20 €/mes | Carruseles hasta 10 elementos, vídeos de 3–60 s; buen calendario |
| **Later, Buffer, Hootsuite, Planoly** | De pago | Similares; revisar que publiquen carruseles de vídeo de forma automática y no solo con aviso al móvil |

**Encaja así:** los agentes preparan y la persona aprueba igual que ahora; en lugar del publicador
automático, la persona sube el carrusel a la herramienta. Es el camino para los carruseles **con música**
o de **más de 10 diapositivas**.

---

## E · ¿Y Claude?

- **Preparar** (agentes, plan, carruseles, revisión, informes): sí. Se puede programar una tarea semanal de
  Claude que ejecute la skill `semana-instagram` y abra el PR.
- **Publicar**: técnicamente podría ejecutar `npm run publicar`, pero no es recomendable: la publicación
  tiene que ser puntual y repetible, y eso lo hace mejor GitHub Actions. Además, el entorno de Claude
  necesitaría permiso de red para Meta y los secretos de la cuenta.
- No hay un conector de Instagram en el directorio de conectores de Claude (octubre 2026).

---

## Qué necesitamos saber para elegir

1. ¿@aptorrescusa ya es cuenta **profesional**? ¿Está vinculada a una **página de Facebook**?
2. ¿Quién administra Meta Business Suite (Ángel u otra persona)?
3. ¿Cuántos carruseles necesitan **música**?
4. ¿Preferís **cero coste** (A) o **cero configuración técnica** (B o D)?

## Fuentes

- [Meta · Publish Content using the Instagram Platform](https://developers.facebook.com/docs/instagram-platform/content-publishing/)
- [Meta · Refresh Access Token (Instagram Login)](https://developers.facebook.com/documentation/instagram-platform/reference/refresh_access_token)
- [Best Social Media Posting and Scheduling APIs (Ayrshare)](https://www.ayrshare.com/blog/best-social-media-posting-and-scheduling-apis/)
- [The 8 Best Social Media APIs in 2026 (Upload-Post)](https://www.upload-post.com/best-social-media-apis/)
- [Best Social Media Scheduling APIs for Developers (Blotato)](https://www.blotato.com/blog/best-social-media-scheduling-apis)
- [Make · Instagram for Business](https://www.make.com/en/integrations/zapier/instagram-business)
- [Metricool · Schedule an Instagram carousel](https://metricool.com/schedule-instagram-carousel/)
- [Metricool · Schedule and post on Instagram](https://help.metricool.com/schedule-and-post-on-instagram-6b6q5)
- [How to Schedule Posts on Instagram 2026 (PCTechMag)](https://pctechmag.com/2026/05/how-to-schedule-posts-on-instagram-2026-the-complete-guide-for-creators-brands-agencies/)
- [Buffer status · Instagram carousel incident](https://status.buffer.com/incidents/01JAQXSPY51FGHRTFW63AC91A6)
