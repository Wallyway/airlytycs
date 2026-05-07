# PRD: Dashboard Medico

## Summary
Dashboard Medico is an administrative web app for a medical-products distributor. It centralizes client, supplier, product, inventory, sales, and inventory movement management. The current build is a read-heavy prototype: Clientes, Proveedores, Productos, and Inventario support CRUD; Ventas and Movimientos are read-only. There is no authentication layer and mutations go directly from the browser to Supabase.

## Goals
- Provide a single operational view for catalog, inventory, and sales activity.
- Enable fast CRUD workflows for core entities (clientes, proveedores, productos, inventario).
- Surface critical-stock alerts and summarize KPIs on the dashboard.
- Keep the UI consistent with the existing layout shell (sidebar + header) and Tailwind v4 styling.

## Non-Goals
- Implement authentication/authorization or multi-tenant access control.
- Introduce API routes or server-side validation for mutations.
- Add a full test framework (none currently exists).
- Replace or redesign the overall information architecture.

## Users and Use Cases
- Admin/Operations
  - Create and update clients, suppliers, products, and inventory stock.
  - Monitor stock levels and critical-stock alerts.
  - Review sales and inventory movement history.
- Inventory Manager
  - Adjust stock levels and verify minimum thresholds.
  - Track movement records for audits.
- Sales Analyst
  - Review monthly sales totals and recent activity.

## Product Requirements

### Dashboard
- Display KPI cards for high-level metrics (inventory, sales, alerts).
- Show an inventory summary with critical-stock highlighting.
- Render a simple chart for sales trend (current SVG approach).

### Clientes (CRUD)
- List, search, and filter clients.
- Create, edit, and delete clients via dialog forms.
- Local table state updates after mutations and refresh.

### Proveedores (CRUD)
- List, search, filter, and paginate suppliers.
- Create, edit, and delete suppliers via dialog forms.

### Productos (CRUD)
- List products with inventory and pricing info.
- Create, edit, and delete products via dialog forms.
- Display inventory bars per product.

### Inventario (CRUD)
- List inventory entries and highlight critical stock.
- Edit stock levels and minimum thresholds via dialog forms.
- Show critical-stock alert banner when applicable.

### Ventas (Read-only)
- List sales records with totals and dates.
- Display monthly total and summary cards.

### Movimientos (Read-only)
- List inventory movement records and types.
- Provide summary cards.

## UX and UI Requirements
- Keep the existing shell layout: fixed 260px sidebar and top header.
- Use Tailwind v4 utilities and the current CSS variable tokens.
- Ensure pages render correctly on desktop and mobile.
- Preserve current typography choices and spacing rhythm.

## Data and Technical Requirements
- Read data in Server Components using `lib/queries/*` and `createSupabaseServerClient()`.
- Perform mutations in Client Components using `createSupabaseBrowserClient()`.
- Use `Promise.all()` for parallel data fetching in pages.
- Treat `searchParams` as a Promise in Next.js 16.
- Continue to use direct Supabase access (no API route layer).

## Success Metrics
- CRUD operations succeed without client-side errors for core modules.
- Critical stock is clearly surfaced in inventory alerts.
- Dashboard loads without data-fetch waterfalls.

## Risks and Constraints
- No authentication or RLS is a security risk; data is exposed to any user with access.
- Client-side validation only; data quality can degrade.
- Sales and Movements are read-only, limiting operational workflows.

## Open Questions
- Should Ventas and Movimientos be promoted to full CRUD in the next iteration?
- Is authentication required before moving beyond prototype?
- Do we need API routes for validation and audit logging?

## Out of Scope Future Ideas
- Add auth with role-based access and RLS policies.
- Introduce server-side validation or Zod schemas.
- Extract and reuse KPI components across pages.
