import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/session";
import { AdminLoginForm } from "./admin-login-form";

export const metadata = {
  title: "Administração — Zuzuhop",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  if (await getAdminSession()) redirect("/admin");

  return (
    <main className="flex min-h-screen items-center justify-center bg-ink p-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
        <p className="text-xs font-bold uppercase tracking-widest text-coral-500">
          Acesso restrito
        </p>
        <h1 className="mt-1 text-2xl font-extrabold text-ink">
          Painel administrativo
        </h1>
        <p className="mt-2 text-sm text-ink-soft">
          Esta área é separada da conta das famílias. Todo acesso é registrado em
          log de auditoria.
        </p>

        <AdminLoginForm />

        <Link
          href="/"
          className="mt-6 block text-center text-sm font-bold text-ink-soft hover:text-grape-600"
        >
          ← Voltar ao site
        </Link>
      </div>
    </main>
  );
}
