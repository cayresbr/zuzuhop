import Link from "next/link";
import { redirect } from "next/navigation";
import { getFamilySession } from "@/lib/session";
import { Zuzu } from "@/components/mascots";
import { SairButton } from "./sair-button";

const NAV = [
  { href: "/familia", label: "Perfis", emoji: "👨‍👩‍👧" },
  { href: "/familia/progresso", label: "Progresso", emoji: "📊" },
  { href: "/familia/conta", label: "Conta e segurança", emoji: "🔐" },
];

export default async function FamiliaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getFamilySession();
  if (!session) redirect("/entrar");

  return (
    <div className="min-h-screen">
      <header className="border-b border-grape-100 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <Link
            href="/familia"
            className="flex items-center gap-2 font-display text-xl font-extrabold text-grape-600"
          >
            <Zuzu size={34} />
            Zuzuhop
            <span className="rounded-pill bg-grape-50 px-2.5 py-0.5 text-xs font-extrabold text-grape-700">
              família
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-ink-soft sm:inline">
              {session.guardian.name}
            </span>
            <SairButton />
          </div>
        </div>
        <nav className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-4 pb-2">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-pill px-4 py-2 font-display text-sm font-extrabold text-ink-soft transition hover:bg-grape-50 hover:text-grape-700"
            >
              <span aria-hidden>{item.emoji}</span> {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  );
}
