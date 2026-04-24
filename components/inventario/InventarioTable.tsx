"use client";

import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import type { Inventario, Producto } from "@/types";

interface InventarioTableProps {
  inventario: Inventario[];
  productos: Producto[];
  openCreateInitially?: boolean;
}

interface InventarioFormState {
  producto_id: string;
  stock_disponible: string;
  stock_minimo: string;
  ubicacion: string;
}

const initialFormState: InventarioFormState = {
  producto_id: "",
  stock_disponible: "0",
  stock_minimo: "5",
  ubicacion: "",
};

function getEstado(stockDisponible: number, stockMinimo: number) {
  if (stockDisponible < stockMinimo) {
    return { label: "Crítico", className: "bg-red-100 text-red-700" };
  }
  if (stockDisponible < stockMinimo * 2) {
    return { label: "Bajo", className: "bg-amber-100 text-amber-800" };
  }
  return { label: "OK", className: "bg-emerald-100 text-emerald-700" };
}

export function InventarioTable({
  inventario,
  productos,
  openCreateInitially = false,
}: InventarioTableProps) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [rows, setRows] = useState<Inventario[]>(inventario);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formState, setFormState] = useState<InventarioFormState>(initialFormState);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const productosMap = useMemo(
    () => new Map(productos.map((producto) => [producto.id, producto.nombre])),
    [productos],
  );

  useEffect(() => {
    setRows(inventario);
  }, [inventario]);

  useEffect(() => {
    if (!openCreateInitially) return;
    setDialogMode("create");
    setEditingId(null);
    setFormState({ ...initialFormState, producto_id: productos[0]?.id ?? "" });
    setErrorMessage(null);
    setDialogOpen(true);
  }, [openCreateInitially, productos]);

  function openCreateDialog() {
    setDialogMode("create");
    setEditingId(null);
    setFormState({ ...initialFormState, producto_id: productos[0]?.id ?? "" });
    setErrorMessage(null);
    setDialogOpen(true);
  }

  function openEditDialog(item: Inventario) {
    setDialogMode("edit");
    setEditingId(item.id);
    setFormState({
      producto_id: item.producto_id,
      stock_disponible: String(item.stock_disponible),
      stock_minimo: String(item.stock_minimo),
      ubicacion: item.ubicacion ?? "",
    });
    setErrorMessage(null);
    setDialogOpen(true);
  }

  async function handleDelete(item: Inventario) {
    const nombreProducto = item.productos?.nombre ?? item.producto_id;
    const confirmed = window.confirm(
      `¿Seguro que deseas eliminar el registro de inventario de ${nombreProducto}?`,
    );
    if (!confirmed) return;

    const { error } = await supabase.from("inventario").delete().eq("id", item.id);

    if (error) {
      setErrorMessage("No se pudo eliminar el registro de inventario.");
      return;
    }

    setRows((prev) => prev.filter((row) => row.id !== item.id));
    router.refresh();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!formState.producto_id) {
      setErrorMessage("Debes seleccionar un producto.");
      return;
    }

    const stockDisponible = Number(formState.stock_disponible);
    const stockMinimo = Number(formState.stock_minimo);

    if (Number.isNaN(stockDisponible) || Number.isNaN(stockMinimo)) {
      setErrorMessage("Stock disponible y mínimo deben ser números válidos.");
      return;
    }

    setSaving(true);
    setErrorMessage(null);

    const payload = {
      producto_id: formState.producto_id,
      stock_disponible: stockDisponible,
      stock_minimo: stockMinimo,
      ubicacion: formState.ubicacion.trim() || null,
    };

    if (dialogMode === "create") {
      const { data, error } = await supabase
        .from("inventario")
        .insert(payload)
        .select("*, productos(nombre)")
        .single();

      if (error || !data) {
        setErrorMessage("No se pudo crear el registro de inventario.");
        setSaving(false);
        return;
      }

      setRows((prev) => [...prev, data as Inventario]);
    } else {
      if (!editingId) {
        setErrorMessage("No se encontró el registro a editar.");
        setSaving(false);
        return;
      }

      const { data, error } = await supabase
        .from("inventario")
        .update(payload)
        .eq("id", editingId)
        .select("*, productos(nombre)")
        .single();

      if (error || !data) {
        setErrorMessage("No se pudo actualizar el inventario.");
        setSaving(false);
        return;
      }

      setRows((prev) =>
        prev.map((row) => (row.id === editingId ? (data as Inventario) : row)),
      );
    }

    setSaving(false);
    setDialogOpen(false);
    setFormState(initialFormState);
    setEditingId(null);
    router.refresh();
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-50">
              <TableHead className="text-slate-600 font-semibold text-label-bold uppercase tracking-wider">Producto</TableHead>
              <TableHead className="text-slate-600 font-semibold text-label-bold uppercase tracking-wider">Ubicación</TableHead>
              <TableHead className="text-slate-600 font-semibold text-label-bold uppercase tracking-wider">Stock disponible</TableHead>
              <TableHead className="text-slate-600 font-semibold text-label-bold uppercase tracking-wider">Stock mínimo</TableHead>
              <TableHead className="text-slate-600 font-semibold text-label-bold uppercase tracking-wider">Estado</TableHead>
              <TableHead className="text-slate-600 font-semibold text-label-bold uppercase tracking-wider text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((item) => {
              const estado = getEstado(item.stock_disponible, item.stock_minimo);

              return (
                <TableRow key={item.id} className="hover:bg-slate-50">
                  <TableCell className="font-medium text-slate-900">
                    {item.productos?.nombre ?? productosMap.get(item.producto_id) ?? item.producto_id}
                  </TableCell>
                  <TableCell className="text-slate-600">{item.ubicacion ?? "-"}</TableCell>
                  <TableCell className="text-slate-900 font-semibold">{item.stock_disponible}</TableCell>
                  <TableCell className="text-slate-600">{item.stock_minimo}</TableCell>
                  <TableCell>
                    <Badge className={estado.className}>{estado.label}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <button
                      type="button"
                      className="p-1.5 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      onClick={() => openEditDialog(item)}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      className="p-1.5 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      onClick={() => handleDelete(item)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setErrorMessage(null);
            if (openCreateInitially) {
              router.replace("/inventario");
            }
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "create" ? "Nuevo inventario" : "Editar inventario"}
            </DialogTitle>
            <DialogDescription>
              Ajusta disponibilidad, mínimo y ubicación de inventario.
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Producto</label>
              <select
                className="w-full h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
                value={formState.producto_id}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, producto_id: event.target.value }))
                }
                required
              >
                <option value="" disabled>Selecciona un producto</option>
                {productos.map((producto) => (
                  <option key={producto.id} value={producto.id}>
                    {producto.nombre} ({producto.id})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Stock disponible</label>
                <Input
                  type="number"
                  value={formState.stock_disponible}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, stock_disponible: event.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Stock mínimo</label>
                <Input
                  type="number"
                  value={formState.stock_minimo}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, stock_minimo: event.target.value }))
                  }
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Ubicación</label>
              <Input
                value={formState.ubicacion}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, ubicacion: event.target.value }))
                }
                placeholder="Bodega A"
              />
            </div>

            {errorMessage && (
              <p className="text-sm text-red-600" role="alert">
                {errorMessage}
              </p>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving
                  ? "Guardando..."
                  : dialogMode === "create"
                    ? "Crear registro"
                    : "Guardar cambios"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
