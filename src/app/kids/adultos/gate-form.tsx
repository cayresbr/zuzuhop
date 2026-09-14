"use client";

import { useActionState } from "react";
import Link from "next/link";
import { atravessarPortao, type GateState } from "./actions";

export function GateForm({ question, token }: { question: string; token: string }) {
  const [state, formAction, pending] = useActionState<GateState, FormData>(
    atravessarPortao,
    {},
  );

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <input type="hidden" name="token" value={token} />

      <p className="text-xl font-extrabold text-grape-600">{question}</p>

      <input
        name="answer"
        inputMode="numeric"
        autoComplete="off"
        required
        aria-label="Resposta"
        className="w-full rounded-2xl border-2 border-grape-100 px-4 py-4 text-center text-2xl font-bold outline-none focus:border-grape-500"
        placeholder="00"
      />

      {state.error ? (
        <p role="alert" className="text-sm font-bold text-coral-600">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-grape-500 px-6 py-4 text-lg font-bold text-white transition hover:bg-grape-600 disabled:opacity-60"
      >
        {pending ? "Conferindo..." : "Entrar"}
      </button>

      <Link
        href="/kids"
        className="block rounded-full bg-grape-50 px-6 py-4 text-lg font-bold text-grape-700"
      >
        Voltar a brincar 🎈
      </Link>
    </form>
  );
}
