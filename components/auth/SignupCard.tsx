"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function SignupCard() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  async function handleSignup() {
    if (!email.trim()) return toast.error("Ingresa un correo");
    if (password.length < 8) return toast.error("La contraseña debe tener al menos 8 caracteres");
    if (password !== confirm) return toast.error("Las contraseñas no coinciden");

    const origin = typeof window !== "undefined" ? window.location.origin : undefined;

    const { error } = await supabase.auth.signUp({ email: email.trim(), password }, { emailRedirectTo: origin ? `${origin}/login` : undefined });

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Correo de verificación enviado. Revisa tu bandeja.");
    router.push("/login");
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Crear cuenta</CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        <div>
          <label className="text-sm">Correo</label>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} inputMode="email" />
        </div>

        <div>
          <label className="text-sm">Contraseña</label>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>

        <div>
          <label className="text-sm">Confirmar contraseña</label>
          <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </div>

        <div className="pt-2">
          <Button className="w-full" onClick={handleSignup}>
            Crear cuenta
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
