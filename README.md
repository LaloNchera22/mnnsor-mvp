# mnnsor

Documentación de obra asistida por IA. El ingeniero de construcción escribe
notas crudas de campo (o sube su propio formato) y mnnsor le devuelve el
documento formal, en el formato que entrega, listo para firmar.

**v1 — arranque: Bajío / Querétaro.** Comprador que paga: la constructora / la
residencia.

## Stack

- **Next.js (App Router) + TypeScript** — frontend y backend, desplegado en Vercel.
- **Tailwind CSS** — sistema de diseño industrial (charcoal / concreto / papel / ámbar, IBM Plex).
- **Supabase** — Postgres + Auth + Storage, con RLS por organización.
- **Stripe** — Checkout, Customer Portal y webhooks.
- **Anthropic API (Claude)** — los agentes, siempre desde el servidor.

## Estado del build

Se construye por fases (ver la especificación de producto, §9). Cada fase debe
compilar, correr y ser probable antes de pasar a la siguiente.

- [x] **Fase 1 — Scaffold + sistema de diseño + home**
  - Next.js + TS + Tailwind, tokens de diseño mnnsor (IBM Plex Sans/Mono).
  - Clientes de Supabase (navegador + servidor) listos para Fase 2.
  - Catálogo de los 7 agentes como configuración compartida.
  - Home / dashboard: barra con selector de obra y estado de plan, grid de
    agentes, actividad reciente. Datos aún son placeholders.
- [ ] Fase 2 — Auth + multi-tenant (login email/Google, organización, RLS).
- [ ] Fase 3 — Obras + motor del agente Bitácora end-to-end + biblioteca.
- [ ] Fase 4 — Función estrella: subir formato → llenarlo preservando formato.
- [ ] Fase 5 — Los otros 6 agentes por configuración.
- [ ] Fase 6 — Facturación (Stripe).
- [ ] Fase 7 — Analítica (`usage_events`).
- [ ] Fase 8 — Pulido.

## Correr en local

```bash
npm install
cp .env.example .env.local   # llenar las variables (ver abajo)
npm run dev                  # http://localhost:3000
```

En Fase 1 la home renderiza sin variables de entorno. Se vuelven necesarias a
partir de Fase 2 (Supabase Auth).

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
