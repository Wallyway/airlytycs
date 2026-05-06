import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { LoginCard } from "@/components/auth/LoginCard";

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ reason?: string }>;
}) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();

  const params = searchParams ? await searchParams : undefined;

  if (data.user) {
    const { data: isAdmin } = await supabase.rpc("is_admin");
    if (isAdmin) redirect("/dashboard");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <LoginCard initialReason={params?.reason ?? null} />
    </main>
  );
}
