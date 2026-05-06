import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) redirect("/login");

  const { data: isAdmin, error: isAdminError } = await supabase.rpc("is_admin");
  if (isAdminError || !isAdmin) redirect("/login?reason=not_admin");

  return children;
}
