import Link from "next/link";
import { redirect } from "next/navigation";
import { can, getAdminSession, type AdminPermission } from "@/lib/session";
import { AdminSairButton } from "./admin-sair-button";

export const metadata = { robots: { index: false, follow: false } };

const NAV = [
  { href: "/admin", label: "Visão geral", emoji: "📈", permission: null },
  { href: "/admin/familias", label: "Famílias", emoji: "👨‍👩‍👧", permission: "familias:ler" },
  { href: "/admin/conteudo", label: "Conteúdo", emoji: "🎮", permission: "conteudo:ler" },
  { href: "/admin/admins", label: "Administradores", emoji: "🛡️", permission: "admins:gerenciar" },
  { href: "/admin/auditoria", label: "Auditoria", emoji: "📜", permission: "auditoria:ler" },
  { href: "/admin/seguranca", label: "Minha segurança", emoji: "🔐", permission: null },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // /admin/login fica fora deste grupo de rotas: aqui todo acesso exige sessão.
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const nav = NAV.filter(
    (item) => !item.permission || can(session.admin.role, item.permission as AdminPermission),
  );

  return (
    <div className="min-h-screen bg-cloud">
      <header className="bg-ink text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <Link href="/admin" className="text-lg font-extrabold">
            Zuzuhop <span className="text-sm font-bold text-white/60">admin</span>
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-white/70">
              {session.admin.name} · {session.admin.role}
            </span>
            <AdminSairButton />
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-2">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              <span aria-hidden>{item.emoji}</span> {item.label}
            </Link>
          ))}
        </nav>
      </header>

      {!session.admin.totpEnabledAt ? (
        <div className="bg-mango-400 px-6 py-3 text-center text-sm font-bold text-ink">
          ⚠️ Segundo fator ainda não configurado.{" "}
          <Link href="/admin/seguranca" className="underline">
            Configure agora
          </Link>{" "}
          — é obrigatório para contas administrativas.
        </div>
      ) : null}

      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
