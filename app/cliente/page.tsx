import { getProductos } from "@/lib/queries/productos";
import { getInventario } from "@/lib/queries/inventario";
import Storefront from "@/components/client/Storefront";

export default async function ClientePage() {
  const [productos, inventario] = await Promise.all([getProductos(), getInventario()]);

  return (
    <main className="min-h-screen px-4 py-8">
      <Storefront initialProductos={productos} initialInventario={inventario} />
    </main>
  );
}
