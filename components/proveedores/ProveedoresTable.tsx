"use client";

import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Pencil,
  Search,
  Trash2,
} from "lucide-react";
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
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import type { Proveedor } from "@/types";

interface ProveedoresTableProps {
  proveedores: Proveedor[];
  openCreateInitially?: boolean;
}

interface ProveedorFormState {
  nombre_empresa: string;
  contacto: string;
  email: string;
  telefono: string;
  categoria: string;
  cumplimiento_calidad: "alto" | "medio" | "bajo";
}

const initialFormState: ProveedorFormState = {
  nombre_empresa: "",
  contacto: "",
  email: "",
  telefono: "",
  categoria: "",
  cumplimiento_calidad: "medio",
};

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function getInitials(nombre: string) {
  const parts = nombre.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function getAvatarClass(categoria: string | null) {
  const normalized = normalizeText(categoria ?? "");
  if (normalized.includes("tecnologia") || normalized.includes("tech")) {
    return "bg-purple-100 text-purple-600";
  }
  if (normalized.includes("equipo") || normalized.includes("medico")) {
    return "bg-blue-100 text-blue-600";
  }
  return "bg-slate-100 text-slate-600";
}

function getCategoriaBadgeClass(categoria: string | null) {
  const normalized = normalizeText(categoria ?? "");
  if (normalized.includes("tecnologia") || normalized.includes("tech")) {
    return "bg-purple-50 text-purple-600";
  }
  if (normalized.includes("equipo") || normalized.includes("medico")) {
    return "bg-blue-50 text-blue-600";
  }
  return "bg-slate-100 text-slate-600";
}

function getCumplimientoBadge(cumplimiento: string | null) {
  switch (normalizeText(cumplimiento ?? "")) {
    case "alto":
      return {
        className: "bg-green-50 text-green-600",
        dotClassName: "bg-green-600",
        label: "Alto",
      };
    case "medio":
      return {
        className: "bg-yellow-50 text-yellow-600",
        dotClassName: "bg-yellow-600",
        label: "Medio",
      };
    case "bajo":
      return {
        className: "bg-red-50 text-red-600",
        dotClassName: "bg-red-600",
        label: "Bajo",
      };
    default:
      return {
        className: "bg-slate-100 text-slate-600",
        dotClassName: "bg-slate-400",
        label: "-",
      };
  }
}

export function ProveedoresTable({
  proveedores,
  openCreateInitially = false,
}: ProveedoresTableProps) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [rows, setRows] = useState<Proveedor[]>(proveedores);
  const [search, setSearch] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("todas");
  const [cumplimientoFiltro, setCumplimientoFiltro] = useState("todos");
  const [currentPage, setCurrentPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formState, setFormState] = useState<ProveedorFormState>(initialFormState);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const itemsPerPage = 8;

  useEffect(() => {
    setRows(proveedores);
  }, [proveedores]);

  useEffect(() => {
    if (!openCreateInitially) return;
    setDialogMode("create");
    setEditingId(null);
    setFormState(initialFormState);
    setErrorMessage(null);
    setDialogOpen(true);
  }, [openCreateInitially]);

  function openCreateDialog() {
    setDialogMode("create");
    setEditingId(null);
    setFormState(initialFormState);
    setErrorMessage(null);
    setDialogOpen(true);
  }

  function openEditDialog(proveedor: Proveedor) {
    setDialogMode("edit");
    setEditingId(proveedor.id);
    setFormState({
      nombre_empresa: proveedor.nombre_empresa,
      contacto: proveedor.contacto ?? "",
      email: proveedor.email ?? "",
      telefono: proveedor.telefono ?? "",
      categoria: proveedor.categoria ?? "",
      cumplimiento_calidad:
        normalizeText(proveedor.cumplimiento_calidad ?? "") === "alto"
          ? "alto"
          : normalizeText(proveedor.cumplimiento_calidad ?? "") === "bajo"
            ? "bajo"
            : "medio",
    });
    setErrorMessage(null);
    setDialogOpen(true);
  }

  async function handleDelete(proveedor: Proveedor) {
    const confirmed = window.confirm(
      `¿Seguro que deseas eliminar a ${proveedor.nombre_empresa}?`,
    );
    if (!confirmed) return;

    const { error } = await supabase
      .from("proveedores")
      .delete()
      .eq("id", proveedor.id);

    if (error) {
      setErrorMessage("No se pudo eliminar el proveedor.");
      return;
    }

    setRows((prev) => prev.filter((item) => item.id !== proveedor.id));
    router.refresh();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!formState.nombre_empresa.trim()) {
      setErrorMessage("El nombre de la empresa es obligatorio.");
      return;
    }

    setSaving(true);
    setErrorMessage(null);

    const payload = {
      nombre_empresa: formState.nombre_empresa.trim(),
      contacto: formState.contacto.trim() || null,
      email: formState.email.trim() || null,
      telefono: formState.telefono.trim() || null,
      categoria: formState.categoria.trim() || null,
      cumplimiento_calidad: formState.cumplimiento_calidad,
    };

    if (dialogMode === "create") {
      const { data, error } = await supabase
        .from("proveedores")
        .insert(payload)
        .select("*")
        .single();

      if (error || !data) {
        setErrorMessage("No se pudo crear el proveedor.");
        setSaving(false);
        return;
      }

      setRows((prev) =>
        [...prev, data as Proveedor].sort((a, b) =>
          a.nombre_empresa.localeCompare(b.nombre_empresa),
        ),
      );
    } else {
      if (!editingId) {
        setErrorMessage("No se encontró el proveedor a editar.");
        setSaving(false);
        return;
      }

      const { data, error } = await supabase
        .from("proveedores")
        .update(payload)
        .eq("id", editingId)
        .select("*")
        .single();

      if (error || !data) {
        setErrorMessage("No se pudo actualizar el proveedor.");
        setSaving(false);
        return;
      }

      setRows((prev) =>
        prev
          .map((item) => (item.id === editingId ? (data as Proveedor) : item))
          .sort((a, b) => a.nombre_empresa.localeCompare(b.nombre_empresa)),
      );
    }

    setSaving(false);
    setDialogOpen(false);
    setFormState(initialFormState);
    setEditingId(null);
    router.refresh();
  }

  const categorias = useMemo(() => {
    const values = new Set(
      rows
        .map((proveedor) => proveedor.categoria)
        .filter((value): value is string => Boolean(value))
    );
    return Array.from(values).sort((a, b) => a.localeCompare(b));
  }, [rows]);

  const cumplimientos = useMemo(() => {
    const values = new Set(
      rows
        .map((proveedor) => proveedor.cumplimiento_calidad)
        .filter((value): value is string => Boolean(value))
    );
    return Array.from(values).sort((a, b) => a.localeCompare(b));
  }, [rows]);

  const proveedoresFiltrados = useMemo(() => {
    const query = search.trim().toLowerCase();

    return rows.filter((proveedor) => {
      const nombreCoincide =
        query.length === 0 ||
        proveedor.nombre_empresa.toLowerCase().includes(query) ||
        (proveedor.contacto ?? "").toLowerCase().includes(query);

      const categoriaCoincide =
        categoriaFiltro === "todas" ||
        (proveedor.categoria ?? "") === categoriaFiltro;

      const cumplimientoCoincide =
        cumplimientoFiltro === "todos" ||
        (proveedor.cumplimiento_calidad ?? "") === cumplimientoFiltro;

      return nombreCoincide && categoriaCoincide && cumplimientoCoincide;
    });
  }, [rows, search, categoriaFiltro, cumplimientoFiltro]);

  const totalPages = Math.ceil(proveedoresFiltrados.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const proveedoresPaginados = proveedoresFiltrados.slice(
    startIdx,
    startIdx + itemsPerPage
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="w-full pl-12 pr-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all"
            placeholder="Buscar por empresa o contacto..."
            type="text"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <select
          className="px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          value={categoriaFiltro}
          onChange={(event) => {
            setCategoriaFiltro(event.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="todas">Todas las categorías</option>
          {categorias.map((categoria) => (
            <option key={categoria} value={categoria}>
              {categoria}
            </option>
          ))}
        </select>

        <select
          className="px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          value={cumplimientoFiltro}
          onChange={(event) => {
            setCumplimientoFiltro(event.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="todos">Todos los cumplimientos</option>
          {cumplimientos.map((cumplimiento) => (
            <option key={cumplimiento} value={cumplimiento}>
              {cumplimiento}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[920px]">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-left text-label-bold text-slate-600 uppercase tracking-wider">
                Empresa
              </th>
              <th className="px-6 py-4 text-left text-label-bold text-slate-600 uppercase tracking-wider">
                Contacto
              </th>
              <th className="px-6 py-4 text-left text-label-bold text-slate-600 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-4 text-left text-label-bold text-slate-600 uppercase tracking-wider">
                Categoría
              </th>
              <th className="px-6 py-4 text-left text-label-bold text-slate-600 uppercase tracking-wider">
                Cumplimiento
              </th>
              <th className="px-6 py-4 text-right text-label-bold text-slate-600 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {proveedoresPaginados.map((proveedor) => {
              const cumplimientoBadge = getCumplimientoBadge(
                proveedor.cumplimiento_calidad
              );
              const categoriaBadge = getCategoriaBadgeClass(proveedor.categoria);
              const avatarBg = getAvatarClass(proveedor.categoria);

              return (
                <tr key={proveedor.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${avatarBg}`}
                      >
                        {getInitials(proveedor.nombre_empresa)}
                      </div>
                      <span className="font-medium text-slate-900">
                        {proveedor.nombre_empresa}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {proveedor.contacto ?? "-"}
                  </td>
                  <td className="px-6 py-4 text-slate-600 text-sm">
                    {proveedor.email ?? "-"}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-bold ${categoriaBadge}`}
                    >
                      {proveedor.categoria ?? "-"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold ${cumplimientoBadge.className}`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${cumplimientoBadge.dotClassName}`}
                      ></span>
                      {cumplimientoBadge.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      className="p-1.5 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      onClick={() => openEditDialog(proveedor)}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      className="p-1.5 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      onClick={() => handleDelete(proveedor)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-600">
            Mostrando {startIdx + 1} a{" "}
            {Math.min(startIdx + itemsPerPage, proveedoresFiltrados.length)} de{" "}
            {proveedoresFiltrados.length} proveedores
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 hover:bg-slate-100 rounded disabled:opacity-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-slate-600" />
            </button>
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded text-sm font-bold transition-colors ${
                    currentPage === page
                      ? "bg-blue-600 text-white"
                      : "hover:bg-slate-100 text-slate-600"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 hover:bg-slate-100 rounded disabled:opacity-50 transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>
      )}

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setErrorMessage(null);
            if (openCreateInitially) {
              router.replace("/proveedores");
            }
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "create" ? "Nuevo proveedor" : "Editar proveedor"}
            </DialogTitle>
            <DialogDescription>
              Gestiona la información comercial del proveedor.
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Empresa</label>
              <Input
                value={formState.nombre_empresa}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    nombre_empresa: event.target.value,
                  }))
                }
                placeholder="Nombre de la empresa"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Contacto</label>
                <Input
                  value={formState.contacto}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, contacto: event.target.value }))
                  }
                  placeholder="Nombre de contacto"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Teléfono</label>
                <Input
                  value={formState.telefono}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, telefono: event.target.value }))
                  }
                  placeholder="3001234567"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Email</label>
              <Input
                type="email"
                value={formState.email}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, email: event.target.value }))
                }
                placeholder="proveedor@correo.com"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Categoría</label>
                <Input
                  value={formState.categoria}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, categoria: event.target.value }))
                  }
                  placeholder="equipos, insumos..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Cumplimiento</label>
                <select
                  className="w-full h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
                  value={formState.cumplimiento_calidad}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      cumplimiento_calidad: event.target.value as "alto" | "medio" | "bajo",
                    }))
                  }
                >
                  <option value="alto">Alto</option>
                  <option value="medio">Medio</option>
                  <option value="bajo">Bajo</option>
                </select>
              </div>
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
                    ? "Crear proveedor"
                    : "Guardar cambios"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
