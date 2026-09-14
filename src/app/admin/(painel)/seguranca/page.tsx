import QRCode from "qrcode";
import { Badge, Card, PageTitle } from "@/components/ui";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/session";
import { buildOtpAuthUri } from "@/lib/totp";
import { TotpSetup } from "./totp-setup";
import { TrocarSenhaForm } from "./trocar-senha-form";

export const dynamic = "force-dynamic";

export default async function SegurancaPage() {
  const session = (await getAdminSession())!;

  const admin = await db.adminUser.findUnique({ where: { id: session.admin.id } });
  if (!admin) return null;

  // Se já existe um segredo pendente, mostramos o QR para concluir a ativação.
  let qrDataUrl: string | null = null;
  if (admin.totpSecret && !admin.totpEnabledAt) {
    const uri = buildOtpAuthUri({ secret: admin.totpSecret, account: admin.email });
    qrDataUrl = await QRCode.toDataURL(uri, { margin: 1, width: 220 });
  }

  return (
    <>
      <PageTitle
        title="Minha segurança"
        subtitle="Senha e verificação em duas etapas da sua conta administrativa."
      />

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-extrabold text-ink">Verificação em duas etapas</h2>
          <Badge tone={admin.totpEnabledAt ? "green" : "red"}>
            {admin.totpEnabledAt ? "ativa" : "não configurada"}
          </Badge>
        </div>
        <p className="mt-2 text-sm text-ink-soft">
          Obrigatória para contas administrativas. Use um aplicativo autenticador
          (Google Authenticator, Authy, 1Password, Bitwarden).
        </p>

        <TotpSetup
          enabled={Boolean(admin.totpEnabledAt)}
          secret={admin.totpEnabledAt ? null : admin.totpSecret}
          qrDataUrl={qrDataUrl}
        />
      </Card>

      <Card className="mt-6">
        <h2 className="text-lg font-extrabold text-ink">Alterar senha</h2>
        {admin.mustChangePassword ? (
          <p className="mt-2 rounded-2xl bg-mango-100 px-4 py-3 text-sm font-bold text-mango-600">
            Você ainda está usando a senha temporária. Troque agora.
          </p>
        ) : null}
        <p className="mt-2 text-sm text-ink-soft">
          Trocar a senha encerra suas outras sessões automaticamente.
        </p>
        <TrocarSenhaForm />
      </Card>
    </>
  );
}
