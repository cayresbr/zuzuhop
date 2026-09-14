"use client";

import Image from "next/image";
import { useActionState, useState, useTransition } from "react";
import { Alert, Button, Field, inputClass } from "@/components/ui";
import { confirmarTotp, gerarSegredoTotp, type AdminActionState } from "../actions";

export function TotpSetup({
  enabled,
  secret,
  qrDataUrl,
}: {
  enabled: boolean;
  secret: string | null;
  qrDataUrl: string | null;
}) {
  const [state, formAction, pending] = useActionState<AdminActionState, FormData>(
    confirmarTotp,
    {},
  );
  const [generating, startGenerating] = useTransition();
  const [generated, setGenerated] = useState(false);

  if (enabled) {
    return (
      <div className="mt-4">
        <Alert tone="success">
          Segundo fator ativo. Guarde o acesso ao seu aplicativo autenticador.
        </Alert>
      </div>
    );
  }

  if (!secret) {
    return (
      <div className="mt-4">
        <Button
          type="button"
          disabled={generating || generated}
          onClick={() =>
            startGenerating(async () => {
              await gerarSegredoTotp();
              setGenerated(true);
              // Recarrega para renderizar o QR gerado no servidor.
              window.location.reload();
            })
          }
        >
          {generating ? "Gerando..." : "Configurar agora"}
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-5 space-y-5">
      <ol className="space-y-2 text-sm text-ink-soft">
        <li>1. Abra seu aplicativo autenticador.</li>
        <li>2. Leia o QR code abaixo (ou digite a chave manualmente).</li>
        <li>3. Informe o código de 6 dígitos para concluir.</li>
      </ol>

      {qrDataUrl ? (
        <Image
          src={qrDataUrl}
          alt="QR code para configurar a verificação em duas etapas"
          width={220}
          height={220}
          unoptimized
          className="rounded-2xl border-2 border-grape-100"
        />
      ) : null}

      <p className="break-all rounded-2xl bg-grape-50 px-4 py-3 font-mono text-sm text-ink">
        {secret}
      </p>

      <form action={formAction} className="space-y-3">
        {state.error ? <Alert tone="error">{state.error}</Alert> : null}
        {state.success ? <Alert tone="success">{state.success}</Alert> : null}

        <Field label="Código de 6 dígitos">
          <input
            name="code"
            inputMode="numeric"
            maxLength={6}
            required
            className={inputClass}
            placeholder="000000"
          />
        </Field>

        <Button type="submit" disabled={pending}>
          {pending ? "Confirmando..." : "Ativar segundo fator"}
        </Button>
      </form>
    </div>
  );
}
