import { Badge, Card, PageTitle } from "@/components/ui";
import { db } from "@/lib/db";
import { getFamilySession } from "@/lib/session";
import { encerrarOutrasSessoes, excluirConta } from "../actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Conta e segurança — Zuzuhop" };

function formatDate(value: Date | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(value);
}

export default async function ContaPage() {
  const session = (await getFamilySession())!;

  const [guardian, sessions] = await Promise.all([
    db.guardian.findUnique({ where: { id: session.guardian.id } }),
    db.guardianSession.findMany({
      where: { guardianId: session.guardian.id, revokedAt: null },
      orderBy: { lastUsedAt: "desc" },
      take: 10,
    }),
  ]);

  return (
    <>
      <PageTitle
        title="Conta e segurança"
        subtitle="Seus dados, suas sessões e seus direitos sobre as informações."
      />

      <Card>
        <h2 className="text-lg font-extrabold text-ink">Dados da conta</h2>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-bold uppercase text-ink-soft">Nome</dt>
            <dd className="text-ink">{guardian?.name}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase text-ink-soft">E-mail</dt>
            <dd className="text-ink">{guardian?.email}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase text-ink-soft">Plano</dt>
            <dd>
              <Badge tone={guardian?.plan === "plus" ? "green" : "neutral"}>
                {guardian?.plan === "plus" ? "Plus" : "Gratuito"}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase text-ink-soft">
              Consentimento registrado
            </dt>
            <dd className="text-ink">
              {formatDate(guardian?.consentAcceptedAt ?? null)}{" "}
              {guardian?.consentVersion ? `(v. ${guardian.consentVersion})` : ""}
            </dd>
          </div>
        </dl>
      </Card>

      <Card className="mt-6">
        <h2 className="text-lg font-extrabold text-ink">Sessões ativas</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Cada aparelho conectado à sua conta. Encerre todas se perder um celular.
        </p>
        <ul className="mt-4 divide-y divide-grape-100">
          {sessions.map((item) => (
            <li key={item.id} className="flex flex-wrap items-center gap-3 py-3 text-sm">
              <span className="flex-1 text-ink">
                {item.userAgent?.slice(0, 60) || "Aparelho desconhecido"}
              </span>
              <span className="text-ink-soft">{item.ip ?? "—"}</span>
              <span className="text-ink-soft">{formatDate(item.lastUsedAt)}</span>
              {item.id === session.sessionId ? <Badge tone="green">Este</Badge> : null}
            </li>
          ))}
        </ul>
        <form action={encerrarOutrasSessoes} className="mt-4">
          <button
            type="submit"
            className="rounded-full bg-grape-50 px-5 py-3 font-bold text-grape-700 transition hover:bg-grape-100"
          >
            Encerrar todas as sessões
          </button>
        </form>
      </Card>

      <Card className="mt-6">
        <h2 className="text-lg font-extrabold text-ink">Seus dados (LGPD)</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Você pode baixar tudo o que guardamos sobre a sua família a qualquer
          momento, em formato aberto.
        </p>
        <a
          href="/api/familia/exportar"
          className="mt-4 inline-block rounded-full bg-grape-500 px-5 py-3 font-bold text-white transition hover:bg-grape-600"
        >
          Baixar meus dados (JSON)
        </a>
      </Card>

      <Card className="mt-6 border-coral-100">
        <h2 className="text-lg font-extrabold text-ink">Excluir conta</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Remove a conta, todos os perfis das crianças e todo o histórico. A ação é
          imediata e irreversível.
        </p>
        <form action={excluirConta} className="mt-4 flex flex-wrap items-end gap-3">
          <label className="block">
            <span className="mb-1 block text-sm font-bold text-ink">
              Digite EXCLUIR para confirmar
            </span>
            <input
              name="confirmacao"
              required
              className="rounded-2xl border-2 border-coral-100 px-4 py-3 outline-none focus:border-coral-500"
              placeholder="EXCLUIR"
            />
          </label>
          <button
            type="submit"
            className="rounded-full bg-coral-500 px-5 py-3 font-bold text-white transition hover:bg-coral-600"
          >
            Excluir definitivamente
          </button>
        </form>
      </Card>
    </>
  );
}
