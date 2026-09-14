import Link from "next/link";
import { redirect } from "next/navigation";
import { getFamilySession } from "@/lib/session";
import { LoginForm } from "./login-form";

export const metadata = { title: "Entrar — Zuzuhop" };

export default async function EntrarPage() {
  if (await getFamilySession()) redirect("/familia");

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <Link href="/" className="mb-8 text-center text-2xl font-extrabold text-grape-600">
        Zuzuhop <span aria-hidden>🐰</span>
      </Link>

      <div className="rounded-3xl bg-white p-8 shadow-lg">
        <h1 className="text-2xl font-extrabold text-ink">Área da família</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Esta tela é para o adulto responsável. As crianças entram pelos perfis,
          sem senha.
        </p>
        <LoginForm />
      </div>

      <p className="mt-6 text-center text-sm text-ink-soft">
        Ainda não tem conta?{" "}
        <Link href="/cadastrar" className="font-bold text-grape-600 hover:underline">
          Criar conta gratuita
        </Link>
      </p>
    </main>
  );
}
