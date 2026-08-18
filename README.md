# mnnsor

Documentación de obra asistida por IA. El ingeniero de construcción escribe
notas crudas de campo (o sube su propio formato) y mnnsor le devuelve el
documento formal, en el formato que entrega, listo para firmar.

**v1 — arranque: Bajío / Querétaro.** Comprador que paga: la constructora / la
residencia.

## Stack

- **Next.js (App Router) + TypeScript** — frontend y backend, desplegado en Vercel.
- **Tailwind CSS** — sistema de diseño industrial **estrictamente monocromo**
  (tinta sobre papel, IBM Plex), con tema claro/oscuro por variables CSS y la
  clase `.dark`. La marca (isotipo + wordmark) se sirve desde `/public/brand`
  en variante negra o blanca según el tema.
- **Supabase** — Postgres + Auth + Storage, con RLS por organización.
- **Stripe** — Checkout, Customer Portal y webhooks.
- **Anthropic API (Claude)** — los agentes, siempre desde el servidor.

## Estado del build

Se construye por fases (ver la especificación de producto, §9). Cada fase debe
compilar, correr y ser probable antes de pasar a la siguiente.

- [x] **Fase 1 — Scaffold + sistema de diseño + producto navegable**
  - Next.js + TS + Tailwind, tokens de diseño mnnsor monocromo (IBM Plex),
    tema claro/oscuro/sistema sin parpadeo.
  - Clientes de Supabase (navegador + servidor) listos para Fase 2.
  - Catálogo de los 7 agentes como configuración compartida.
  - **App shell** completo: sidebar con navegación y agentes, barra superior
    con selector de obra, plan/consumo, tema y menú de cuenta, paleta de
    comandos (⌘K), y drawer móvil.
  - **UI kit** reutilizable: Button, Card, Field/Input/Select/Textarea, Badge,
    Modal accesible (focus-trap), Toasts, Menu, Progress, Skeleton, EmptyState.
  - **Flujos navegables** (con store de demo en `localStorage`, listo para
    reemplazar por Supabase): dashboard con métricas, obras (CRUD), biblioteca
    de documentos con búsqueda y filtros, detalle de documento (copiar,
    descargar, firmar, eliminar), captura → generación → revisión del agente,
    ajustes (organización, apariencia, plan, datos), y login.
  - Accesibilidad: salto al contenido, foco visible, roles/ARIA, `aria-current`,
    `prefers-reduced-motion`, y estado (no solo color) para distinguir badges.
- [x] **Fase 2 — Experiencia de captura y del documento (UX)**
  - **Dictado por voz** en la captura (Web Speech API, es-MX, resultados en
    vivo): el ingeniero con casco y guantes dicta, no teclea.
  - **PWA + captura offline**: manifest instalable y service worker que cachea
    el shell; la captura persiste en el dispositivo y se sincroniza al recuperar
    señal. Aviso sobrio de “sin conexión” e invitación a instalar.
  - **Vista tipo papel/PDF** (no Markdown): hoja paginada con membrete, datos de
    obra y bloque de firmas, tal como se imprime y se firma. Botón Imprimir / PDF
    con CSS de impresión que aísla la hoja.
  - **Edición inline** de cada sección del documento + **regenerar por sección**
    (además de regenerar todo).
  - **Streaming en vivo**: el texto se revela mientras se redacta, reemplazando
    la animación falsa de pasos. El ritmo lo marcará el stream de Claude cuando
    se conecte la IA.
  - **Reporte fotográfico** con cámara/foto directa desde el móvil.
  - **Procedencia visible**: se marca qué salió de las notas y qué es estructura
    del formato, para reforzar que mnnsor no inventa datos.
  - **Onboarding de primer uso**: un primer documento guiado en vez de caer en un
    dashboard con datos de ejemplo (que quedan como opción para explorar).
- [ ] Fase 3 — Auth + multi-tenant (login email/Google, organización, RLS).
- [ ] Fase 4 — Obras + motor del agente Bitácora end-to-end + biblioteca.
- [ ] Fase 5 — Función estrella: subir formato → llenarlo preservando formato.
- [ ] Fase 6 — Los otros 6 agentes por configuración.
- [ ] Fase 7 — Facturación (Stripe).
- [ ] Fase 8 — Analítica (`usage_events`).
- [ ] Fase 9 — Pulido.

## Correr en local

```bash
npm install
cp .env.example .env.local   # llenar las variables (ver abajo)
npm run dev                  # http://localhost:3000
```

Las Fases 1–2 corren sin variables de entorno (el estado vive en el navegador,
listo para reemplazarse por Supabase). Se vuelven necesarias a partir de la
Fase 3 (Supabase Auth). En producción, **Supabase** es la base de datos y
**Vercel** el hosting.

La captura offline (PWA) sólo se activa en el build de producción: el service
worker no se registra en `next dev`. Pruébala con `npm run build && npm start`.

### Verificaciones

```bash
npm run typecheck   # tipos
npm run build       # build de producción
```

## Variables de entorno

Copia `.env.example` a `.env.local`. Las llaves de servidor
(`SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`, `STRIPE_SECRET_KEY`,
`STRIPE_WEBHOOK_SECRET`) **nunca** se exponen al cliente: solo se usan en route
handlers y Server Actions.
