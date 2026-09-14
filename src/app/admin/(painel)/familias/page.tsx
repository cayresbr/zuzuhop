import Link from "next/link";
import { Badge, Card, EmptyState, PageTitle } from "@/components/ui";
import { db } from "@/lib/db";
import { can, getAdminSession } from "@/lib/session";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function FamiliasPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = (await getAdminSession())!;
  if (!can(session.admin.role, "familias:ler")) redirect("/admin");

  const { q } = await searchParams;
  const term = q?.trim() ?? "";

  const guardians = await db.guardian.findMany({
    where: term
      ? {
          OR: [
            { email: { contains: term } },
            { name: { contains: term } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { _count: { select: { children: true } } },
  });

  return (
    <>
      <PageTitle
        title="Famílias"
        subtitle="Contas de responsáveis cadastradas na plataforma."
      />

      <Card className="mb-6">
        <form className="flex flex-wrap gap-3">
          <input
            name="q"
            defaultValue={term}
            placeholder="Buscar por nome ou e-mail"
            className="flex-1 rounded-2xl border-2 border-grape-100 px-4 py-3 outline-none focus:border-grape-500"
          />
          <button
            type="submit"
            className="rounded-full bg-grape-500 px-6 py-3 font-bold text-white"
          >
            Buscar
          </button>
        </form>
      </Card>

      {guardians.length === 0 ? (
        <EmptyState emoji="🔍" title="Nenhuma família encontrada" />
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-grape-50 text-xs uppercase tracking-wide text-ink-soft">
              <tr>
                <th className="px-5 py-3">Responsável</th>
                <th className="px-5 py-3">Perfis</th>
                <th className="px-5 py-3">Plano</th>
                <th className="px-5 py-3">Situação</th>
                <th className="px-5 py-3">Cadastro</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-grape-100">
              {guardians.map((guardian) => (
                <tr key={guardian.id}>
                  <td className="px-5 py-4">
                    <p className="font-bold text-ink">{guardian.name}</p>
                    <p className="text-xs text-ink-soft">{guardian.email}</p>
                  </td>
                  <td className="px-5 py-4">{guardian._count.children}</td>
                  <td className="px-5 py-4">
                    <Badge tone={guardian.plan === "plus" ? "green" : "neutral"}>
                      {guardian.plan}
                    </Badge>
                  </td>
                  <td className="px-5 py-4">
                    <Badge tone={guardian.status === "active" ? "green" : "red"}>
                      {guardian.status === "active" ? "ativa" : "suspensa"}
                    </Badge>
                  </td>
                  <td className="px-5 py-4 text-ink-soft">
                    {new Intl.DateTimeFormat("pt-BR").format(guardian.createdAt)}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/admin/familias/${guardian.id}`}
                      className="font-bold text-grape-600 hover:underline"
                    >
                      Abrir
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </>
  );
}
