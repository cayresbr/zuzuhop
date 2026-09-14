import { redirect } from "next/navigation";
import { Badge, Card, PageTitle } from "@/components/ui";
import { db } from "@/lib/db";
import { can, getAdminSession } from "@/lib/session";
import { alterarStatusAdmin } from "../actions";
import { NovoAdminForm } from "./novo-admin-form";

export const dynamic = "force-dynamic";

export default async function AdminsPage() {
  const session = (await getAdminSession())!;
  if (!can(session.admin.role, "admins:gerenciar")) redirect("/admin");

  const admins = await db.adminUser.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <>
      <PageTitle
        title="Administradores"
        subtitle="Quem tem acesso ao painel e com qual nível de permissão."
      />

      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="bg-grape-50 text-xs uppercase tracking-wide text-ink-soft">
            <tr>
              <th className="px-5 py-3">Administrador</th>
              <th className="px-5 py-3">Papel</th>
              <th className="px-5 py-3">2FA</th>
              <th className="px-5 py-3">Situação</th>
              <th className="px-5 py-3">Último acesso</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-grape-100">
            {admins.map((admin) => (
              <tr key={admin.id}>
                <td className="px-5 py-4">
                  <p className="font-bold text-ink">{admin.name}</p>
                  <p className="text-xs text-ink-soft">{admin.email}</p>
                </td>
                <td className="px-5 py-4">
                  <Badge tone={admin.role === "superadmin" ? "amber" : "neutral"}>
                    {admin.role}
                  </Badge>
                </td>
                <td className="px-5 py-4">
                  <Badge tone={admin.totpEnabledAt ? "green" : "red"}>
                    {admin.totpEnabledAt ? "ativo" : "pendente"}
                  </Badge>
                </td>
                <td className="px-5 py-4">
                  <Badge tone={admin.status === "active" ? "green" : "red"}>
                    {admin.status}
                  </Badge>
                </td>
                <td className="px-5 py-4 text-ink-soft">
                  {admin.lastLoginAt
                    ? new Intl.DateTimeFormat("pt-BR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      }).format(admin.lastLoginAt)
                    : "—"}
                </td>
                <td className="px-5 py-4 text-right">
                  {admin.id === session.admin.id ? (
                    <span className="text-xs text-ink-soft">você</span>
                  ) : (
                    <form action={alterarStatusAdmin}>
                      <input type="hidden" name="adminId" value={admin.id} />
                      <input
                        type="hidden"
                        name="status"
                        value={admin.status === "active" ? "suspended" : "active"}
                      />
                      <button
                        type="submit"
                        className="font-bold text-grape-600 hover:underline"
                      >
                        {admin.status === "active" ? "Suspender" : "Reativar"}
                      </button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card className="mt-8">
        <h2 className="text-lg font-extrabold text-ink">Novo administrador</h2>
        <p className="mt-1 text-sm text-ink-soft">
          A senha definida aqui é temporária: o novo administrador precisa
          trocá-la e configurar o segundo fator no primeiro acesso.
        </p>
        <NovoAdminForm />
      </Card>
    </>
  );
}
