import { redirect } from "next/navigation";
import { Badge, Card, EmptyState, PageTitle } from "@/components/ui";
import { db } from "@/lib/db";
import { can, getAdminSession } from "@/lib/session";

export const dynamic = "force-dynamic";

const ACTION_TONE: Record<string, "green" | "red" | "amber" | "neutral"> = {
  "admin.login": "green",
  "admin.login.falha": "red",
  "admin.familia.excluir": "red",
  "admin.familia.status": "amber",
  "admin.admins.criar": "amber",
  "familia.conta.excluir": "red",
};

export default async function AuditoriaPage({
  searchParams,
}: {
  searchParams: Promise<{ acao?: string; pagina?: string }>;
}) {
  const session = (await getAdminSession())!;
  if (!can(session.admin.role, "auditoria:ler")) redirect("/admin");

  const { acao, pagina } = await searchParams;
  const page = Math.max(1, Number(pagina ?? 1) || 1);
  const pageSize = 50;

  const [logs, total, failedLogins] = await Promise.all([
    db.auditLog.findMany({
      where: acao ? { action: { contains: acao } } : undefined,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.auditLog.count({ where: acao ? { action: { contains: acao } } : undefined }),
    db.loginAttempt.findMany({
      where: { success: false },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <>
      <PageTitle
        title="Auditoria"
        subtitle="Registro imutável de tudo que acontece na plataforma."
      />

      <Card className="mb-6">
        <form className="flex flex-wrap gap-3">
          <input
            name="acao"
            defaultValue={acao ?? ""}
            placeholder="Filtrar por ação (ex.: admin.familia)"
            className="flex-1 rounded-2xl border-2 border-grape-100 px-4 py-3 outline-none focus:border-grape-500"
          />
          <button type="submit" className="rounded-full bg-grape-500 px-6 py-3 font-bold text-white">
            Filtrar
          </button>
        </form>
      </Card>

      {logs.length === 0 ? (
        <EmptyState emoji="📜" title="Nenhum evento registrado ainda" />
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-grape-50 text-xs uppercase tracking-wide text-ink-soft">
              <tr>
                <th className="px-5 py-3">Quando</th>
                <th className="px-5 py-3">Ator</th>
                <th className="px-5 py-3">Ação</th>
                <th className="px-5 py-3">Alvo</th>
                <th className="px-5 py-3">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-grape-100">
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="whitespace-nowrap px-5 py-3 text-ink-soft">
                    {new Intl.DateTimeFormat("pt-BR", {
                      dateStyle: "short",
                      timeStyle: "medium",
                    }).format(log.createdAt)}
                  </td>
                  <td className="px-5 py-3">
                    <span className="font-bold text-ink">{log.actorLabel ?? "—"}</span>
                    <span className="block text-xs text-ink-soft">{log.actorType}</span>
                  </td>
                  <td className="px-5 py-3">
                    <Badge tone={ACTION_TONE[log.action] ?? "neutral"}>{log.action}</Badge>
                  </td>
                  <td className="px-5 py-3 text-xs text-ink-soft">
                    {log.targetType ? `${log.targetType}:${log.targetId?.slice(0, 8)}` : "—"}
                    {log.metadata ? (
                      <span className="block">{log.metadata.slice(0, 80)}</span>
                    ) : null}
                  </td>
                  <td className="px-5 py-3 text-ink-soft">{log.ip ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <div className="mt-4 flex items-center justify-between text-sm text-ink-soft">
        <span>
          Página {page} de {totalPages} · {total} eventos
        </span>
        <div className="flex gap-2">
          {page > 1 ? (
            <a
              href={`/admin/auditoria?pagina=${page - 1}${acao ? `&acao=${acao}` : ""}`}
              className="rounded-full bg-white px-4 py-2 font-bold text-grape-600"
            >
              ← Anterior
            </a>
          ) : null}
          {page < totalPages ? (
            <a
              href={`/admin/auditoria?pagina=${page + 1}${acao ? `&acao=${acao}` : ""}`}
              className="rounded-full bg-white px-4 py-2 font-bold text-grape-600"
            >
              Próxima →
            </a>
          ) : null}
        </div>
      </div>

      <Card className="mt-8">
        <h2 className="text-lg font-extrabold text-ink">
          Últimas tentativas de login que falharam
        </h2>
        <ul className="mt-3 divide-y divide-grape-100 text-sm">
          {failedLogins.map((attempt) => (
            <li key={attempt.id} className="flex flex-wrap gap-3 py-2">
              <Badge tone={attempt.realm === "admin" ? "red" : "neutral"}>
                {attempt.realm}
              </Badge>
              <span className="flex-1 text-ink">{attempt.identifier}</span>
              <span className="text-ink-soft">{attempt.reason}</span>
              <span className="text-ink-soft">{attempt.ip ?? "—"}</span>
            </li>
          ))}
          {failedLogins.length === 0 ? (
            <li className="py-2 text-ink-soft">Nenhuma falha registrada.</li>
          ) : null}
        </ul>
      </Card>
    </>
  );
}
