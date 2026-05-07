export function createSupabaseBrowserClient() {
  // Use cookie-based auth so Server Components + middleware can read sessions.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createBrowserClient } = require("@supabase/ssr") as typeof import("@supabase/ssr");

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
