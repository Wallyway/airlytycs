import { supabase } from "@/lib/supabase";
import type { Movimiento } from "@/types";

export async function getMovimientos(): Promise<Movimiento[]> {
  const { data, error } = await supabase
    .from("movimientos")
    .select("*, productos(nombre)")
    .order("fecha", { ascending: false });

  if (error) throw error;
  return data ?? [];
}
