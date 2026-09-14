import Link from "next/link";
import { redirect } from "next/navigation";
import { getFamilySession } from "@/lib/session";
import { SignupForm } from "./signup-form";

export const metadata = { title: "Criar conta — Zuzuhop" };

export default async function CadastrarPage() {
  if (await getFamilySession()) redirect("/familia");

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <Link href="/" className="mb-8 text-center text-2xl font-extrabold text-grape-600">
        Zuzuhop <span aria-hidden>🐰</span>
      </Link>

      <div className="rounded-3xl bg-white p-8 shadow-lg">
        <h1 className="text-2xl font-extrabold text-ink">Criar conta</h1>
        <p className="mt-1 text-sm text-ink-soft">
          A conta é sempre do adulto responsável. Os perfis das crianças são
          criados depois, sem e-mail e sem senha.
        </p>
        <SignupForm />
      </div>

      <p className="mt-6 text-center text-sm text-ink-soft">
        Já tem conta?{" "}
        <Link href="/entrar" className="font-bold text-grape-600 hover:underline">
          Entrar
        </Link>
      </p>
    </main>
  );
}
