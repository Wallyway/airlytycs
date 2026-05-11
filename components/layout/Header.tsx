"use client";

import { Bell, HelpCircle, LogOut, Search, Settings } from "lucide-react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";

import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

const titleMap: Record<string, string> = {
  "dashboard": "Dashboard",
  "clientes": "Clientes",
  "proveedores": "Proveedores",
  "productos": "Productos",
  "inventario": "Inventario",
  "ventas": "Ventas",
  "movimientos": "Movimientos",
  "login": "Acceso",
};

function getTitleFromPath(pathname: string) {
  const segment = pathname.split("/").filter(Boolean)[0] ?? "dashboard";
  return titleMap[segment] ?? "Dashboard";
}

export function Header() {
  const pathname = usePathname();
  const title = getTitleFromPath(pathname);
  const router = useRouter();

  if (!pathname) return null;
  if (pathname.startsWith("/login") || pathname.startsWith("/signup") || pathname.startsWith("/cliente")) {
    return null;
  }

  async function handleLogout() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <header className="fixed top-0 right-0 left-[260px] h-16 bg-white/80 backdrop-blur flex justify-between items-center px-6 z-40 border-b border-slate-200/60">
      <div className="flex items-center gap-4 flex-1">
        <h1 className="text-lg font-semibold text-slate-900 font-heading">
          {title}
        </h1>
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
          <input
            className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-sm text-sm focus:ring-2 focus:ring-[#0095ff]/20 transition-all"
            placeholder="Buscar en AirLytics..."
            type="text"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button
          className="text-slate-700 hover:bg-slate-100 p-2 rounded-full transition-colors"
          title="Notificaciones"
        >
          <Bell className="h-5 w-5" />
        </button>
        <button
          className="text-slate-700 hover:bg-slate-100 p-2 rounded-full transition-colors"
          title="Configuracion"
        >
          <Settings className="h-5 w-5" />
        </button>
        <button
          className="text-slate-700 hover:bg-slate-100 p-2 rounded-full transition-colors"
          title="Ayuda"
        >
          <HelpCircle className="h-5 w-5" />
        </button>
        <button
          className="text-slate-700 hover:bg-slate-100 p-2 rounded-full transition-colors"
          title="Cerrar sesion"
          onClick={() => {
            void handleLogout();
          }}
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
