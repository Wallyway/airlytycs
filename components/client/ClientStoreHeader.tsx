"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Settings, ShoppingCart, UserRound } from "lucide-react";

import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { getDemoUser, signOutDemo } from "@/lib/demoAuth";
import { readCart } from "@/lib/clientCart";

export function ClientStoreHeader() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [menuOpen, setMenuOpen] = useState(false);
  const [email, setEmail] = useState("Cliente");
  const [isDemo, setIsDemo] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      const demo = getDemoUser();
      if (demo) {
        if (!mounted) return;
        setEmail(demo.email ?? "demo@local");
        setIsDemo(true);
        return;
      }

      const { data } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
      if (!mounted) return;
      setEmail(data.user?.email ?? "Cliente");
      setIsDemo(false);
    }

    void loadUser();

    const syncCart = () => {
      const cart = readCart();
      setCartCount(Object.values(cart).reduce((sum, value) => sum + value, 0));
    };

    syncCart();
    window.addEventListener("airlytics-cart-change", syncCart);
    window.addEventListener("storage", syncCart);

    return () => {
      mounted = false;
      window.removeEventListener("airlytics-cart-change", syncCart);
      window.removeEventListener("storage", syncCart);
    };
  }, [supabase]);

  async function handleLogout() {
    if (isDemo) {
      signOutDemo();
    }

    await supabase.auth.signOut().catch(() => null);
    router.replace("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link href="/cliente" className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-md bg-[#0066cc] font-bold text-white">
            SM
          </div>
          <div>
            <div className="text-lg font-semibold">Airlytics Store</div>
            <div className="text-xs text-slate-500">Equipo médico y accesorios clínicos</div>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/cliente/carrito"
            className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <ShoppingCart className="h-4 w-4" />
            Carrito ({cartCount})
          </Link>

          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((value) => !value)}
              className="inline-flex items-center gap-2 rounded-full bg-[#0066cc] px-4 py-2 text-sm font-medium text-white hover:bg-[#0052a3]"
            >
              <UserRound className="h-4 w-4" />
              Usuario
            </button>

            {menuOpen ? (
              <div className="absolute right-0 mt-3 w-72 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
                <div className="space-y-1 border-b border-slate-100 pb-3">
                  <div className="text-sm font-semibold text-slate-900">{email}</div>
                  <div className="text-xs text-slate-500">
                    {isDemo ? "Sesión demo local" : "Cuenta cliente"}
                  </div>
                </div>

                <div className="mt-3 space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      router.push("/cliente/configuracion");
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <Settings className="h-4 w-4" />
                    Configuración
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      void handleLogout();
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Cerrar sesión
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
