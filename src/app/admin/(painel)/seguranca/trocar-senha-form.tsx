"use client";

import { useActionState } from "react";
import { Alert, Button, Field, inputClass } from "@/components/ui";
import { trocarSenhaAdmin, type AdminActionState } from "../actions";

export function TrocarSenhaForm() {
  const [state, formAction, pending] = useActionState<AdminActionState, FormData>(
    trocarSenhaAdmin,
    {},
  );

  return (
    <form action={formAction} className="mt-4 max-w-sm space-y-4">
      {state.error ? <Alert tone="error">{state.error}</Alert> : null}
      {state.success ? <Alert tone="success">{state.success}</Alert> : null}

      <Field label="Nova senha" hint="Mín. 10 caracteres, com maiúscula, minúscula e número.">
        <input
          name="novaSenha"
          type="password"
          required
          autoComplete="new-password"
          className={inputClass}
        />
      </Field>

      <Button type="submit" disabled={pending}>
        {pending ? "Salvando..." : "Alterar senha"}
      </Button>
    </form>
  );
}
