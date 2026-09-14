import Link from "next/link";
import { redirect } from "next/navigation";
import { getFamilySession } from "@/lib/session";
import { Zuzu } from "@/components/mascots";
import { LoginForm } from "./login-form";

export const metadata = { title: "Entrar — Zuzuhop" };

export default async function EntrarPage() {
  if (await getFamilySession()) redirect("/familia");

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <Link
        href="/"
        className="mb-4 flex items-center justify-center gap-2 font-display text-2xl font-extrabold text-grape-600"
      >
        <Zuzu size={40} />
        Zuzuhop
      </Link>

      <div className="rounded-blob bg-white p-8 soft-shadow">
        <h1 className="font-display text-2xl font-extrabold text-ink">Área da família</h1>
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
