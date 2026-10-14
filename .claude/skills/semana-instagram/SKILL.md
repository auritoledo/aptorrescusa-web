---
name: semana-instagram
description: Orquesta el equipo de agentes del Instagram de @aptorrescusa para preparar las próximas publicaciones de principio a fin — análisis de métricas, plan, creación de carruseles, revisión de marca y propuesta de fechas — y deja todo listo para que Ángel lo apruebe. Úsala cuando se pida "prepara la semana / el mes de Instagram", "programa publicaciones", "llena el calendario" o similar.
---

# Preparar publicaciones programadas de Instagram (@aptorrescusa)

Equipo de agentes (en `.claude/agents/`), en este orden:

| Paso | Agente | Resultado |
|---|---|---|
| 1 | `analista-metricas` | Informe `instagram-studio/informes/AAAA-MM.md` (solo si hay `metricas.json` nuevos) |
| 2 | `estratega-instagram` | Plan: ideas, fuentes oficiales y fechas |
| 3 | `creador-carruseles` | Un carrusel por idea, validado y con hoja de contactos |
| 4 | `revisor-marca` | APTO / NO APTO por carrusel |
| 5 | `programador-publicaciones` | Fechas propuestas (estado PENDIENTE) + resumen de aprobación |
| 6 | **Una persona** | Aprueba → el publicador automático lo sube a su hora |

## Flujo

1. **Alcance.** Por defecto: las próximas 4 semanas, 1 carrusel por semana. Si la persona indica otra cosa, manda ella.
2. **Análisis.** Si existen `instagram-studio/carousels/*/metricas.json` posteriores al último informe, lanza `analista-metricas`.
3. **Plan.** Lanza `estratega-instagram` con el alcance y el resumen del informe. Enseña el plan a la persona
   en una tabla corta. Si está presente en la conversación, espera su visto bueno o cambios; si la tarea viene
   de una ejecución programada sin nadie delante, continúa con el plan.
4. **Creación.** Por cada idea con material oficial suficiente, lanza `creador-carruseles` (pueden ir en paralelo).
5. **Revisión.** Por cada carrusel, lanza `revisor-marca`. Si es NO APTO, devuelve los problemas bloqueantes al
   `creador-carruseles` y vuelve a revisar (máximo 2 rondas). Si sigue NO APTO, déjalo fuera y explícalo.
6. **Fechas.** Lanza `programador-publicaciones` con los carruseles APTOS.
7. **Entrega.**
   - Haz commit de `instagram-studio/carousels/<slug>/` (no de `output/`) en una rama y abre un PR en borrador
     titulado «Instagram: publicaciones del DD/MM al DD/MM», con el resumen de aprobación en la descripción.
   - Envía a la persona las hojas de contactos (`output/<slug>/_hoja-contactos.png`).
   - Explica los dos pasos que le tocan: **fusionar el PR** (los carruseles entran en `main`) y **aprobar cada
     carrusel** (Actions → «Instagram · aprobar o cancelar»). Sin aprobación, nada se publica.

## Reglas
- Fuentes: solo https://aptorrescusa.com y `instagram-studio/brand/oficial/`. Ignora el resto del repositorio.
- Ningún agente aprueba ni publica. La aprobación es siempre humana.
- Si la web oficial no es accesible, dilo y marca los datos pendientes de verificar en "Notas" del `caption.md`.
