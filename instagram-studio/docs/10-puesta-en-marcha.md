# 10 · Puesta en marcha (camino A2: Instagram Login, sin Facebook)

Lista para hacer **una sola vez**, delante del ordenador. Unos 45 minutos.
Al terminar, los carruseles aprobados se publicarán solos en @aptorrescusa, con música y sin coste.

**Necesitas a mano:**
- El acceso a la cuenta de Instagram @aptorrescusa.
- El panel del alojamiento de aptorrescusa.com, para crear un acceso FTP.
- Una cuenta de GitHub con acceso de administración a `auritoledo/aptorrescusa-web`.

---

## ☐ 0 · Activar el sistema en GitHub (2 min)
1. GitHub → *Pull requests* → **#1 Instagram Studio** → *Ready for review* → **Merge**.
   Las tareas automáticas solo funcionan cuando el sistema está en la rama `main`.
2. *Settings → Actions → General → Workflow permissions* → **Read and write permissions** → *Save*.

## ☐ 1 · Instagram (2 min)
En la app de Instagram, con @aptorrescusa:
- Comprueba que es **cuenta profesional** (Creador o Empresa). Ya lo es.
- *Configuración → Privacidad de la cuenta* → la cuenta tiene que ser **pública** (la API no funciona con cuentas privadas).

## ☐ 2 · Cuenta de desarrollador de Meta (5 min)
1. Entra en **developers.facebook.com** → *Empezar*.
2. Meta pide identificarse con una cuenta personal de Meta para darse de alta como desarrollador.
   Es solo el acceso al panel de desarrollo: **no se crea ninguna página ni se publica nada en Facebook**.
3. Verifica el correo o el teléfono cuando te lo pida.

## ☐ 3 · Crear la app (5 min)
1. *Mis apps* → **Crear app**.
2. Caso de uso: **Gestionar mensajes y contenido de Instagram** (o el equivalente que muestre Meta).
3. Nombre: `Instagram Studio AP Torrescusa`. Tipo: **Empresa**. Crear.
4. La app se queda en **modo desarrollo**: así funciona para vuestra propia cuenta, sin revisión de Meta.

## ☐ 4 · Conectar @aptorrescusa y sacar el token (10 min)
1. En el panel de la app → **Instagram** → *Configuración de la API con inicio de sesión de Instagram*.
2. Si lo pide: *Roles de la app → Roles → Añadir personas → Tester de Instagram* → `aptorrescusa`.
   Después, en la app de Instagram: *Configuración → Apps y sitios web → Invitaciones de tester* → **Aceptar**.
3. *Generar tokens de acceso* → **Añadir cuenta** → inicia sesión con @aptorrescusa → acepta los permisos:
   `instagram_business_basic`, `instagram_business_content_publish`,
   `instagram_business_manage_comments`, `instagram_business_manage_insights`.
4. Copia y guarda temporalmente:
   - el **token de acceso** (largo, empieza por `IG…`; dura 60 días y el sistema lo renovará solo);
   - el **ID de la cuenta** de Instagram (el número que aparece junto a @aptorrescusa).

## ☐ 5 · Alojamiento para los vídeos (10 min)
Con Instagram Login, Instagram descarga los vídeos de una dirección web. Usaremos el alojamiento
de aptorrescusa.com: el sistema los sube justo antes de publicar y **los borra en cuanto se publican**.

1. En el panel del alojamiento (por ejemplo, Hostinger: *Archivos → Cuentas FTP*):
   - Crea una cuenta FTP nueva o usa la principal. Apunta **servidor**, **usuario** y **contraseña**.
2. Con el administrador de archivos, crea la carpeta **`ig-media`** dentro de `public_html`.
3. Datos que vas a necesitar:
   - `MEDIA_BASE_URL` = `https://aptorrescusa.com/ig-media`
   - `MEDIA_FTP_DIR` = `/public_html/ig-media` (si la cuenta FTP ya empieza dentro de `public_html`, entonces `/ig-media`).
     La comprobación del paso 7 dice si está bien.

## ☐ 6 · Guardar las claves en GitHub (10 min)
GitHub → repositorio → *Settings → Secrets and variables → Actions*.

**Pestaña *Secrets*** → *New repository secret*:

| Nombre | Valor |
|---|---|
| `IG_USER_ID` | ID de la cuenta (paso 4) |
| `IG_ACCESS_TOKEN` | Token (paso 4) |
| `MEDIA_FTP_HOST` | Servidor FTP (paso 5) |
| `MEDIA_FTP_USER` | Usuario FTP |
| `MEDIA_FTP_PASSWORD` | Contraseña FTP |
| `GH_SECRETS_TOKEN` | Token de GitHub para renovar el de Instagram (ver abajo) |

**Pestaña *Variables*** → *New repository variable*:

| Nombre | Valor |
|---|---|
| `MEDIA_BASE_URL` | `https://aptorrescusa.com/ig-media` |
| `MEDIA_FTP_DIR` | `/public_html/ig-media` |

**Cómo crear `GH_SECRETS_TOKEN`:** github.com → foto de perfil → *Settings → Developer settings →
Personal access tokens → Fine-grained tokens → Generate new token*:
- *Repository access*: solo `auritoledo/aptorrescusa-web`.
- *Permissions → Repository → Secrets*: **Read and write**.
- Caducidad: 1 año. Apunta en el calendario renovarlo dentro de 11 meses.

## ☐ 7 · Comprobar (2 min)
GitHub → *Actions* → **Instagram · comprobar conexión** → *Run workflow*.
Tiene que salir todo con ✓: cuenta @aptorrescusa, cuota de publicación, FTP y URL pública.

| Si sale… | Haz esto |
|---|---|
| `code 190` | El token está mal copiado o ha caducado: repite el paso 4 |
| `La cuenta conectada es @…` | Se conectó otra cuenta en el paso 4 |
| Error de FTP con TLS/SSL | Añade la variable `MEDIA_FTP_SECURE` = `0` |
| `El archivo subido no se ve en…` | `MEDIA_FTP_DIR` no corresponde a `MEDIA_BASE_URL`: prueba con `/ig-media` |

## ☐ 8 · Música (cuando la tengáis)
1. Copia las canciones (MP3) a `instagram-studio/brand/musica/`.
2. Apunta cada una en `brand/musica/LICENCIAS.md` (título, autor, fuente, licencia).
   Lo ideal es **música propia**; si no, libre de derechos con licencia para redes. Nunca canciones comerciales.
3. En cada `carousel.json`: `"musica": { "archivo": "brand/musica/cancion.mp3", "inicio": 0, "volumen": 0.9 }`.
   O pídeselo a Claude: *«Pon esta canción en el carrusel del Fénix empezando en el segundo 20»*.

## ☐ 9 · Primera publicación real
1. GitHub → *Actions* → **Instagram · aprobar o cancelar** → *Run workflow*:
   carrusel `2026-10-20-fenix-fases-del-renacimiento`, acción `aprobar`
   (en *fecha* puedes poner otra, p. ej. dentro de una hora para probar: `2026-10-16 19:30`).
2. A la hora indicada, *Actions* → **Instagram · publicar carruseles programados** se ejecutará solo.
   Al terminar, el enlace a la publicación queda en `carousels/<slug>/publicacion.json`.

---

## Después, el día a día
- **Preparar:** en Claude Code, *«Prepara las publicaciones del próximo mes»* → los agentes abren un PR.
- **Revisar y fusionar** el PR.
- **Aprobar** cada carrusel (paso 9). Desde el móvil también se puede, con la app de GitHub.
- Todo lo demás es automático: publicación, primer comentario, renovación del token y métricas.
