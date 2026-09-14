import Link from "next/link";
import { Card, PageTitle } from "@/components/ui";
import { db } from "@/lib/db";
import { dayKey } from "@/lib/screen-time";

export const dynamic = "force-dynamic";

function Stat({ label, value, emoji }: { label: string; value: string | number; emoji: string }) {
  return (
    <Card>
      <div className="text-3xl" aria-hidden>
        {emoji}
      </div>
      <p className="mt-2 text-3xl font-extrabold text-ink">{value}</p>
      <p className="text-sm text-ink-soft">{label}</p>
    </Card>
  );
}

export default async function AdminHomePage() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 86_400_000);

  const [
    guardians,
    children,
    activeGames,
    playToday,
    newGuardians,
    failedLogins,
    topGames,
  ] = await Promise.all([
    db.guardian.count({ where: { status: "active" } }),
    db.childProfile.count(),
    db.game.count({ where: { isActive: true } }),
    db.playSession.aggregate({ where: { dayKey: dayKey() }, _sum: { seconds: true } }),
    db.guardian.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    db.loginAttempt.count({
      where: { success: false, createdAt: { gte: sevenDaysAgo } },
    }),
    db.gameProgress.groupBy({
      by: ["gameId"],
      _sum: { timesPlayed: true },
      orderBy: { _sum: { timesPlayed: "desc" } },
      take: 5,
    }),
  ]);

  const gameTitles = await db.game.findMany({
    where: { id: { in: topGames.map((row) => row.gameId) } },
    select: { id: true, title: true, emoji: true },
  });
  const titleById = new Map(gameTitles.map((game) => [game.id, game]));

  return (
    <>
      <PageTitle title="Visão geral" subtitle="Como está a plataforma agora." />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <Stat label="Famílias ativas" value={guardians} emoji="👨‍👩‍👧" />
        <Stat label="Perfis infantis" value={children} emoji="🧒" />
        <Stat label="Jogos publicados" value={activeGames} emoji="🎮" />
        <Stat
          label="Minutos brincados hoje"
          value={Math.round((playToday._sum.seconds ?? 0) / 60)}
          emoji="⏱️"
        />
        <Stat label="Novas famílias (7 dias)" value={newGuardians} emoji="📈" />
        <Stat label="Logins falhos (7 dias)" value={failedLogins} emoji="🚨" />
      </div>

      <Card className="mt-8">
        <h2 className="text-lg font-extrabold text-ink">Jogos mais brincados</h2>
        {topGames.length === 0 ? (
          <p className="mt-3 text-sm text-ink-soft">Ainda sem partidas registradas.</p>
        ) : (
          <ul className="mt-4 divide-y divide-grape-100">
            {topGames.map((row) => {
              const game = titleById.get(row.gameId);
              return (
                <li key={row.gameId} className="flex items-center gap-3 py-3">
                  <span className="text-2xl" aria-hidden>
                    {game?.emoji}
                  </span>
                  <span className="flex-1 font-bold text-ink">{game?.title}</span>
                  <span className="text-sm text-ink-soft">
                    {row._sum.timesPlayed ?? 0} partidas
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <Card className="mt-6 bg-grape-50">
        <h2 className="text-lg font-extrabold text-ink">Atalhos</h2>
        <div className="mt-3 flex flex-wrap gap-3">
          <Link href="/admin/familias" className="rounded-full bg-white px-5 py-3 font-bold text-grape-700">
            Gerenciar famílias
          </Link>
          <Link href="/admin/conteudo" className="rounded-full bg-white px-5 py-3 font-bold text-grape-700">
            Publicar/despublicar jogos
          </Link>
          <Link href="/admin/auditoria" className="rounded-full bg-white px-5 py-3 font-bold text-grape-700">
            Ver log de auditoria
          </Link>
        </div>
      </Card>
    </>
  );
}
