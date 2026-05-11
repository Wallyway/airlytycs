"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { addItemToCart } from "@/lib/clientCart";
import type { Inventario, Producto } from "@/types";
import {
  getProductImageSrc,
  getProductPriceLabel,
  getSearchBlob,
  isBlockedClientProduct,
} from "@/lib/storefront-utils";

export default function Storefront({
  initialProductos,
  initialInventario,
}: {
  initialProductos: Producto[];
  initialInventario: Inventario[];
}) {
  const productos = initialProductos ?? [];
  const inventario = initialInventario ?? [];
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  const inventarioMap = useMemo(() => {
    return new Map(inventario.map((item) => [item.producto_id, item]));
  }, [inventario]);

  function addToCart(id: string) {
    addItemToCart(id);
    toast.success("Añadido al carrito");
  }

  const filtered = productos.filter((p) => {
    const byQuery = query ? getSearchBlob(p).includes(query.toLowerCase()) : true;
    return byQuery && !isBlockedClientProduct(p);
  });

  return (
    <div className="space-y-8">
      <section className="space-y-6">
        <div className="rounded-3xl bg-[linear-gradient(135deg,#0f172a_0%,#133b63_55%,#1d4ed8_100%)] p-8 text-white shadow-lg">
          <div className="max-w-2xl space-y-4">
            <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-medium tracking-wide text-white/90">
              Equipo médico profesional
            </span>
            <h1 className="text-3xl font-semibold leading-tight md:text-5xl">
              Airlytics Store
            </h1>
            <p className="text-white/85 md:text-lg">
              Compra aparatos médicos para clínicas, hospitales y consultorios. Solo equipos, sin medicamentos ni vestimenta médica.
            </p>

            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <input
                placeholder="Buscar equipos, modelos o descripciones..."
                className="w-full rounded-2xl border-0 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none ring-0 placeholder:text-slate-400 md:max-w-xl"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <div className="flex flex-wrap gap-2 text-xs text-white/80">
                <span className="rounded-full bg-white/10 px-3 py-1">Todos los equipos</span>
                <span className="rounded-full bg-white/10 px-3 py-1">Monitores</span>
                <span className="rounded-full bg-white/10 px-3 py-1">Ventiladores</span>
                <span className="rounded-full bg-white/10 px-3 py-1">Diagnóstico</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => (
            <Card key={p.id} className="overflow-hidden border-slate-200 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
              <Link href={`/cliente/producto/${p.id}`} className="block">
                <img src={getProductImageSrc(p)} alt={p.nombre} className="h-44 w-full object-cover" />
              </Link>
              <CardContent>
                <div className="space-y-1">
                  <div className="text-lg font-semibold text-slate-900">{p.nombre}</div>
                  <div className="text-sm text-slate-500">{p.modelo ?? "Modelo no especificado"}</div>
                  <div className="line-clamp-2 text-sm text-slate-600">{p.descripcion ?? "Descripción no disponible"}</div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm text-slate-500">Precio</div>
                    <div className="text-base font-semibold text-slate-900">{getProductPriceLabel(p)}</div>
                  </div>
                  <div className="text-right text-sm font-medium text-slate-800">
                    {inventarioMap.get(p.id)?.stock_disponible ?? 0} disponibles
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Button className="flex-1" onClick={() => addToCart(p.id)}>
                    Agregar al carrito
                  </Button>
                  <Button variant="outline" className="flex-1" asChild>
                    <Link href={`/cliente/producto/${p.id}`}>Ver producto</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
