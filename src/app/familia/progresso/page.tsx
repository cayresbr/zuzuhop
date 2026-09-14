import { Badge, Card, EmptyState, PageTitle } from "@/components/ui";
import { db } from "@/lib/db";
import { getFamilySession } from "@/lib/session";
import { avatarEmoji, themeBg } from "@/lib/avatars";
import { CATEGORY_LABELS, type Category } from "@/games/catalog";

export const dynamic = "force-dynamic";
export const metadata = { title: "Progresso — Zuzuhop" };

function lastSevenDayKeys(): string[] {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  });
}

const WEEKDAYS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

export default async function ProgressoPage() {
  const session = (await getFamilySession())!;

  const children = await db.childProfile.findMany({
    where: { guardianId: session.guardian.id },
    orderBy: { createdAt: "asc" },
    include: {
      progress: { include: { game: true }, orderBy: { lastPlayedAt: "desc" } },
      playSessions: { where: { dayKey: { in: lastSevenDayKeys() } } },
    },
  });

  if (children.length === 0) {
    return (
      <>
        <PageTitle title="Progresso" />
        <EmptyState
          emoji="📊"
          title="Ainda não há dados"
          description="Crie um perfil e o relatório aparece aqui depois da primeira brincadeira."
        />
      </>
    );
  }

  const days = lastSevenDayKeys();

  return (
    <>
      <PageTitle
        title="Progresso"
        subtitle="O que cada criança jogou e quais habilidades vem desenvolvendo."
      />

      <div className="space-y-8">
        {children.map((child) => {
          const totalSeconds = child.progress.reduce(
            (sum, row) => sum + row.totalSeconds,
            0,
          );
          const totalStars = child.progress.reduce((sum, row) => sum + row.stars, 0);

          const perDay = days.map((key) => ({
            key,
            seconds: child.playSessions
              .filter((play) => play.dayKey === key)
              .reduce((sum, play) => sum + play.seconds, 0),
          }));
          const maxSeconds = Math.max(60, ...perDay.map((day) => day.seconds));

          // Habilidades = união dos objetivos pedagógicos dos jogos praticados.
          const skills = new Set<string>();
          const categories = new Set<Category>();
          for (const row of child.progress) {
            categories.add(row.game.category as Category);
            const goals = row.game.learningGoals
              ? (JSON.parse(row.game.learningGoals) as string[])
              : [];
            goals.forEach((goal) => skills.add(goal));
          }

          return (
            <Card key={child.id}>
              <div className="flex flex-wrap items-center gap-4">
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl text-3xl ${themeBg(child.themeColor)}`}
                  aria-hidden
                >
                  {avatarEmoji(child.avatar)}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-extrabold text-ink">{child.nickname}</h2>
                  <p className="text-sm text-ink-soft">
                    {Math.round(totalSeconds / 60)} min brincados · {totalStars} ⭐ ·{" "}
                    {child.progress.length} jogos experimentados
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-bold uppercase tracking-wide text-ink-soft">
                  Últimos 7 dias
                </h3>
                <div className="mt-3 flex items-end gap-2" role="img" aria-label="Minutos por dia nos últimos sete dias">
                  {perDay.map((day) => {
                    const minutes = Math.round(day.seconds / 60);
                    const height = Math.max(4, (day.seconds / maxSeconds) * 100);
                    const weekday = WEEKDAYS[new Date(`${day.key}T12:00:00`).getDay()];
                    return (
                      <div key={day.key} className="flex flex-1 flex-col items-center gap-1">
                        <span className="text-xs font-bold text-ink-soft">{minutes}</span>
                        <div className="flex h-24 w-full items-end">
                          <div
                            className="w-full rounded-t-lg bg-grape-400"
                            style={{ height: `${height}%` }}
                          />
                        </div>
                        <span className="text-xs text-ink-soft">{weekday}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {child.progress.length > 0 ? (
                <>
                  <div className="mt-6">
                    <h3 className="text-sm font-bold uppercase tracking-wide text-ink-soft">
                      Habilidades desenvolvidas
                    </h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {[...skills].map((skill) => (
                        <Badge key={skill} tone="green">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="text-sm font-bold uppercase tracking-wide text-ink-soft">
                      Jogos
                    </h3>
                    <ul className="mt-2 divide-y divide-grape-100">
                      {child.progress.map((row) => (
                        <li
                          key={row.id}
                          className="flex flex-wrap items-center gap-3 py-3"
                        >
                          <span className="text-2xl" aria-hidden>
                            {row.game.emoji}
                          </span>
                          <div className="flex-1">
                            <p className="font-bold text-ink">{row.game.title}</p>
                            <p className="text-xs text-ink-soft">
                              {CATEGORY_LABELS[row.game.category as Category]?.label} ·{" "}
                              {row.timesPlayed}x · {Math.round(row.totalSeconds / 60)} min
                            </p>
                          </div>
                          <span aria-label={`${row.stars} estrelas`}>
                            {"⭐".repeat(Math.max(1, row.stars))}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <p className="mt-6 text-xs text-ink-soft">
                    Categorias exploradas:{" "}
                    {[...categories]
                      .map((category) => CATEGORY_LABELS[category]?.label ?? category)
                      .join(", ")}
                  </p>
                </>
              ) : (
                <p className="mt-6 text-sm text-ink-soft">
                  {child.nickname} ainda não brincou. O relatório começa a se preencher
                  na primeira partida.
                </p>
              )}
            </Card>
          );
        })}
      </div>
    </>
  );
}
