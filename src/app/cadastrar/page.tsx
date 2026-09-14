import Link from "next/link";
import { redirect } from "next/navigation";
import { getFamilySession } from "@/lib/session";
import { ZuzuEHop } from "@/components/mascots";
import { SignupForm } from "./signup-form";

export const metadata = { title: "Criar conta — Zuzuhop" };

export default async function CadastrarPage() {
  if (await getFamilySession()) redirect("/familia");

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <Link href="/" className="mb-2 block">
        <ZuzuEHop size={92} />
        <span className="mt-1 block text-center font-display text-2xl font-extrabold text-grape-600">
          Zuzuhop
        </span>
      </Link>

      <div className="rounded-blob bg-white p-8 soft-shadow">
        <h1 className="font-display text-2xl font-extrabold text-ink">Criar conta</h1>
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
