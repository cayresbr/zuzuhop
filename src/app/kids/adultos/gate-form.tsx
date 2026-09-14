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

      <p className="rounded-3xl bg-grape-50 px-5 py-4 font-display text-xl font-extrabold text-grape-700">
        {question}
      </p>

      <input
        name="answer"
        inputMode="numeric"
        autoComplete="off"
        required
        aria-label="Resposta"
        className="w-full rounded-3xl border-4 border-grape-100 bg-white px-4 py-4 text-center font-display text-3xl font-extrabold tracking-widest text-ink outline-none transition focus:border-grape-500"
        placeholder="00"
      />

      {state.error ? (
        <p role="alert" className="rounded-2xl bg-coral-50 px-4 py-2 text-sm font-bold text-coral-600">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="chunky w-full bg-grape-500 px-6 py-4 text-lg font-extrabold text-white disabled:opacity-60"
        style={{ "--chunky-shade": "#4d22b4" } as React.CSSProperties}
      >
        {pending ? "Conferindo..." : "Entrar"}
      </button>

      <Link
        href="/kids"
        className="block rounded-pill bg-grape-50 px-6 py-3.5 font-display text-lg font-extrabold text-grape-700 transition hover:bg-grape-100"
      >
        Voltar a brincar 🎈
      </Link>
    </form>
  );
}
