# Dashboard Medico — AGENTS.md

> **Last updated:** 2026-05-03 · Reflects actual code, not aspirational design

---

## Project Overview

Administrative dashboard for a medical-products distribution company. Manages clients (hospitals, clinics, individuals), suppliers, product catalog, inventory stock levels with critical-stock alerts, sales transactions, and inventory movement audit trails. Currently a read-heavy prototype: 4 of 6 modules have full CRUD (Clientes, Proveedores, Productos, Inventario); Ventas and Movimientos are display-only. No authentication, no API routes, mutations go directly from browser to Supabase.

---

## Tech Stack

| Layer | Package | Version | Notes |
|---|---|---|---|
| Framework | `next` | **16.2.4** | App Router, Server Components default |
| UI | `react` / `react-dom` | **19.2.4** | `searchParams` is `Promise` in Next 16 |
| UI primitives | `radix-ui` | **1.4.3** | Used by shadcn components |
| UI CLI | `shadcn` | **4.4.0** | Style: `radix-nova`, CSS variables |
| Icons | `lucide-react` | **1.9.0** | |
| CSS | `tailwindcss` | **4.x** | No `tailwind.config.js`; theme in `@theme inline` in `globals.css` |
| Data | `@supabase/supabase-js` | **2.104.1** | Direct client, no API route layer |
| Data (unused) | `@supabase/ssr` | **0.10.2** | Installed but never imported — dead dependency |
| Types | `typescript` | **5.x** | Strict mode |
| Lint | `eslint` | **9.x** | + `eslint-config-next` |

Key deviations from initial spec: Next.js 16 (not 14), React 19 (not 18), Tailwind v4 (not v3), no Recharts (SVG hand-coded chart in `app/dashboard/page.tsx`).

---

## Architecture

### High-level: Hybrid Server/Client Components with direct-to-DB mutations

```
Browser
┌──────────────────────────────────────────────────────┐
│  Server Component Page (async)                       │
│    │                                                 │
│    ├── Promise.all() parallel queries                │
│    │   → lib/queries/*.ts → createSupabaseServerClient() │
│    │                                                 │
│    └── passes data as props →                        │
│         Client Component Table ("use client")        │
│           │                                          │
│           └── CRUD mutations →                       │
│                createSupabaseBrowserClient() →       │
│                supabase.from("...").insert/update/delete │
└──────────────────────────────────────────────────────┘
                              │
                              ▼
                    Supabase (Postgres)
                    RLS presumably disabled (prototype)
```

### Data access pattern

- **Reads:** Server Components call functions in `lib/queries/` which use `createSupabaseServerClient()` (`lib/supabase.ts`, guarded by `import "server-only"`). Queries are parallelized with `Promise.all()`.
- **Writes:** Client Components call `createSupabaseBrowserClient()` (`lib/supabase-browser.ts`, module-level singleton) and mutate Supabase tables directly. No API routes. No Zod validation. No server-side validation.
- **No middleware.ts**, no `app/api/` routes, no auth layer.

### Why this matters for agents

- Adding a new read-only page: create Server Component + query function in `lib/queries/`.
- Adding a new CRUD module: follow the pattern in `components/clientes/ClientesTable.tsx` — `"use client"`, dialog form, direct Supabase mutations, local state updates + `router.refresh()`.
- Never put mutation logic in `lib/queries/` — those are server-read-only.

---

## Repository Structure

```
dashboard-medico/
├── app/                          # Next.js App Router — file-based routing
│   ├── layout.tsx                # Root layout (Sidebar + Header + children)
│   ├── page.tsx                  # Redirects to /dashboard
│   ├── globals.css               # Tailwind v4 theme + CSS variables + dark mode
│   ├── dashboard/page.tsx        # KPIs, SVG chart, inventory summary, recent activity
│   ├── clientes/page.tsx         # CRUD module — 3 stat cards + ClientesTable
│   ├── proveedores/page.tsx      # CRUD module — 3 stat cards + ProveedoresTable
│   ├── productos/page.tsx        # CRUD module — stat cards + ProductosTable + inventory bars
│   ├── inventario/page.tsx       # CRUD module — stat cards + StockAlerta + InventarioTable
│   ├── ventas/page.tsx           # Read-only — stat cards + VentasTable
│   └── movimientos/page.tsx      # Read-only — stat cards + MovimientosTable
│
├── components/
│   ├── layout/                   # Persistent shell (both "use client")
│   │   ├── Sidebar.tsx           # 260px fixed left nav, 7 routes, active state via usePathname
│   │   └── Header.tsx            # Fixed top bar, dynamic title from route, non-functional search
│   ├── dashboard/
│   │   └── KpiCard.tsx           # Defined but barely used — pages build KPIs inline
│   ├── clientes/ClientesTable.tsx       # Full CRUD: search, type filter, dialog, delete
│   ├── proveedores/ProveedoresTable.tsx # Full CRUD: search, category/compliance filters, pagination (8/page)
│   ├── productos/ProductosTable.tsx     # Full CRUD: search, inventory join, hardcoded pagination UI
│   ├── inventario/
│   │   ├── InventarioTable.tsx   # Full CRUD: product selector dialog, stock edit
│   │   └── StockAlerta.tsx       # Server component, red banner when stock < minimum
│   ├── ventas/VentasTable.tsx           # Server component, read-only display
│   ├── movimientos/MovimientosTable.tsx # Server component, read-only display
│   └── ui/                       # shadcn primitives (auto-generated, do not hand-edit)
│       ├── button.tsx
│       ├── card.tsx
│       ├── table.tsx
│       ├── dialog.tsx
│       ├── input.tsx
│       ├── badge.tsx
│       └── select.tsx            # Scaffolded but never imported — dead code
│
├── lib/
│   ├── supabase.ts               # Server-only client factory (import "server-only")
│   ├── supabase-browser.ts       # Browser client singleton
│   ├── utils.ts                  # cn() = tailwind-merge + clsx
│   └── queries/                  # Server-read-only data access
│       ├── clientes.ts           # getClientes(), getClienteById()
│       ├── ventas.ts             # getVentas(), getTotalVentasMes()
│       ├── inventario.ts         # getInventario(), getStockCritico() (via RPC)
│       ├── proveedores.ts        # getProveedores()
│       ├── productos.ts          # getProductos()
│       └── movimientos.ts        # getMovimientos()
│
├── types/
│   └── index.ts                  # All TypeScript interfaces (single file, 59 lines)
│
├── public/                       # Unused default Next.js SVGs
├── .env.local                    # NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
├── components.json               # shadcn config (radix-nova style, CSS variables)
├── next.config.ts                # Empty default config
├── tsconfig.json                 # Strict, ES2017 target, @/* alias
├── postcss.config.mjs            # @tailwindcss/postcss v4
└── eslint.config.mjs             # Flat config, eslint-config-next
```

### Why this structure exists

- **Feature-based component grouping** (`clientes/`, `proveedores/`, etc.) keeps related code co-located. Scales well as modules grow.
- **Single `types/index.ts`** is acceptable at current scale (~3,500 lines total). Split when file exceeds ~150 lines or types are referenced from >10 files.
- **No `[id]` detail routes** despite being in the initial spec. `getClienteById()` exists but is unconsumed.
- **No `orden_proveedor` module** — table exists in DB schema but has zero code support. Dashboard KPI "ORDENES PENDIENTES" is hardcoded to `0`.

---

## Key Commands

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with HMR on default port |
| `npm run build` | Production build (compiles + type-checks + optimizes) |
| `npm run start` | Run production server |
| `npm run lint` | ESLint across all files |

**No test framework** — no Jest, Vitest, Playwright, or `*.test.*` files exist.
**No test script** in `package.json`.

### Deployment

No deployment config files (`vercel.json`, `Dockerfile`, etc.). `.gitignore` includes `.vercel/`, suggesting Vercel was considered. Required env vars at deploy time:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

---

## Coding Standards & Conventions

Derived from existing code, not aspirational.

### Naming
- **Files:** PascalCase for components (`ClientesTable.tsx`), camelCase for utilities/lib files (`supabase-browser.ts`)
- **Functions:** camelCase, Spanish naming when domain-specific (`getClientes`, `getStockCritico`, `getSerieVentas`)
- **Types/Interfaces:** PascalCase, suffixed with `Props` for component props, `State` for form state
- **DB columns:** snake_case, preserved verbatim in TypeScript interfaces (`nombre_empresa`, `stock_disponible`)

### Component patterns
- **Page components:** Default export async functions, Server Components by default. Type `searchParams` as `Promise<{ ... }>`.
- **Table components with CRUD:** `"use client"` directive, receive initial data as props, maintain local `rows` state with `useState`, sync via `useEffect` when props change.
- **Table components read-only:** No `"use client"`, pure render from props.
- **Dialog-driven forms:** Single dialog toggled between create/edit mode via `dialogMode` state. Form state in typed `*FormState` interface.
- **KPI stat cards:** Built inline in pages (not using `KpiCard` component). 3-column grid on most pages, 4-column on dashboard.

### Data patterns
- **Server queries:** Each function in `lib/queries/` creates its own client via `await createSupabaseServerClient()`. Throws on error. Returns empty array on null data.
- **Browser mutations:** Call `createSupabaseBrowserClient()`, use `.insert()` / `.update()` / `.delete()`, chain `.select("*").single()` to get result. Update local state, call `router.refresh()`.
- **Parallel queries:** Pages use `Promise.all([...])` to avoid waterfalls.
- **Null handling:** Consistent `??` coalescing, `?? "-"` for display fallbacks.

### CSS conventions
- **Tailwind v4** with `@theme inline` in `globals.css`. No config file.
- **Design tokens:** CSS variables follow shadcn convention (`--background`, `--foreground`, etc.) with oklch values.
- **Font classes:** `font-heading` (Manrope), `font-sans` (Inter), `font-mono` (Geist Mono).
- **Mixed class usage:** Pages inconsistently use:
  - Standard Tailwind (`text-slate-900`, `bg-white`) — dashboard page
  - Custom token classes (`text-on-surface`, `text-h1`, `font-h1`, `text-data-display`, `bg-primary-container/10`) — clientes, proveedores, inventario pages
  - The custom token classes (`text-h1`, `text-on-surface`, etc.) are **not defined** in `globals.css` and will not render as intended unless provided by `shadcn/tailwind.css` import.
- **Sidebar width:** 260px. Dashboard page uses `ml-64` (256px) — 4px misalignment. All other pages use `ml-[260px]`.

### TypeScript
- Strict mode enabled.
- All interfaces in single `types/index.ts`.
- `DashboardKPIs` interface defined but never imported.
- `Proveedor` and `Producto` interfaces missing `created_at` field (exists in DB schema).
- `OrdenProveedor` interface does not exist.

---

## Operational Guidelines for Agents

### Where to make changes

| Task | Location |
|---|---|
| Add new page/route | `app/<module>/page.tsx` (Server Component) |
| Add query | `lib/queries/<module>.ts` (server-read-only) |
| Add CRUD table | `components/<module>/<Module>Table.tsx` ("use client") |
| Add read-only table | `components/<module>/<Module>Table.tsx` (Server Component) |
| Add type | `types/index.ts` |
| Add shadcn component | `npx shadcn@latest add <component>` |
| Change layout shell | `components/layout/Sidebar.tsx` or `Header.tsx` |
| Change theme/tokens | `app/globals.css` |

### What to avoid touching

- **`components/ui/`** — auto-generated by shadcn CLI. Do not hand-edit unless adding variants.
- **`lib/supabase.ts`** and **`lib/supabase-browser.ts`** — client factories. Only modify if changing auth strategy or Supabase config.
- **`app/layout.tsx`** — root layout. Changes here affect all routes.
- **`app/globals.css`** — theme tokens. Changing values affects all components.
- **`public/`** — contains unused default assets; safe to clean but not critical.

### How to safely extend the system

**Adding a new CRUD module (e.g., OrdenesProveedor):**

1. Create `lib/queries/ordenes.ts` with `getOrdenes()`, following the pattern: import `createSupabaseServerClient`, call supabase, throw on error, return `data ?? []`.
2. Create `app/ordenes/page.tsx` as async Server Component: fetch data with `Promise.all()`, render stat cards + table component.
3. Add route to `Sidebar.tsx` navItems array.
4. Create `components/ordenes/OrdenesTable.tsx` as `"use client"` component:
   - Accept `ordenes` as props, copy to local `rows` state
   - Sync with `useEffect(() => setRows(ordenes), [ordenes])`
   - Dialog with typed `OrdenFormState` interface
   - `handleSubmit` calls `createSupabaseBrowserClient()`, `.insert()` / `.update()`, `.select("*").single()`
   - Update local state, `router.refresh()`, close dialog
5. Add `OrdenProveedor` interface to `types/index.ts`.

**Adding CRUD to existing read-only module (Ventas or Movimientos):**
- Convert table component from Server Component to Client Component
- Follow the `ClientesTable.tsx` pattern exactly
- Add `?nuevo=1` searchParam handling in page (already present, wired to `openCreateInitially`)

### Common pitfalls

1. **`searchParams` is a `Promise`** in Next.js 16. Always `await searchParams` before accessing properties. Pattern: `const params = searchParams ? await searchParams : undefined`.
2. **Dashboard uses `ml-64` (256px)**, all other pages use `ml-[260px]`. If fixing alignment, change dashboard to `ml-[260px]`.
3. **Custom token classes** (`text-h1`, `text-on-surface`, `text-data-display`, etc.) are used in module pages but **not defined** in `globals.css`. They may not render correctly. Prefer standard Tailwind classes (`text-3xl`, `text-slate-900`) unless you first define the tokens.
4. **Browser client is a singleton** (`lib/supabase-browser.ts`). Module-level `let browserClient` can become stale during HMR. If mutation issues appear during dev, consider removing the singleton.
5. **`@supabase/ssr` is installed but unused.** Do not import it — the server client uses plain `@supabase/supabase-js`. If migrating to SSR pattern, this needs coordinated changes.
6. **Mutations have no server validation.** Any form validation is client-side only (`if (!field.trim())`). Add server-side checks if security requirements increase.
7. **ProductosTable pagination is hardcoded decoration.** The Prev/Next buttons are always disabled and only page 1 shows. Do not rely on this pattern for new modules.
8. **KpiCard component exists but is ignored.** Pages build KPI cards inline. Either refactor pages to use KpiCard or delete the component.
9. **`getEstado()` is duplicated** in `app/dashboard/page.tsx` and `components/inventario/InventarioTable.tsx`. Extract to `lib/utils.ts` if modifying.
10. **No `error.tsx` or `loading.tsx`** files. If a query throws, the entire page fails with no fallback.

---

## Known Issues / Risks

### Critical

| ID | Issue | Impact | Location |
|---|---|---|---|
| H1 | No authentication or authorization. Supabase anon key exposed in browser. RLS presumably disabled. | Anyone with URL can read/write all data. | Entire app |
| H2 | Ventas and Movimientos modules are read-only. "Nueva Venta" and "Nuevo Movimiento" buttons link to pages with no creation form. | Core business operations cannot be performed. | `app/ventas/page.tsx`, `app/movimientos/page.tsx` |
| H3 | `orden_proveedor` table in DB has zero code support. Dashboard "ORDENES PENDIENTES" KPI hardcoded to `0`. | Incomplete feature set, misleading KPI. | `app/dashboard/page.tsx:266` |

### High

| ID | Issue | Impact | Location |
|---|---|---|---|
| H4 | Env var uses `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` but standard Supabase naming is `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Confusing for new developers. | Onboarding friction, potential misconfiguration. | `lib/supabase.ts:8`, `lib/supabase-browser.ts:10` |
| H5 | "AirLytics" branding in Sidebar, Header, and Dashboard welcome panel. App is "Dashboard Medico". | Branding inconsistency. | `components/layout/Sidebar.tsx:33,37,73`, `components/layout/Header.tsx:35`, `app/dashboard/page.tsx:349` |
| H6 | All mutations go directly from browser to Supabase with no server validation, no Zod schemas, no API route gate. | Security risk, data integrity risk. | All `*Table.tsx` client components |

### Medium

| ID | Issue | Impact | Location |
|---|---|---|---|
| M1 | No `error.tsx` files in `app/`. Query failures crash entire page. | Poor UX on transient failures. | All routes |
| M2 | No `loading.tsx` files. Slow queries show blank page. | Poor UX on slow connections. | All routes |
| M3 | Custom CSS token classes (`text-h1`, `text-on-surface`, etc.) used in module pages but not defined in `globals.css`. | Visual inconsistency, tokens may not render. | `app/clientes/page.tsx`, `app/proveedores/page.tsx`, `app/inventario/page.tsx`, `app/productos/page.tsx` |
| M4 | Dashboard sidebar margin `ml-64` (256px) vs actual sidebar width 260px. 4px misalignment. | Visual bug. | `app/dashboard/page.tsx:220` |
| M5 | `getEstado()` duplicated in dashboard page and InventarioTable. | Maintenance burden, risk of divergence. | `app/dashboard/page.tsx:176-184`, `components/inventario/InventarioTable.tsx:48-56` |
| M6 | `@supabase/ssr` installed but never imported. Dead dependency. | Bundle size, confusion. | `package.json:12` |
| M7 | `components/ui/select.tsx` scaffolded but never imported. Raw HTML `<select>` used everywhere. | Dead code. | `components/ui/select.tsx` |
| M8 | `KpiCard` component defined but unused. Pages build KPIs inline. | Dead code, inconsistency. | `components/dashboard/KpiCard.tsx` |
| M9 | Dashboard chart logic (~120 lines) embedded in page component. Should be extracted. | Maintainability. | `app/dashboard/page.tsx:18-148` |
| M10 | ProductosTable pagination UI is non-functional decoration. | Misleading UX. | `components/productos/ProductosTable.tsx:339-354` |
| M11 | `getLabelGrafica()` returns `label` unchanged in all branches. Dead code. | Clutter. | `app/dashboard/page.tsx:168-174` |
| M12 | `DashboardKPIs` interface defined but never used. | Dead type. | `types/index.ts:54-59` |
| M13 | Metadata in `app/layout.tsx` is default Next.js placeholder text. | Unprofessional. | `app/layout.tsx:18-21` |
| M14 | Form validation is client-side only with simple `if (!field.trim())` checks. No email format, phone format, or numeric range validation. | Data quality risk. | All CRUD table components |

### Low

| ID | Issue | Impact | Location |
|---|---|---|---|
| L1 | `public/` contains unused default Next.js SVGs (`next.svg`, `vercel.svg`, etc.). | Clutter. | `public/` |
| L2 | `VentasPage` fetches `clientes` but does not pass to `VentasTable`. Table relies on join from query. | Inconsistent data flow. | `app/ventas/page.tsx` |
| L3 | ClientesPage "Actividad Reciente" section is hardcoded to "Sin actividad reciente". | Dead UI section. | `app/clientes/page.tsx:91-93` |
| L4 | Browser client singleton can become stale during HMR. | Potential dev-time bugs. | `lib/supabase-browser.ts:3` |
