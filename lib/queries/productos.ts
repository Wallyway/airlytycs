import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Producto } from "@/types";

export async function getProductos(): Promise<Producto[]> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("productos")
    .select("*")
    .order("nombre");

  if (error) throw error;
  return data ?? [];
}

export async function getProductoById(id: string): Promise<Producto | null> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("productos")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data ?? null;
}
