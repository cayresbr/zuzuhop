"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert, Button, Field, inputClass } from "@/components/ui";

export function SignupForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setFields({});

    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/cadastrar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        password: form.get("password"),
        acceptedTerms: form.get("acceptedTerms") === "on",
        isGuardian: form.get("isGuardian") === "on",
        marketingOptIn: form.get("marketingOptIn") === "on",
      }),
    });
    const data = (await response.json()) as {
      ok: boolean;
      error?: string;
      fields?: Record<string, string>;
      redirect?: string;
    };

    if (data.ok && data.redirect) {
      router.push(data.redirect);
      router.refresh();
      return;
    }

    setError(data.error ?? "Não foi possível criar a conta.");
    setFields(data.fields ?? {});
    setPending(false);
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      {error ? <Alert tone="error">{error}</Alert> : null}

      <Field label="Seu nome" error={fields.name}>
        <input name="name" required autoComplete="name" className={inputClass} />
      </Field>

      <Field label="Seu e-mail" error={fields.email}>
        <input name="email" type="email" required autoComplete="email" className={inputClass} />
      </Field>

      <Field
        label="Senha"
        hint="Mínimo de 10 caracteres, com maiúscula, minúscula e número."
        error={fields.password}
      >
        <input
          name="password"
          type="password"
          required
          autoComplete="new-password"
          className={inputClass}
        />
      </Field>

      <label className="flex items-start gap-3 text-sm text-ink-soft">
        <input name="isGuardian" type="checkbox" required className="mt-1 h-5 w-5 accent-grape-500" />
        <span>
          Declaro que sou o pai, a mãe ou o responsável legal pela(s) criança(s)
          que usarão o app.
        </span>
      </label>
      {fields.isGuardian ? (
        <p className="text-xs font-bold text-coral-600">{fields.isGuardian}</p>
      ) : null}

      <label className="flex items-start gap-3 text-sm text-ink-soft">
        <input name="acceptedTerms" type="checkbox" required className="mt-1 h-5 w-5 accent-grape-500" />
        <span>
          Li e aceito os{" "}
          <Link href="/termos" className="font-bold text-grape-600 hover:underline">
            termos de uso
          </Link>{" "}
          e a{" "}
          <Link href="/privacidade" className="font-bold text-grape-600 hover:underline">
            política de privacidade
          </Link>
          , e autorizo o tratamento dos dados do perfil infantil descrito nela.
        </span>
      </label>
      {fields.acceptedTerms ? (
        <p className="text-xs font-bold text-coral-600">{fields.acceptedTerms}</p>
      ) : null}

      <label className="flex items-start gap-3 text-sm text-ink-soft">
        <input name="marketingOptIn" type="checkbox" className="mt-1 h-5 w-5 accent-grape-500" />
        <span>Quero receber dicas e novidades por e-mail (opcional).</span>
      </label>

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Criando..." : "Criar conta"}
      </Button>
    </form>
  );
}
