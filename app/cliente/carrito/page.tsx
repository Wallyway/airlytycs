import { CartView } from "@/components/client/CartView";
import { getInventario } from "@/lib/queries/inventario";
import { getProductos } from "@/lib/queries/productos";

export default async function ClientCartPage() {
  const [productos, inventario] = await Promise.all([getProductos(), getInventario()]);

  return (
    <main className="px-4 py-8">
      <CartView productos={productos} inventario={inventario} />
    </main>
  );
}
