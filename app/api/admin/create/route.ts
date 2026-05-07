import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Payload = {
  rootEmail?: string;
  rootPassword?: string;
  email?: string;
  password?: string;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function POST(request: Request) {
  let body: Payload;

  try {
    body = (await request.json()) as Payload;
  } catch {
    return NextResponse.json(
      { error: "Formato JSON inválido." },
      { status: 400 },
    );
  }
  const rootEmail = body.rootEmail ? normalizeEmail(body.rootEmail) : "";
  const rootPassword = body.rootPassword ?? "";
  const email = body.email ? normalizeEmail(body.email) : "";
  const password = body.password ?? "";

  if (!rootEmail) {
    return NextResponse.json(
      { error: "Ingresa el correo del administrador raíz." },
      { status: 400 },
    );
  }

  if (!rootPassword) {
    return NextResponse.json(
      { error: "Ingresa la contraseña del administrador raíz." },
      { status: 400 },
    );
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    return NextResponse.json(
      { error: "Falta configurar SUPABASE_SERVICE_ROLE_KEY." },
      { status: 500 },
    );
  }

  const serverSupabase = await createSupabaseServerClient();
  const { error: signInError } = await serverSupabase.auth.signInWithPassword({
    email: rootEmail,
    password: rootPassword,
  });

  if (signInError) {
    return NextResponse.json(
      { error: "Credenciales de raíz inválidas." },
      { status: 401 },
    );
  }

  const { data: rootUserData } = await serverSupabase.auth.getUser();
  const rootRole = rootUserData.user?.app_metadata?.role;
  if (rootRole !== "root") {
    await serverSupabase.auth.signOut();
    return NextResponse.json(
      { error: "Solo el administrador raíz puede crear nuevos admins." },
      { status: 403 },
    );
  }

  if (!email) {
    await serverSupabase.auth.signOut();
    return NextResponse.json(
      { error: "Ingresa el correo del nuevo admin." },
      { status: 400 },
    );
  }

  if (password.length < 12) {
    await serverSupabase.auth.signOut();
    return NextResponse.json(
      { error: "Usa una contrasena de al menos 12 caracteres." },
      { status: 400 },
    );
  }

  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    { auth: { persistSession: false } },
  );

  const { data, error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: { role: "admin" },
  });

  if (error || !data.user) {
    await serverSupabase.auth.signOut();
    return NextResponse.json(
      { error: error?.message ?? "No se pudo crear el admin." },
      { status: 400 },
    );
  }

  await serverSupabase.auth.signOut();

  return NextResponse.json({
    success: true,
    confirmationRequired: false,
  });
}
