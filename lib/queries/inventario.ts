import { createSupabaseServerClient } from "@/lib/supabase";
import { Inventario } from "@/types";

export async function getInventario(): Promise<Inventario[]> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("inventario")
    .select("*, productos(nombre)")
    .order("stock_disponible", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getStockCritico(): Promise<Inventario[]> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.rpc("productos_stock_critico");

  if (error) throw error;
  return (data ?? []) as Inventario[];
}
