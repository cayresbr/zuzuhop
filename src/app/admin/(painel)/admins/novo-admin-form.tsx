"use client";

import { useActionState } from "react";
import { Alert, Button, Field, inputClass } from "@/components/ui";
import { criarAdmin, type AdminActionState } from "../actions";

const ROLES = [
  { value: "suporte", label: "Suporte — vê e gerencia famílias, lê auditoria" },
  { value: "conteudo", label: "Conteúdo — publica e edita jogos" },
  { value: "superadmin", label: "Superadmin — acesso total, inclui administradores" },
];

export function NovoAdminForm() {
  const [state, formAction, pending] = useActionState<AdminActionState, FormData>(
    criarAdmin,
    {},
  );

  return (
    <form action={formAction} className="mt-5 grid gap-4 sm:grid-cols-2">
      {state.error ? (
        <div className="sm:col-span-2">
          <Alert tone="error">{state.error}</Alert>
        </div>
      ) : null}
      {state.success ? (
        <div className="sm:col-span-2">
          <Alert tone="success">{state.success}</Alert>
        </div>
      ) : null}

      <Field label="Nome">
        <input name="name" required className={inputClass} />
      </Field>

      <Field label="E-mail">
        <input name="email" type="email" required className={inputClass} />
      </Field>

      <Field label="Senha temporária" hint="Mín. 10 caracteres, com maiúscula, minúscula e número.">
        <input name="password" type="password" required className={inputClass} />
      </Field>

      <Field label="Papel">
        <select name="role" className={inputClass} defaultValue="suporte">
          {ROLES.map((role) => (
            <option key={role.value} value={role.value}>
              {role.label}
            </option>
          ))}
        </select>
      </Field>

      <div className="sm:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Criando..." : "Criar administrador"}
        </Button>
      </div>
    </form>
  );
}
