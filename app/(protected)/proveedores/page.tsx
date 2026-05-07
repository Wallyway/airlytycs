import Link from "next/link";
import { ProveedoresTable } from "@/components/proveedores/ProveedoresTable";
import { getProveedores } from "@/lib/queries/proveedores";
import {
  AlertCircle,
  CheckCircle2,
  Plus,
  TrendingUp,
} from "lucide-react";

interface ProveedoresPageProps {
  searchParams?: Promise<{ nuevo?: string }>;
}

export default async function ProveedoresPage({ searchParams }: ProveedoresPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const proveedores = await getProveedores();
  const total = proveedores.length;
  const cumplimientoAlto = proveedores.filter(
    (proveedor) => (proveedor.cumplimiento_calidad ?? "").toLowerCase() === "alto"
  ).length;
  const cumplimientoBajo = proveedores.filter(
    (proveedor) => (proveedor.cumplimiento_calidad ?? "").toLowerCase() === "bajo"
  ).length;
  const openCreateInitially = params?.nuevo === "1";

  return (
    <main className="ml-[260px] min-h-screen">
      <div className="pt-24 px-8 pb-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-h1 text-h1 text-on-surface">Proveedores</h2>
            <p className="text-body-md text-on-surface-variant">
              Gestión de proveedores de productos
            </p>
          </div>
          <Link
            href="/proveedores?nuevo=1"
            className="bg-[#6FBFEF] text-slate-900 px-6 py-2.5 rounded-lg font-bold shadow-sm hover:bg-[#90D5FF] hover:text-white active:scale-95 transition-all flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Nuevo Proveedor
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)] border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-label-caps text-on-surface-variant mb-1">
                TOTAL PROVEEDORES
              </p>
              <h3 className="text-data-display font-data-display text-on-surface">
                {total}
              </h3>
            </div>
            <div className="p-3 bg-primary-container/10 rounded-full">
              <TrendingUp className="text-primary" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)] border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-label-caps text-on-surface-variant mb-1">
                CUMPLIMIENTO ALTO
              </p>
              <h3 className="text-data-display font-data-display text-on-surface">
                {cumplimientoAlto}
              </h3>
            </div>
            <div className="p-3 bg-tertiary-container/10 rounded-full">
              <CheckCircle2 className="text-tertiary" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)] border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-label-caps text-on-surface-variant mb-1">
                CUMPLIMIENTO BAJO
              </p>
              <h3 className="text-data-display font-data-display text-on-surface">
                {cumplimientoBajo}
              </h3>
            </div>
            <div className="p-3 bg-error-container/10 rounded-full">
              <AlertCircle className="text-error" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
          <div className="p-6 border-b border-slate-100">
            <h4 className="font-h3 text-h3 text-on-surface">
              Proveedores ({proveedores.length})
            </h4>
          </div>
          <div className="p-6">
            <ProveedoresTable
              proveedores={proveedores}
              openCreateInitially={openCreateInitially}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
