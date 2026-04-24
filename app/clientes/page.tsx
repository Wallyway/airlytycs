import { ClientesTable } from "@/components/clientes/ClientesTable";
import { getClientes } from "@/lib/queries/clientes";
import { Building2, Plus, User, Users } from "lucide-react";

export default async function ClientesPage() {
  const clientes = await getClientes();
  const total = clientes.length;
  const empresas = clientes.filter(
    (cliente) => (cliente.tipo ?? "").toLowerCase() !== "particular"
  ).length;
  const particulares = total - empresas;

  return (
    <main className="ml-[260px] min-h-screen">
      <div className="pt-24 px-8 pb-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-h1 text-h1 text-on-surface">Clientes</h2>
            <p className="text-body-md text-on-surface-variant">
              Gestión de clientes registrados
            </p>
          </div>
          <button className="bg-[#90D5FF] text-white px-6 py-2.5 rounded-lg font-bold shadow-sm hover:brightness-105 active:scale-95 transition-all flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Cliente
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)] border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-label-caps text-on-surface-variant mb-1">
                TOTAL CLIENTES
              </p>
              <h3 className="text-data-display font-data-display text-on-surface">
                {total}
              </h3>
            </div>
            <div className="p-3 bg-primary-container/10 rounded-full">
              <Users className="text-primary" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)] border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-label-caps text-on-surface-variant mb-1">
                TIPO EMPRESA
              </p>
              <h3 className="text-data-display font-data-display text-on-surface">
                {empresas}
              </h3>
            </div>
            <div className="p-3 bg-tertiary-container/10 rounded-full">
              <Building2 className="text-tertiary" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)] border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-label-caps text-on-surface-variant mb-1">
                TIPO PARTICULAR
              </p>
              <h3 className="text-data-display font-data-display text-on-surface">
                {particulares}
              </h3>
            </div>
            <div className="p-3 bg-secondary-container/10 rounded-full">
              <User className="text-secondary" />
            </div>
          </div>
        </div>

        <ClientesTable clientes={clientes} />

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <h4 className="font-h3 text-h3 text-on-surface mb-4">
              Actividad Reciente
            </h4>
            <p className="text-body-md text-on-surface-variant">
              Sin actividad reciente
            </p>
          </div>
          <div className="lg:col-span-4 bg-slate-900 rounded-xl p-6 text-white relative overflow-hidden">
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <h4 className="text-lg font-bold mb-2">Soporte Logístico</h4>
                <p className="text-slate-400 text-sm">
                  ¿Necesitas ayuda gestionando tus clientes internacionales?
                </p>
              </div>
              <button className="mt-6 w-full py-2.5 bg-white text-slate-900 font-bold rounded-lg hover:bg-slate-100 transition-colors">
                Contactar Asesor
              </button>
            </div>
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl"></div>
          </div>
        </div>
      </div>
    </main>
  );
}
