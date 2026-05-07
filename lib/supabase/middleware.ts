import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          // Make refreshed cookies visible to downstream handlers/components.
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));

          // Re-create response bound to updated request.
          supabaseResponse = NextResponse.next({ request });

          // Persist refreshed cookies to the browser.
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });

          // Keep any headers Supabase needs to set.
          Object.entries(headers).forEach(([key, value]) => {
            supabaseResponse.headers.set(key, value);
          });
        },
      },
    },
  );

  // Do not insert logic between createServerClient and this call.
  // Force a refresh path so server components see a valid user.
  await supabase.auth.getClaims();

  return supabaseResponse;
}
