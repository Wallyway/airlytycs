"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { addItemToCart } from "@/lib/clientCart";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { getDemoUser } from "@/lib/demoAuth";
import type { Inventario, Producto } from "@/types";
import { getProductImageSrc, getProductPriceLabel, getProductPriceValue } from "@/lib/storefront-utils";

export function ProductDetail({
  producto,
  inventarioItem,
}: {
  producto: Producto;
  inventarioItem: Inventario | null;
}) {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const priceValue = getProductPriceValue(producto);
  const stockDisponible = inventarioItem?.stock_disponible ?? 0;

  function handleAddToCart() {
    addItemToCart(producto.id);
    toast.success("Producto agregado al carrito");
  }

  async function handlePayNow() {
    if (priceValue === null) {
      toast.error("Este producto no tiene precio configurado todavía.");
      return;
    }

    const { data: userData } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
    const demo = getDemoUser();
    const userId = demo?.id ?? userData?.user?.id;

    if (!userId) {
      toast.error("Debes iniciar sesión como cliente para comprar.");
      router.push("/login");
      return;
    }

    const { error } = await supabase.from("ventas").insert({
      cliente_id: userId,
      total: priceValue,
      items: JSON.stringify([{ id: producto.id, qty: 1 }]),
      created_at: new Date().toISOString(),
    });

    if (error) {
      toast.error("No se pudo procesar el pago: " + error.message);
      return;
    }

    toast.success("Pago registrado correctamente");
    router.push("/cliente");
  }

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      <div className="lg:col-span-3 space-y-6">
        <Link href="/cliente" className="text-sm font-medium text-sky-600 hover:underline">
          ← Volver a la tienda
        </Link>

        <Card className="overflow-hidden border-slate-200 shadow-sm">
          <img src={getProductImageSrc(producto)} alt={producto.nombre} className="h-[420px] w-full object-cover" />
          <CardContent className="space-y-4 p-6">
            <div>
              <h1 className="text-3xl font-semibold text-slate-900">{producto.nombre}</h1>
              <p className="mt-1 text-sm text-slate-500">{producto.modelo ?? "Modelo no especificado"}</p>
            </div>
            <p className="text-slate-700 leading-7">
              {producto.descripcion ?? "Sin descripción disponible."}
            </p>
          </CardContent>
        </Card>
      </div>

      <aside className="lg:col-span-2">
        <Card className="sticky top-24 border-slate-200 shadow-sm">
          <CardContent className="space-y-5 p-6">
            <div>
              <div className="text-sm text-slate-500">Precio</div>
              <div className="text-3xl font-semibold text-slate-900">{getProductPriceLabel(producto)}</div>
            </div>

            <div>
              <div className="text-sm text-slate-500">Stock disponible</div>
              <div className="text-base font-medium text-slate-800">
                {stockDisponible > 0 ? `${stockDisponible} unidades` : "Sin stock disponible"}
              </div>
            </div>

            <div className="space-y-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              <p><strong className="text-slate-900">Categoría:</strong> equipo médico</p>
              <p><strong className="text-slate-900">Envío:</strong> consulta tiempos de entrega según tu ubicación.</p>
              <p><strong className="text-slate-900">Garantía:</strong> cobertura según fabricante.</p>
            </div>

            <div className="space-y-3">
              <Button className="w-full" onClick={handleAddToCart}>
                Agregar al carrito
              </Button>
              <Button className="w-full" variant="outline" onClick={() => void handlePayNow()} disabled={priceValue === null}>
                Pagar directamente
              </Button>
            </div>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
