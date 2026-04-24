import { createSupabaseServerClient } from "@/lib/supabase";
import { Cliente } from "@/types";

export async function getClientes(): Promise<Cliente[]> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("clientes")
    .select("*")
    .order("nombre");

  if (error) throw error;
  return data ?? [];
}

export async function getClienteById(id: number): Promise<Cliente | null> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("clientes")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}
