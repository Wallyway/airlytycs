"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Shield } from "lucide-react";
import { toast } from "sonner";

import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { signInDemo } from "@/lib/demoAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Mode = "admin" | "client" | "root";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function LoginCard({
  initialReason = null,
  initialRootMode = false,
}: {
  initialReason?: string | null;
  initialRootMode?: boolean;
}) {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [mode, setMode] = useState<Mode>(initialRootMode ? "root" : "admin");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPassword, setClientPassword] = useState("");
  const [rootEmail, setRootEmail] = useState("");
  const [rootPassword, setRootPassword] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [isPending, startTransition] = useTransition();

  const initialBanner =
    initialReason === "not_admin"
      ? "Tu usuario no es admin. Si ya existe un administrador, debes ingresar con esa cuenta."
      : null;

  async function handleLogin() {
    const isClient = mode === "client";
    const emailToUse = isClient ? clientEmail : loginEmail;
    const passwordToUse = isClient ? clientPassword : loginPassword;

    const normalizedEmail = normalizeEmail(emailToUse);
    if (!normalizedEmail) {
      toast.error("Ingresa tu correo.");
      return;
    }

    if (!passwordToUse) {
      toast.error("Ingresa tu contrasena.");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password: passwordToUse,
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    startTransition(() => {
      if (isClient) {
        router.replace("/cliente");
      } else {
        router.replace("/dashboard");
      }
      router.refresh();
    });
  }

  async function handleRootCreate() {
    const normalizedRootEmail = normalizeEmail(rootEmail);
    if (!normalizedRootEmail) {
      toast.error("Ingresa el correo del administrador raíz.");
      return;
    }

    if (!rootPassword) {
      toast.error("Ingresa la contraseña del administrador raíz.");
      return;
    }

    const normalizedEmail = normalizeEmail(newAdminEmail);
    if (!normalizedEmail) {
      toast.error("Ingresa el correo del nuevo admin.");
      return;
    }

    if (!newAdminPassword) {
      toast.error("Ingresa la contraseña del nuevo admin.");
      return;
    }

    if (newAdminPassword.length < 12) {
      toast.error("Usa una contrasena de al menos 12 caracteres.");
      return;
    }


    const response = await fetch("/api/admin/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rootEmail: normalizedRootEmail,
        rootPassword,
        email: normalizedEmail,
        password: newAdminPassword,
      }),
    });
    let payload: { error?: string; confirmationRequired?: boolean } | null = null;

    try {
      payload = (await response.json()) as {
        error?: string;
        confirmationRequired?: boolean;
      };
    } catch {
      payload = null;
    }

    if (!response.ok) {
      toast.error(payload?.error ?? "No se pudo crear el admin.");
      return;
    }

    if (payload?.confirmationRequired) {
      toast.success("Invitación enviada. El nuevo admin debe crear su contraseña.");
    } else {
      toast.success("Administrador creado. Puede ingresar de inmediato.");
    }
  }

  return (
    <Card className="w-full max-w-[460px] shadow-sm">
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="h-10 w-10 rounded-lg bg-slate-900 text-white grid place-items-center">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="font-heading text-slate-900">Acceso</CardTitle>
            <p className="text-sm text-slate-600">Selecciona Admin o Cliente para iniciar sesión.</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {initialBanner ? (
          <div className="rounded-lg border border-border bg-popover px-4 py-3 text-sm text-muted-foreground">
            {initialBanner}
          </div>
        ) : null}

        <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="admin">Admin</TabsTrigger>
            <TabsTrigger value="client">Cliente</TabsTrigger>
            <TabsTrigger value="root">¿Eres root?</TabsTrigger>
          </TabsList>

          <div className="pt-4 space-y-3">

            <TabsContent value="root" className="m-0 space-y-3">
              <div className="space-y-2">
                <label
                  className="text-sm font-medium text-slate-700"
                  htmlFor="rootEmail"
                >
                  Correo de root
                </label>
                <Input
                  id="rootEmail"
                  autoComplete="email"
                  inputMode="email"
                  placeholder="root@empresa.com"
                  value={rootEmail}
                  onChange={(e) => setRootEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label
                  className="text-sm font-medium text-slate-700"
                  htmlFor="rootPassword"
                >
                  Contrasena de root
                </label>
                <Input
                  id="rootPassword"
                  type="password"
                  autoComplete="current-password"
                  value={rootPassword}
                  onChange={(e) => setRootPassword(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label
                  className="text-sm font-medium text-slate-700"
                  htmlFor="newAdminEmail"
                >
                  Correo del nuevo admin
                </label>
                <Input
                  id="newAdminEmail"
                  autoComplete="email"
                  inputMode="email"
                  placeholder="nuevo-admin@empresa.com"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label
                  className="text-sm font-medium text-slate-700"
                  htmlFor="newAdminPassword"
                >
                  Contrasena del nuevo admin
                </label>
                <Input
                  id="newAdminPassword"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Minimo 12 caracteres"
                  value={newAdminPassword}
                  onChange={(e) => setNewAdminPassword(e.target.value)}
                />
              </div>

              <Button
                className="w-full"
                disabled={isPending}
                onClick={() => {
                  void handleRootCreate();
                }}
              >
                Crear nuevo admin
              </Button>

              <div className="text-xs text-slate-500">
                Solo el usuario root puede crear nuevos administradores.
              </div>
            </TabsContent>

            <TabsContent value="admin" className="m-0 space-y-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700" htmlFor="email">
                  Correo
                </label>
                <Input
                  id="email"
                  autoComplete="email"
                  inputMode="email"
                  placeholder="admin@empresa.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700" htmlFor="password">
                  Contrasena
                </label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                />
              </div>

              <Button className="w-full" disabled={isPending} onClick={() => void handleLogin()}>
                Ingresar
              </Button>

              <Separator />

              <div className="text-xs text-slate-500">Si eres root, usa el acceso especial para crear nuevos admins.</div>
            </TabsContent>

            <TabsContent value="client" className="m-0 space-y-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700" htmlFor="clientEmail">
                  Correo
                </label>
                <Input
                  id="clientEmail"
                  autoComplete="email"
                  inputMode="email"
                  placeholder="cliente@correo.com"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700" htmlFor="clientPassword">
                  Contrasena
                </label>
                <Input
                  id="clientPassword"
                  type="password"
                  autoComplete="current-password"
                  value={clientPassword}
                  onChange={(e) => setClientPassword(e.target.value)}
                />
              </div>

              <Button className="w-full" disabled={isPending} onClick={() => void handleLogin()}>
                Ingresar como cliente
              </Button>

              <div className="pt-2">
                <Button variant="outline" className="w-full" onClick={() => {
                  signInDemo();
                  router.replace("/cliente");
                }}>
                  Iniciar demo (cliente)
                </Button>
              </div>

              <div className="pt-2 text-center">
                <button
                  className="text-sm text-sky-600 hover:underline"
                  onClick={() => router.push("/signup")}
                >
                  Crear cuenta nueva
                </button>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}
