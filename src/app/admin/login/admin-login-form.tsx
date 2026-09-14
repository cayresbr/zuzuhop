"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert, Button, Field, inputClass } from "@/components/ui";

export function AdminLoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [needsTotp, setNeedsTotp] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const form = new FormData(event.currentTarget);
    const totp = String(form.get("totp") ?? "").trim();

    const response = await fetch("/api/admin/entrar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        password: form.get("password"),
        ...(totp ? { totp } : {}),
      }),
    });
    const data = (await response.json()) as {
      ok: boolean;
      error?: string;
      redirect?: string;
      needsTotp?: boolean;
    };

    if (data.ok && data.needsTotp) {
      setNeedsTotp(true);
      setPending(false);
      return;
    }
    if (data.ok && data.redirect) {
      router.push(data.redirect);
      router.refresh();
      return;
    }

    setError(data.error ?? "Não foi possível entrar.");
    setPending(false);
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      {error ? <Alert tone="error">{error}</Alert> : null}
      {needsTotp ? (
        <Alert tone="info">Digite o código do seu aplicativo autenticador.</Alert>
      ) : null}

      <Field label="E-mail">
        <input name="email" type="email" required autoComplete="username" className={inputClass} />
      </Field>

      <Field label="Senha">
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={inputClass}
        />
      </Field>

      <Field label="Código de verificação (2FA)" hint="Deixe em branco no primeiro acesso.">
        <input
          name="totp"
          inputMode="numeric"
          maxLength={6}
          autoComplete="one-time-code"
          className={inputClass}
          placeholder="000000"
        />
      </Field>

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Verificando..." : "Entrar no painel"}
      </Button>
    </form>
  );
}
