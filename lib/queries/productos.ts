import { supabase } from "@/lib/supabase";
import type { Producto } from "@/types";

export async function getProductos(): Promise<Producto[]> {
  const { data, error } = await supabase
    .from("productos")
    .select("*")
    .order("nombre");

  if (error) throw error;
  return data ?? [];
}
