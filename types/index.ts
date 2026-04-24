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
  clientes?: { nombre: string };
}

export interface Inventario {
  id: number;
  stock_disponible: number;
  ubicacion: string | null;
  stock_minimo: number;
  producto_id: string;
  productos?: { nombre: string };
}

export interface Movimiento {
  id: number;
  tipo: "entrada" | "salida" | "ajuste";
  fecha: string;
  cantidad: number;
  producto_id: string | null;
  productos?: { nombre: string };
}

export interface DashboardKPIs {
  totalVentas: number;
  clientesActivos: number;
  productosStockCritico: number;
  ordenesPendientes: number;
}
