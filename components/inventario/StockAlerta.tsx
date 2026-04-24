import type { Inventario } from "@/types";

interface StockAlertaProps {
  items: Inventario[];
}

export function StockAlerta({ items }: StockAlertaProps) {
  if (items.length === 0) return null;

  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
      <h3 className="font-medium text-red-800 mb-2">
        ⚠️ Stock crítico ({items.length} productos)
      </h3>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.producto_id} className="text-sm text-red-700">
            {item.productos?.nombre ?? item.producto_id} — {item.stock_disponible} unidades
            (mínimo: {item.stock_minimo})
          </li>
        ))}
      </ul>
    </div>
  );
}
