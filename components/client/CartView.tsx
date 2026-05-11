"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { clearCart, readCart, removeItemFromCart } from "@/lib/clientCart";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { getDemoUser } from "@/lib/demoAuth";
import { getProductImageSrc, getProductPriceLabel, getProductPriceValue } from "@/lib/storefront-utils";
import type { Inventario, Producto } from "@/types";

export function CartView({
  productos,
  inventario,
}: {
  productos: Producto[];
  inventario: Inventario[];
}) {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [cart, setCart] = useState<Record<string, number>>({});

  useEffect(() => {
    const syncCart = () => setCart(readCart());
    syncCart();
    window.addEventListener("airlytics-cart-change", syncCart);
    window.addEventListener("storage", syncCart);

    return () => {
      window.removeEventListener("airlytics-cart-change", syncCart);
      window.removeEventListener("storage", syncCart);
    };
  }, []);

  const inventarioMap = useMemo(() => {
    return new Map(inventario.map((item) => [item.producto_id, item]));
  }, [inventario]);

  const cartItems = useMemo(() => {
    return Object.entries(cart).map(([id, qty]) => {
      const producto = productos.find((p) => p.id === id);
      const inventarioItem = inventarioMap.get(id) ?? null;
      return { producto, qty, inventarioItem };
    });
  }, [cart, productos, inventarioMap]);

  const totalUnits = cartItems.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = cartItems.reduce((sum, item) => {
    const price = item.producto ? getProductPriceValue(item.producto) : null;
    return sum + (price ?? 0) * item.qty;
  }, 0);

  async function handlePay() {
    if (cartItems.length === 0) return;

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
      total: totalPrice,
      items: JSON.stringify(cartItems.map((item) => ({ id: item.producto?.id, qty: item.qty }))),
      created_at: new Date().toISOString(),
    });

    if (error) {
      toast.error("No se pudo completar el pago: " + error.message);
      return;
    }

    clearCart();
    setCart({});
    toast.success("Pago completado correctamente");
    router.push("/cliente");
  }

  function handleRemove(id: string) {
    removeItemFromCart(id);
    setCart(readCart());
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
      <section className="space-y-4">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Tu carrito</h1>
          <p className="mt-1 text-slate-600">Revisa los productos seleccionados antes de pagar.</p>
        </div>

        {cartItems.length === 0 ? (
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="py-10 text-center text-slate-500">
              Tu carrito está vacío.
              <div className="mt-4">
                <Button asChild>
                  <Link href="/cliente">Volver a la tienda</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {cartItems.map((item) => {
              if (!item.producto) return null;

              return (
                <Card key={item.producto.id} className="overflow-hidden border-slate-200 shadow-sm">
                  <div className="grid gap-4 p-4 md:grid-cols-[140px_1fr_auto] md:items-center">
                    <img
                      src={getProductImageSrc(item.producto)}
                      alt={item.producto.nombre}
                      className="h-32 w-full rounded-xl object-cover md:h-28"
                    />
                    <div className="space-y-1">
                      <h2 className="text-lg font-semibold text-slate-900">{item.producto.nombre}</h2>
                      <p className="text-sm text-slate-600">{item.producto.descripcion ?? "Sin descripción disponible."}</p>
                      <p className="text-sm text-slate-500">Stock disponible: {item.inventarioItem?.stock_disponible ?? 0}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="text-right">
                        <div className="text-sm text-slate-500">Precio</div>
                        <div className="text-lg font-semibold text-slate-900">{getProductPriceLabel(item.producto)}</div>
                        <div className="text-sm text-slate-500">Cantidad: {item.qty}</div>
                      </div>
                      <Button variant="ghost" onClick={() => handleRemove(item.producto.id)}>
                        Quitar
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <aside className="lg:sticky lg:top-24 lg:h-fit">
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="space-y-4 p-6">
            <div>
              <p className="text-sm text-slate-500">Resumen</p>
              <h2 className="text-2xl font-semibold text-slate-900">Total a pagar</h2>
            </div>

            <div className="space-y-2 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
              <div className="flex justify-between"><span>Productos</span><span>{totalUnits}</span></div>
              <div className="flex justify-between"><span>Total</span><span>{totalPrice > 0 ? `$${totalPrice.toFixed(2)}` : "Consultar"}</span></div>
            </div>

            <Button className="w-full" onClick={() => void handlePay()} disabled={cartItems.length === 0 || totalPrice === 0}>
              Pagar
            </Button>

            <Button variant="outline" className="w-full" asChild>
              <Link href="/cliente">Seguir comprando</Link>
            </Button>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
