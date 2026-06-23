# Mind2Matter — MVP

Practice management & client/matter CRM for solo and small law firms.
Next.js (App Router) + TypeScript + Tailwind. Theme: light blue → space purple.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
```

That's the whole setup — no database to provision. The app ships with seed
data (a firm, three users, leads, two live matters, time entries, deadlines,
and one part-paid invoice) so every screen has something real in it.

```bash
npm run build && npm start   # production build
```

## What's built (the MVP spine)

The end-to-end flow from the spec, working live:

**Lead → (signature) → Client + Matter → time / charges → invoice → portal**

- **Dashboard** (Section 11) — live, query-only view: pending leads, overdue
  deadlines, overdue invoices, retainer gaps, and quiet matters.
- **Leads** (1.1, 2) — pipeline with conflict-check flags; "Sign & open matter"
  fires the conversion (1.3) that creates the Client, the Matter, and grants
  portal access in one atomic step.
- **Matter detail** (1.4–1.7) — the centerpiece:
  - **Summary block** that recomputes itself from the timeline (1.7) — never
    hand-maintained.
  - **Immutable timeline** (1.6) — append-only; edits add entries, never
    overwrite.
  - **Time entries** (6.2) with the two-field split — Client-Facing Description
    vs. firm-only Internal Note — and automatic **rate resolution** (6.1):
    matter override → practice-area rate → attorney default, frozen at entry.
  - **Billing** (6.4) — generate a draft from unbilled work, then send (lock) it.
  - **Notes** (4) — tagged, immutable.
- **Client portal** (7) — scoped read view; hides Draft invoices and internal
  notes; pays via a Stripe **stub**.

## Architecture

```
src/
  app/                 pages (client components calling the API)
    api/               REST route handlers  ← the API layer
  lib/
    types.ts           domain model
    store.ts           in-memory store + ALL domain logic + seed
    format.ts          money/date helpers
    api.ts             typed fetch client
  components/          Sidebar, shared UI
```

The data layer is a single module (`src/lib/store.ts`) holding a typed
in-memory store kept on `globalThis`. Nothing outside that file touches data
directly, so swapping to a real database is a one-file change. Data resets when
the server process restarts — fine for an MVP/demo.

## API surface

| Method | Route | Purpose |
|--------|-------|---------|
| GET  | `/api/dashboard` | live firm aggregations |
| GET  | `/api/leads` | list leads |
| PATCH| `/api/leads/:id` | update lead status |
| POST | `/api/leads/:id/convert` | signature event → Client + Matter |
| GET  | `/api/clients` | list clients |
| GET  | `/api/matters` | list matters |
| GET  | `/api/matters/:id` | matter + summary + timeline + notes + time + invoices |
| POST | `/api/matters/:id/notes` | add an immutable note |
| GET/POST | `/api/time-entries` | list / log time (auto rate + amount) |
| POST | `/api/fixed-charges` | add a fixed charge |
| GET  | `/api/invoices` | list invoices |
| POST | `/api/invoices/generate` | draft from unbilled work in range |
| POST | `/api/invoices/:id/finalize` | lock + send |
| POST | `/api/esign/send` | **stub** — signing link |
| POST | `/api/payments/checkout` | **stub** — Stripe payment |

## Stubbed for the MVP (clean interfaces, ready to wire)

- **Auth** — single hard-coded firm user. Swap for NextAuth/Clerk; gate routes by role (9.1).
- **E-signature** (8) — `/api/esign/send` returns a fake link. In production the
  provider's completion webhook calls `/api/leads/:id/convert`.
- **Payments** (7.3) — `/api/payments/checkout` records immediately. Replace with
  Stripe Checkout + webhook.
- **Documents** (5), **messaging** (7.2), **audit log** (10) — modeled in the
  domain but not yet surfaced in UI.

## Production roadmap (recommended order)

1. **Persistence** — Prisma + Postgres (e.g. Neon/Supabase on Vercel). Port the
   functions in `store.ts`; types already match.
2. **Auth + roles** — NextAuth, firm/user scoping, matter-level access (9.1).
3. **Stripe + e-signature** — real providers + webhooks.
4. **Documents + messaging + audit log** — storage (S3/Blob), portal threads, append-only log.

## Deploy

Push to GitHub and import on **Vercel** — zero config for the current in-memory
build. Add `DATABASE_URL` and provider keys as you wire in step 1+.
