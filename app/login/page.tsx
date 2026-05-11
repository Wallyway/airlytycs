import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { LoginCard } from "@/components/auth/LoginCard";

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ reason?: string; root?: string }>;
}) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();

  const params = searchParams ? await searchParams : undefined;
  const allowRootFlow = params?.root === "1";

  if (data.user && !allowRootFlow) {
    const role = data.user.app_metadata?.role;
    if (role === "admin" || role === "root") redirect("/dashboard");
    // Do not auto-redirect non-admin users from the login page.
    // Clients should sign in via the client tab which will redirect them to /cliente.
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <LoginCard
        initialReason={params?.reason ?? null}
        initialRootMode={allowRootFlow}
      />
    </main>
  );
}
