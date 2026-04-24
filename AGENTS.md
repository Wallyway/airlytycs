# 🏥 Dashboard Médico — Guía de Desarrollo (Prototipo)

> **Stack:** Next.js 14 (App Router + TypeScript) · Supabase · shadcn/ui · Tailwind CSS · Stitch (prototipado)
>
> Este documento es una guía paso a paso para construir un prototipo funcional de dashboard para una empresa que comercializa productos médicos. Cubre: clientes, proveedores, productos, ventas, inventario y movimientos.

---

## 📐 Diagrama de clases (referencia)

```
Cliente ──────────────────> Venta ──────> Producto
  id: int                    id: int        id: String
  nombre: String             fecha: Date    nombre: String
  telefono: String           total: Number  modelo: String
  email: String                             descripcion: String
  direccion: String                              │
  tipo: String                                   │
  historialVentas(): Venta[]              ┌──────┴──────┐
                                          │             │
Proveedor ─────────> OrdenProveedor    Inventario   Movimiento
  id: int              id: int           id: int      id: int
  nombreEmpresa        fecha: Date       stockDisp.   tipo: String
  contacto             estado: String    ubicacion    fecha: Date
  email                                 stockMinimo  cantidad: int
  telefono                              verificarStock(): void
  categoria
  cumplimientoCalidad
```

---

## 🗂️ Estructura de carpetas del proyecto

```
dashboard-medico/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                  ← redirige a /dashboard
│   ├── dashboard/
│   │   └── page.tsx              ← KPIs + gráfica de ventas
│   ├── clientes/
│   │   ├── page.tsx              ← tabla de clientes
│   │   └── [id]/page.tsx         ← detalle + historial
│   ├── proveedores/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   ├── productos/
│   │   └── page.tsx
│   ├── inventario/
│   │   └── page.tsx              ← con alertas de stock mínimo
│   ├── ventas/
│   │   └── page.tsx
│   └── movimientos/
│       └── page.tsx
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   └── Header.tsx
│   ├── dashboard/
│   │   ├── KpiCard.tsx
│   │   └── VentasChart.tsx
│   ├── clientes/
│   │   └── ClientesTable.tsx
│   ├── inventario/
│   │   └── StockAlerta.tsx
│   └── ui/                       ← generado por shadcn
├── lib/
│   ├── supabase.ts               ← cliente browser
│   └── queries/
│       ├── clientes.ts
│       ├── ventas.ts
│       └── inventario.ts
├── types/
│   └── index.ts                  ← interfaces TypeScript
└── .env.local
```

---

## ⚙️ Fase 0 — Setup inicial

### 1. Crear el proyecto

```bash
npx create-next-app@latest dashboard-medico \
  --typescript \
  --tailwind \
  --app \
  --src-dir=false \
  --import-alias="@/*"

cd dashboard-medico
```

### 2. Instalar dependencias

```bash
# Supabase
npm install @supabase/supabase-js @supabase/ssr

# shadcn/ui
npx shadcn@latest init
# Durante el init: Default style → Slate → CSS variables → Yes

# Componentes shadcn que usarás
npx shadcn@latest add table card badge button input dialog form select
```

### 3. Variables de entorno

Crea `.env.local` en la raíz:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5...
```

### 4. Cliente de Supabase

**`/lib/supabase.ts`**

```typescript
import { createBrowserClient } from "@supabase/ssr";

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);
```

---

## 🗄️ Fase 1 — Base de datos en Supabase

Ejecuta en orden en el **SQL Editor** de Supabase:

```sql
-- ==========================================
-- TABLAS INDEPENDIENTES (sin foreign keys)
-- ==========================================

create table clientes (
  id          serial primary key,
  nombre      text not null,
  telefono    text,
  email       text,
  direccion   text,
  tipo        text,                        -- ej: 'hospital', 'clinica', 'particular'
  created_at  timestamp default now()
);

create table proveedores (
  id                     serial primary key,
  nombre_empresa         text not null,
  contacto               text,
  email                  text,
  telefono               text,
  categoria              text,
  cumplimiento_calidad   text,             -- ej: 'alto', 'medio', 'bajo'
  created_at             timestamp default now()
);

create table productos (
  id           text primary key,           -- ej: 'PROD-001'
  nombre       text not null,
  modelo       text,
  descripcion  text,
  created_at   timestamp default now()
);

-- ==========================================
-- TABLAS DEPENDIENTES (con foreign keys)
-- ==========================================

create table ventas (
  id          serial primary key,
  fecha       date not null default current_date,
  total       numeric(10,2) not null,
  cliente_id  int references clientes(id) on delete set null,
  created_at  timestamp default now()
);

create table orden_proveedor (
  id            serial primary key,
  fecha         date not null default current_date,
  estado        text default 'pendiente',  -- 'pendiente', 'aprobada', 'entregada'
  proveedor_id  int references proveedores(id) on delete set null,
  producto_id   text references productos(id) on delete set null,
  created_at    timestamp default now()
);

create table inventario (
  id                serial primary key,
  stock_disponible  int not null default 0,
  ubicacion         text,
  stock_minimo      int not null default 5,
  producto_id       text references productos(id) on delete cascade,
  updated_at        timestamp default now()
);

create table movimientos (
  id           serial primary key,
  tipo         text not null,              -- 'entrada', 'salida', 'ajuste'
  fecha        date not null default current_date,
  cantidad     int not null,
  producto_id  text references productos(id) on delete set null,
  created_at   timestamp default now()
);

-- ==========================================
-- FUNCIÓN: verificar stock crítico
-- ==========================================

create or replace function productos_stock_critico()
returns table (
  producto_id   text,
  nombre        text,
  stock_actual  int,
  stock_minimo  int
) language sql as $$
  select p.id, p.nombre, i.stock_disponible, i.stock_minimo
  from inventario i
  join productos p on p.id = i.producto_id
  where i.stock_disponible < i.stock_minimo;
$$;

-- ==========================================
-- DATOS DE PRUEBA
-- ==========================================

insert into clientes (nombre, telefono, email, tipo) values
  ('Clínica San Rafael', '3001234567', 'compras@sanrafael.com', 'clinica'),
  ('Hospital Central', '3117654321', 'admin@hospitalcentral.co', 'hospital'),
  ('Dr. Andrés Mora', '3209876543', 'andres.mora@gmail.com', 'particular');

insert into proveedores (nombre_empresa, contacto, email, categoria, cumplimiento_calidad) values
  ('MedSupply S.A.', 'Laura Gómez', 'laura@medsupply.com', 'insumos', 'alto'),
  ('BioEquipos Ltda.', 'Carlos Ruiz', 'carlos@bioequipos.co', 'equipos', 'medio');

insert into productos (id, nombre, modelo, descripcion) values
  ('PROD-001', 'Tensiómetro Digital', 'TD-2000', 'Tensiómetro de brazo con pantalla LCD'),
  ('PROD-002', 'Glucómetro', 'GL-500', 'Medidor de glucosa en sangre'),
  ('PROD-003', 'Oxímetro de pulso', 'OX-100', 'Medidor de saturación de oxígeno');

insert into inventario (stock_disponible, ubicacion, stock_minimo, producto_id) values
  (25, 'Bodega A', 10, 'PROD-001'),
  (3,  'Bodega A', 10, 'PROD-002'),  -- ← stock crítico
  (50, 'Bodega B', 5,  'PROD-003');

insert into ventas (fecha, total, cliente_id) values
  ('2026-01-15', 450000, 1),
  ('2026-02-03', 1200000, 2),
  ('2026-03-20', 320000, 1),
  ('2026-04-01', 850000, 3);

insert into movimientos (tipo, fecha, cantidad, producto_id) values
  ('entrada', '2026-01-10', 30, 'PROD-001'),
  ('salida',  '2026-01-15', 5,  'PROD-001'),
  ('entrada', '2026-02-01', 10, 'PROD-002'),
  ('salida',  '2026-03-10', 7,  'PROD-002');
```

---

## 🧩 Fase 2 — Types TypeScript

**`/types/index.ts`**

```typescript
export interface Cliente {
  id: number;
  nombre: string;
  telefono: string | null;
  email: string | null;
  direccion: string | null;
  tipo: string | null;
  created_at: string;
}

export interface Proveedor {
  id: number;
  nombre_empresa: string;
  contacto: string | null;
  email: string | null;
  telefono: string | null;
  categoria: string | null;
  cumplimiento_calidad: string | null;
}

export interface Producto {
  id: string;
  nombre: string;
  modelo: string | null;
  descripcion: string | null;
}

export interface Venta {
  id: number;
  fecha: string;
  total: number;
  cliente_id: number | null;
  clientes?: { nombre: string }; // join
}

export interface Inventario {
  id: number;
  stock_disponible: number;
  ubicacion: string | null;
  stock_minimo: number;
  producto_id: string;
  productos?: { nombre: string }; // join
}

export interface Movimiento {
  id: number;
  tipo: "entrada" | "salida" | "ajuste";
  fecha: string;
  cantidad: number;
  producto_id: string | null;
}

// KPIs para el dashboard
export interface DashboardKPIs {
  totalVentas: number;
  clientesActivos: number;
  productosStockCritico: number;
  ordenesPendientes: number;
}
```

---

## 🔌 Fase 3 — Queries a Supabase

**`/lib/queries/clientes.ts`**

```typescript
import { supabase } from "@/lib/supabase";
import { Cliente } from "@/types";

export async function getClientes(): Promise<Cliente[]> {
  const { data, error } = await supabase
    .from("clientes")
    .select("*")
    .order("nombre");

  if (error) throw error;
  return data ?? [];
}

export async function getClienteById(id: number): Promise<Cliente | null> {
  const { data, error } = await supabase
    .from("clientes")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}
```

**`/lib/queries/inventario.ts`**

```typescript
import { supabase } from "@/lib/supabase";
import { Inventario } from "@/types";

export async function getInventario(): Promise<Inventario[]> {
  const { data, error } = await supabase
    .from("inventario")
    .select("*, productos(nombre)")
    .order("stock_disponible");

  if (error) throw error;
  return data ?? [];
}

export async function getStockCritico(): Promise<Inventario[]> {
  const { data, error } = await supabase
    .from("inventario")
    .select("*, productos(nombre)")
    .filter("stock_disponible", "lt", "stock_minimo"); // stock < mínimo

  if (error) throw error;
  return data ?? [];
}
```

**`/lib/queries/ventas.ts`**

```typescript
import { supabase } from "@/lib/supabase";
import { Venta } from "@/types";

export async function getVentas(): Promise<Venta[]> {
  const { data, error } = await supabase
    .from("ventas")
    .select("*, clientes(nombre)")
    .order("fecha", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getTotalVentasMes(): Promise<number> {
  const inicioMes = new Date();
  inicioMes.setDate(1);

  const { data, error } = await supabase
    .from("ventas")
    .select("total")
    .gte("fecha", inicioMes.toISOString().split("T")[0]);

  if (error) throw error;
  return (data ?? []).reduce((acc, v) => acc + Number(v.total), 0);
}
```

---

## 🎨 Fase 4 — Workflow con Stitch

Stitch acelera la generación del shell visual. Úsalo así:

### Prompts recomendados para Stitch

**Layout principal:**

```
Create a sidebar dashboard layout in React + Tailwind.
Sidebar has navigation links: Dashboard, Clientes, Proveedores,
Productos, Inventario, Ventas, Movimientos.
Header shows current page title and a user avatar.
Main content area is scrollable.
Use a clean white/slate color scheme.
```

**Página de Dashboard:**

```
Create a dashboard page with:
- 4 KPI cards in a row: "Ventas del mes", "Clientes activos",
  "Stock crítico", "Órdenes pendientes"
- A line chart below showing monthly sales (ventas por mes)
- A small alerts section for low stock items
Use shadcn/ui Card components and recharts for the chart.
```

**Tabla de clientes:**

```
Create a data table for "Clientes" with columns:
Nombre, Tipo, Email, Teléfono, Acciones.
Include a search input at the top and an "Agregar cliente" button.
Use shadcn/ui Table component.
```

### Después de exportar de Stitch

1. Copia el JSX a la carpeta correspondiente en `/components/`
2. Reemplaza los datos estáticos con las queries de Supabase:

   ```typescript
   // ❌ Datos hardcodeados de Stitch:
   const clientes = [{ nombre: 'Cliente 1', ... }]

   // ✅ Datos reales desde Supabase:
   const clientes = await getClientes()
   ```

3. Agrega `'use client'` si el componente usa hooks, o conviértelo en Server Component si solo lee datos.

---

## 📋 Fase 5 — Componentes clave a construir

### KpiCard (para el dashboard)

```typescript
// /components/dashboard/KpiCard.tsx
interface KpiCardProps {
  titulo: string
  valor: string | number
  descripcion?: string
  alerta?: boolean
}

export function KpiCard({ titulo, valor, descripcion, alerta }: KpiCardProps) {
  return (
    <div className={`rounded-lg border p-4 ${alerta ? 'border-red-300 bg-red-50' : 'bg-white'}`}>
      <p className="text-sm text-muted-foreground">{titulo}</p>
      <p className="text-2xl font-semibold mt-1">{valor}</p>
      {descripcion && <p className="text-xs text-muted-foreground mt-1">{descripcion}</p>}
    </div>
  )
}
```

### Alerta de stock crítico

```typescript
// /components/inventario/StockAlerta.tsx
import { Inventario } from '@/types'

export function StockAlerta({ items }: { items: Inventario[] }) {
  if (items.length === 0) return null

  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
      <h3 className="font-medium text-red-800 mb-2">⚠️ Stock crítico ({items.length} productos)</h3>
      <ul className="space-y-1">
        {items.map(item => (
          <li key={item.id} className="text-sm text-red-700">
            {item.productos?.nombre} — {item.stock_disponible} unidades
            (mínimo: {item.stock_minimo})
          </li>
        ))}
      </ul>
    </div>
  )
}
```

---

## 🔁 Orden de desarrollo recomendado

| #   | Paso                                     | Tiempo estimado |
| --- | ---------------------------------------- | --------------- |
| 1   | Schema SQL + datos de prueba en Supabase | 30 min          |
| 2   | Setup Next.js + Supabase client + types  | 20 min          |
| 3   | Layout (Sidebar + Header) con Stitch     | 30 min          |
| 4   | Dashboard con KPIs reales                | 45 min          |
| 5   | Módulo Inventario (tabla + alertas)      | 45 min          |
| 6   | Módulo Clientes (tabla + CRUD básico)    | 1 h             |
| 7   | Módulo Ventas (tabla + registro)         | 45 min          |
| 8   | Módulo Proveedores + Órdenes             | 45 min          |
| 9   | Módulo Movimientos                       | 30 min          |

---

## 📝 Notas importantes

- **Supabase RLS:** Para el prototipo puedes deshabilitar Row Level Security en todas las tablas. Antes de producción, actívalo.
- **Server vs Client Components:** Usa Server Components para páginas que solo leen datos (sin useState). Usa `'use client'` solo cuando necesites interactividad.
- **Stitch limitación:** Genera UI estática. Siempre valida que los nombres de props y clases de Tailwind sean compatibles con tu versión de shadcn.
- **Stock crítico:** La query `stock_disponible < stock_minimo` en Supabase debe hacerse con `.lt()` sobre una columna, no comparando dos columnas. Usa la función SQL `productos_stock_critico()` creada arriba para eso.
- **Recharts:** Para la gráfica de ventas instala `npm install recharts` y usa `<LineChart>` con datos agrupados por mes.
