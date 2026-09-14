import { notFound, redirect } from "next/navigation";
import { Badge, Card, PageTitle } from "@/components/ui";
import { db } from "@/lib/db";
import { can, getAdminSession } from "@/lib/session";
import { avatarEmoji, ageFromBirthYear } from "@/lib/avatars";
import {
  alterarPlanoFamilia,
  alterarStatusFamilia,
  excluirFamilia,
} from "../../actions";

export const dynamic = "force-dynamic";

function formatDate(value: Date | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(value);
}

export default async function FamiliaDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = (await getAdminSession())!;
  if (!can(session.admin.role, "familias:ler")) redirect("/admin");

  const { id } = await params;
  const guardian = await db.guardian.findUnique({
    where: { id },
    include: {
      children: { include: { _count: { select: { progress: true } } } },
      sessions: {
        where: { revokedAt: null },
        orderBy: { lastUsedAt: "desc" },
        take: 5,
      },
    },
  });
  if (!guardian) notFound();

  const canWrite = can(session.admin.role, "familias:escrever");

  return (
    <>
      <PageTitle title={guardian.name} subtitle={guardian.email} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="text-lg font-extrabold text-ink">Situação da conta</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-soft">Status</dt>
              <dd>
                <Badge tone={guardian.status === "active" ? "green" : "red"}>
                  {guardian.status}
                </Badge>
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-soft">Plano</dt>
              <dd>
                <Badge tone={guardian.plan === "plus" ? "green" : "neutral"}>
                  {guardian.plan}
                </Badge>
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-soft">Cadastro</dt>
              <dd>{formatDate(guardian.createdAt)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-soft">Último acesso</dt>
              <dd>{formatDate(guardian.lastLoginAt)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-soft">Consentimento</dt>
              <dd>
                {formatDate(guardian.consentAcceptedAt)}{" "}
                {guardian.consentVersion ? `(v. ${guardian.consentVersion})` : ""}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-soft">Tentativas falhas</dt>
              <dd>{guardian.failedLoginCount}</dd>
            </div>
          </dl>

          {canWrite ? (
            <div className="mt-6 flex flex-wrap gap-3">
              <form action={alterarStatusFamilia}>
                <input type="hidden" name="guardianId" value={guardian.id} />
                <input
                  type="hidden"
                  name="status"
                  value={guardian.status === "active" ? "suspended" : "active"}
                />
                <button
                  type="submit"
                  className="rounded-full bg-grape-50 px-5 py-3 text-sm font-bold text-grape-700"
                >
                  {guardian.status === "active" ? "Suspender conta" : "Reativar conta"}
                </button>
              </form>

              <form action={alterarPlanoFamilia}>
                <input type="hidden" name="guardianId" value={guardian.id} />
                <input
                  type="hidden"
                  name="plan"
                  value={guardian.plan === "plus" ? "free" : "plus"}
                />
                <button
                  type="submit"
                  className="rounded-full bg-grape-50 px-5 py-3 text-sm font-bold text-grape-700"
                >
                  {guardian.plan === "plus" ? "Voltar para gratuito" : "Conceder Plus"}
                </button>
              </form>
            </div>
          ) : null}
        </Card>

        <Card>
          <h2 className="text-lg font-extrabold text-ink">
            Perfis infantis ({guardian.children.length})
          </h2>
          <ul className="mt-4 space-y-3">
            {guardian.children.map((child) => (
              <li key={child.id} className="flex items-center gap-3 rounded-2xl bg-grape-50 p-3">
                <span className="text-2xl" aria-hidden>
                  {avatarEmoji(child.avatar)}
                </span>
                <div className="flex-1">
                  <p className="font-bold text-ink">{child.nickname}</p>
                  <p className="text-xs text-ink-soft">
                    {ageFromBirthYear(child.birthYear)} anos · limite{" "}
                    {child.dailyLimitMinutes} min/dia · {child._count.progress} jogos
                  </p>
                </div>
              </li>
            ))}
            {guardian.children.length === 0 ? (
              <li className="text-sm text-ink-soft">Nenhum perfil criado.</li>
            ) : null}
          </ul>
          <p className="mt-4 text-xs text-ink-soft">
            O painel mostra apenas apelido e faixa etária. Não há nome completo,
            foto nem qualquer dado sensível de criança armazenado na plataforma.
          </p>
        </Card>
      </div>

      <Card className="mt-6">
        <h2 className="text-lg font-extrabold text-ink">Sessões ativas</h2>
        <ul className="mt-3 divide-y divide-grape-100 text-sm">
          {guardian.sessions.map((item) => (
            <li key={item.id} className="flex flex-wrap gap-3 py-2">
              <span className="flex-1 text-ink-soft">
                {item.userAgent?.slice(0, 70) || "—"}
              </span>
              <span className="text-ink-soft">{item.ip ?? "—"}</span>
              <span className="text-ink-soft">{formatDate(item.lastUsedAt)}</span>
            </li>
          ))}
          {guardian.sessions.length === 0 ? (
            <li className="py-2 text-ink-soft">Nenhuma sessão aberta.</li>
          ) : null}
        </ul>
      </Card>

      {canWrite ? (
        <Card className="mt-6 border-coral-100">
          <h2 className="text-lg font-extrabold text-ink">Excluir conta (LGPD)</h2>
          <p className="mt-1 text-sm text-ink-soft">
            Atende ao pedido de eliminação de dados do titular. Remove conta,
            perfis e histórico. Fica registrado no log de auditoria.
          </p>
          <form action={excluirFamilia} className="mt-4 flex flex-wrap items-end gap-3">
            <input type="hidden" name="guardianId" value={guardian.id} />
            <label className="block">
              <span className="mb-1 block text-sm font-bold text-ink">
                Digite EXCLUIR
              </span>
              <input
                name="confirmacao"
                required
                className="rounded-2xl border-2 border-coral-100 px-4 py-3 outline-none focus:border-coral-500"
              />
            </label>
            <button
              type="submit"
              className="rounded-full bg-coral-500 px-5 py-3 font-bold text-white"
            >
              Excluir definitivamente
            </button>
          </form>
        </Card>
      ) : null}
    </>
  );
}
