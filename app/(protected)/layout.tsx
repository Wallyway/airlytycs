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

  const role = data.user.app_metadata?.role;
  if (role !== "admin" && role !== "root") {
    await supabase.auth.signOut();
    redirect("/login?reason=not_admin");
  }

  return children;
}
