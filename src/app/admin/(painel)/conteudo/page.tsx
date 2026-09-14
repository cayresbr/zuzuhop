import { redirect } from "next/navigation";
import { Badge, Card, PageTitle } from "@/components/ui";
import { db } from "@/lib/db";
import { can, getAdminSession } from "@/lib/session";
import { CATEGORY_LABELS, type Category } from "@/games/catalog";
import { alternarJogo, alternarPremium } from "../actions";

export const dynamic = "force-dynamic";

export default async function ConteudoPage() {
  const session = (await getAdminSession())!;
  if (!can(session.admin.role, "conteudo:ler")) redirect("/admin");
  const canWrite = can(session.admin.role, "conteudo:escrever");

  const games = await db.game.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { progress: true } } },
  });

  return (
    <>
      <PageTitle
        title="Conteúdo"
        subtitle="Publique, despublique e defina o que é exclusivo do plano Plus."
      />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {games.map((game) => {
          const goals = game.learningGoals
            ? (JSON.parse(game.learningGoals) as string[])
            : [];
          return (
            <Card key={game.id} className="flex flex-col">
              <div className="flex items-start gap-3">
                <span className="text-4xl" aria-hidden>
                  {game.emoji}
                </span>
                <div className="flex-1">
                  <h2 className="font-extrabold text-ink">{game.title}</h2>
                  <p className="text-xs text-ink-soft">
                    {CATEGORY_LABELS[game.category as Category]?.label} · {game.minAge}–
                    {game.maxAge} anos
                  </p>
                </div>
              </div>

              <p className="mt-3 text-sm text-ink-soft">{game.description}</p>

              <div className="mt-3 flex flex-wrap gap-2">
                <Badge tone={game.isActive ? "green" : "red"}>
                  {game.isActive ? "publicado" : "despublicado"}
                </Badge>
                <Badge tone={game.isPremium ? "amber" : "neutral"}>
                  {game.isPremium ? "Plus" : "gratuito"}
                </Badge>
                <Badge tone="neutral">{game._count.progress} perfis</Badge>
              </div>

              <ul className="mt-3 space-y-1 text-xs text-ink-soft">
                {goals.map((goal) => (
                  <li key={goal}>• {goal}</li>
                ))}
              </ul>

              {canWrite ? (
                <div className="mt-4 flex gap-2">
                  <form action={alternarJogo} className="flex-1">
                    <input type="hidden" name="gameId" value={game.id} />
                    <button
                      type="submit"
                      className="w-full rounded-full bg-grape-50 px-3 py-2 text-xs font-bold text-grape-700"
                    >
                      {game.isActive ? "Despublicar" : "Publicar"}
                    </button>
                  </form>
                  <form action={alternarPremium} className="flex-1">
                    <input type="hidden" name="gameId" value={game.id} />
                    <button
                      type="submit"
                      className="w-full rounded-full bg-grape-50 px-3 py-2 text-xs font-bold text-grape-700"
                    >
                      {game.isPremium ? "Tornar gratuito" : "Tornar Plus"}
                    </button>
                  </form>
                </div>
              ) : null}
            </Card>
          );
        })}
      </div>
    </>
  );
}
