import Link from "next/link";
import { db } from "@/lib/db";
import { getFamilySession } from "@/lib/session";
import { avatarEmoji, ageFromBirthYear, themeBg } from "@/lib/avatars";
import { dayKey } from "@/lib/screen-time";
import { Badge, Card, EmptyState, LinkButton, PageTitle } from "@/components/ui";
import { entrarModoCrianca } from "./actions";

export const dynamic = "force-dynamic";

export default async function FamiliaPage() {
  const session = (await getFamilySession())!;

  const children = await db.childProfile.findMany({
    where: { guardianId: session.guardian.id },
    orderBy: { createdAt: "asc" },
  });

  const todayUsage = await db.playSession.groupBy({
    by: ["childProfileId"],
    where: {
      dayKey: dayKey(),
      childProfileId: { in: children.map((child) => child.id) },
    },
    _sum: { seconds: true },
  });

  const usageByChild = new Map(
    todayUsage.map((row) => [row.childProfileId, row._sum.seconds ?? 0]),
  );

  return (
    <>
      <PageTitle
        title={`Olá, ${session.guardian.name.split(" ")[0]}!`}
        subtitle="Escolha um perfil para a criança começar a brincar."
        action={
          children.length < 6 ? (
            <LinkButton href="/familia/perfis/novo">+ Novo perfil</LinkButton>
          ) : null
        }
      />

      {children.length === 0 ? (
        <EmptyState
          emoji="🧒"
          title="Nenhum perfil criado ainda"
          description="Crie o primeiro perfil infantil para liberar os jogos."
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {children.map((child) => {
            const usedSeconds = usageByChild.get(child.id) ?? 0;
            const limitSeconds = child.dailyLimitMinutes * 60;
            const percent = Math.min(100, Math.round((usedSeconds / limitSeconds) * 100));
            const blocked = usedSeconds >= limitSeconds;

            return (
              <Card key={child.id} className="flex flex-col">
                <div className="flex items-center gap-4">
                  <div
                    className={`glossy relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl text-4xl ring-4 ring-white ${themeBg(child.themeColor)}`}
                    aria-hidden
                  >
                    {avatarEmoji(child.avatar)}
                  </div>
                  <div>
                    <p className="font-display text-lg font-extrabold text-ink">{child.nickname}</p>
                    <p className="text-sm text-ink-soft">
                      {ageFromBirthYear(child.birthYear)} anos
                    </p>
                  </div>
                </div>

                <div className="mt-5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold text-ink-soft">Hoje</span>
                    <span className="text-ink-soft">
                      {Math.round(usedSeconds / 60)} de {child.dailyLimitMinutes} min
                    </span>
                  </div>
                  <div className="mt-1 h-3 overflow-hidden rounded-full bg-grape-50">
                    <div
                      className={`h-full rounded-full ${blocked ? "bg-coral-500" : "bg-mint-500"}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  {blocked ? (
                    <p className="mt-2">
                      <Badge tone="red">Limite de hoje atingido</Badge>
                    </p>
                  ) : null}
                </div>

                <div className="mt-6 flex gap-2">
                  <form action={entrarModoCrianca} className="flex-1">
                    <input type="hidden" name="childId" value={child.id} />
                    <button
                      type="submit"
                      disabled={blocked}
                      style={{ "--chunky-shade": "#4d22b4" } as React.CSSProperties}
                      className="chunky w-full bg-grape-500 px-4 py-3 font-display font-extrabold text-white disabled:opacity-50"
                    >
                      Brincar 🎈
                    </button>
                  </form>
                  <Link
                    href={`/familia/perfis/${child.id}`}
                    className="chunky flex items-center bg-grape-100 px-4 py-3 font-bold text-grape-700"
                    style={{ "--chunky-shade": "#b99cff" } as React.CSSProperties}
                    aria-label={`Editar perfil de ${child.nickname}`}
                  >
                    ⚙️
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Card className="mt-8 bg-grape-50">
        <h2 className="font-display text-lg font-extrabold text-ink">
          Como a segurança funciona aqui
        </h2>
        <ul className="mt-3 space-y-2 text-sm text-ink-soft">
          <li>
            🔐 <strong>Só você entra com senha.</strong> A criança entra pelo perfil,
            sem login, sem e-mail e sem dados pessoais.
          </li>
          <li>
            🚪 <strong>Portão parental.</strong> Para voltar desta área a partir do
            modo criança é preciso resolver uma continha — a criança não sai sozinha.
          </li>
          <li>
            🚫 <strong>Sem anúncios, sem chat e sem links externos</strong> dentro do
            modo criança.
          </li>
          <li>
            ⏱️ <strong>Tempo de tela</strong> validado no servidor: mesmo offline ou com
            o relógio do aparelho alterado, o limite vale.
          </li>
        </ul>
      </Card>
    </>
  );
}
