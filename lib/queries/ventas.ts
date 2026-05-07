import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Venta } from "@/types";

export async function getVentas(): Promise<Venta[]> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("ventas")
    .select("*, clientes(nombre)")
    .order("fecha", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getTotalVentasMes(): Promise<number> {
  const supabase = await createSupabaseServerClient();

  const ahora = new Date();
  const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
  const finMes = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0);

  const { data, error } = await supabase
    .from("ventas")
    .select("total")
    .gte("fecha", inicioMes.toISOString().split("T")[0])
    .lte("fecha", finMes.toISOString().split("T")[0]);

  if (error) throw error;
  return (data ?? []).reduce((acc, v) => acc + Number(v.total), 0);
}
