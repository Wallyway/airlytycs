import { supabase } from "@/lib/supabase";
import type { Proveedor } from "@/types";

export async function getProveedores(): Promise<Proveedor[]> {
  const { data, error } = await supabase
    .from("proveedores")
    .select("*")
    .order("nombre_empresa");

  if (error) throw error;
  return data ?? [];
}
