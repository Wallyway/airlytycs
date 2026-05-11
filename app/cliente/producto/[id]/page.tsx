import { notFound } from "next/navigation";

import { ProductDetail } from "@/components/client/ProductDetail";
import { getInventario } from "@/lib/queries/inventario";
import { getProductoById } from "@/lib/queries/productos";

export default async function ClientProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [producto, inventario] = await Promise.all([
    getProductoById(id),
    getInventario(),
  ]);

  if (!producto) notFound();

  const inventarioItem = inventario.find((item) => item.producto_id === producto.id) ?? null;

  return (
    <main className="px-4 py-8">
      <ProductDetail producto={producto} inventarioItem={inventarioItem} />
    </main>
  );
}
