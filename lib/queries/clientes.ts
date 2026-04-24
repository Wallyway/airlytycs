import { supabase } from "@/lib/supabase";
import { Cliente } from "@/types";

export async function getClientes(): Promise<Cliente[]> {
  const { data, error } = await supabase
    .from("clientes")
    .select("*")
    .order("nombre");

  if (error) throw error;
  return data ?? [];
}

export async function getClienteById(id: number): Promise<Cliente | null> {
  const { data, error } = await supabase
    .from("clientes")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}
