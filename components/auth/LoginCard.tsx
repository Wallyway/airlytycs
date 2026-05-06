"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Shield, ShieldAlert } from "lucide-react";

import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Mode = "login" | "register";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function LoginCard({
  initialReason = null,
}: {
  initialReason?: string | null;
}) {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const initialBanner =
    initialReason === "not_admin"
      ? "Tu usuario no es admin. Si ya existe un administrador, debes ingresar con esa cuenta."
      : null;

  async function handleLogin() {
    setErrorMessage(null);
    setInfoMessage(null);

    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail) {
      setErrorMessage("Ingresa tu correo.");
      return;
    }

    if (!password) {
      setErrorMessage("Ingresa tu contrasena.");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    startTransition(() => {
      router.replace("/dashboard");
      router.refresh();
    });
  }

  async function handleRegister() {
    setErrorMessage(null);
    setInfoMessage(null);

    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail) {
      setErrorMessage("Ingresa tu correo.");
      return;
    }

    if (!password) {
      setErrorMessage("Ingresa tu contrasena.");
      return;
    }

    if (password.length < 12) {
      setErrorMessage("Usa una contrasena de al menos 12 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Las contrasenas no coinciden.");
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
    });

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    if (!data.user) {
      setErrorMessage("No se pudo crear el usuario.");
      return;
    }

    // If email confirmation is enabled in Supabase, signUp may not create a session.
    // Without a session, claiming admin (RLS: auth.uid()) will fail.
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      setErrorMessage(
        "Tu cuenta fue creada, pero no hay sesion activa (parece que la confirmacion por email esta habilitada en Supabase). Desactiva 'Confirm email' en Auth -> Providers -> Email y vuelve a registrarte.",
      );
      return;
    }

    // Claim the single admin seat (DB policy enforces: first insert only).
    const { error: adminError } = await supabase
      .from("admins")
      .insert({ id: data.user.id })
      .select("id")
      .single();

    if (adminError) {
      // Important: avoid leaving a newly created non-admin account with access.
      // This app is single-admin; we immediately sign out and tell the user.
      await supabase.auth.signOut();
      setErrorMessage(
        "Este sistema solo permite un administrador. Ya existe un admin.",
      );
      return;
    }

    setInfoMessage("Administrador creado. Accediendo...");

    startTransition(() => {
      router.replace("/dashboard");
      router.refresh();
    });
  }

  return (
    <Card className="w-full max-w-[460px] shadow-sm">
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-slate-900 text-white grid place-items-center">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="font-heading text-slate-900">
                Acceso Administrador
              </CardTitle>
              <p className="text-sm text-slate-600">
                Inicio de sesion y registro del primer admin.
              </p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {initialBanner ? (
          <Alert>
            <AlertTitle>Acceso restringido</AlertTitle>
            <AlertDescription>{initialBanner}</AlertDescription>
          </Alert>
        ) : null}

        {errorMessage ? (
          <Alert variant="destructive">
            <ShieldAlert className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        ) : null}

        {infoMessage ? (
          <Alert>
            <AlertTitle>Listo</AlertTitle>
            <AlertDescription>{infoMessage}</AlertDescription>
          </Alert>
        ) : null}

        <Tabs
          value={mode}
          onValueChange={(v) => {
            setErrorMessage(null);
            setInfoMessage(null);
            setMode(v as Mode);
          }}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Ingresar</TabsTrigger>
            <TabsTrigger value="register">Registrar</TabsTrigger>
          </TabsList>

          <div className="pt-4 space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="email">
                Correo
              </label>
              <Input
                id="email"
                autoComplete="email"
                inputMode="email"
                placeholder="admin@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label
                className="text-sm font-medium text-slate-700"
                htmlFor="password"
              >
                Contrasena
              </label>
              <Input
                id="password"
                type="password"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                placeholder={mode === "register" ? "Minimo 12 caracteres" : ""}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <TabsContent value="register" className="m-0 space-y-3">
              <div className="space-y-2">
                <label
                  className="text-sm font-medium text-slate-700"
                  htmlFor="confirmPassword"
                >
                  Confirmar contrasena
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <Button
                className="w-full"
                disabled={isPending}
                onClick={() => {
                  void handleRegister();
                }}
              >
                Crear admin
              </Button>

              <div className="text-xs text-slate-500">
                Este registro solo funciona una vez. El primer usuario creado sera el
                administrador.
              </div>
            </TabsContent>

            <TabsContent value="login" className="m-0 space-y-3">
              <Button
                className="w-full"
                disabled={isPending}
                onClick={() => {
                  void handleLogin();
                }}
              >
                Ingresar
              </Button>

              <Separator />

              <div className="text-xs text-slate-500">
                Si ya existe un admin, usa tus credenciales para ingresar.
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}
