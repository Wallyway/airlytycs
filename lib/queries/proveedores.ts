import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Proveedor } from "@/types";

export async function getProveedores(): Promise<Proveedor[]> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("proveedores")
    .select("*")
    .order("nombre_empresa");

  if (error) throw error;
  return data ?? [];
}
