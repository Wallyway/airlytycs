"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeftRight,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Truck,
  Users,
  Warehouse,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Clientes", href: "/clientes", icon: Users },
  { label: "Proveedores", href: "/proveedores", icon: Truck },
  { label: "Productos", href: "/productos", icon: Package },
  { label: "Inventario", href: "/inventario", icon: Warehouse },
  { label: "Ventas", href: "/ventas", icon: ShoppingCart },
  { label: "Movimientos", href: "/movimientos", icon: ArrowLeftRight },
];

export function Sidebar() {
  const pathname = usePathname();

  if (pathname === "/login") return null;

  return (
    <aside className="fixed left-0 top-0 h-screen w-[260px] bg-[#1a2233] flex flex-col py-6 shadow-xl z-50">
      <div className="px-6 mb-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#0095ff] flex items-center justify-center text-white">
            <span className="text-sm font-bold font-heading">AL</span>
          </div>
          <div>
            <h1 className="text-[#ffffff] font-heading font-bold text-lg leading-tight">
              AirLytics
            </h1>
            <p className="text-slate-400 text-xs font-medium">Administrador</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center mx-2 px-4 py-3 transition-all duration-200 ease-in-out font-sans text-sm font-medium rounded-lg ${
                isActive
                  ? "bg-[#0095ff] text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <Icon className="mr-3 h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto px-6">
        <div className="flex items-center gap-3 rounded-lg bg-white/5 px-4 py-3">
          <div className="h-10 w-10 rounded-full bg-[#0095ff] text-white flex items-center justify-center font-heading font-bold text-sm">
            AM
          </div>
          <div>
            <p className="text-[#ffffff] font-semibold text-sm leading-none">
              Administrador
            </p>
            <p className="text-slate-400 text-xs mt-1">AirLytics</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
