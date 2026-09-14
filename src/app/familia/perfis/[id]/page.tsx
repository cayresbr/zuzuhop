import { notFound } from "next/navigation";
import { Card, PageTitle } from "@/components/ui";
import { db } from "@/lib/db";
import { getFamilySession } from "@/lib/session";
import { atualizarPerfil, excluirPerfil } from "../../actions";
import { ProfileForm } from "../profile-form";

export const dynamic = "force-dynamic";

export default async function EditarPerfilPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = (await getFamilySession())!;

  // O filtro por guardianId é a autorização: um id de outra família dá 404.
  const child = await db.childProfile.findFirst({
    where: { id, guardianId: session.guardian.id },
  });
  if (!child) notFound();

  const allowedCategories = child.allowedCategories
    ? (JSON.parse(child.allowedCategories) as string[])
    : null;

  return (
    <>
      <PageTitle title={`Perfil de ${child.nickname}`} />

      <Card>
        <ProfileForm
          action={atualizarPerfil}
          submitLabel="Salvar alterações"
          initial={{
            id: child.id,
            nickname: child.nickname,
            birthYear: child.birthYear,
            avatar: child.avatar,
            themeColor: child.themeColor,
            dailyLimitMinutes: child.dailyLimitMinutes,
            allowedCategories,
            soundEnabled: child.soundEnabled,
            musicEnabled: child.musicEnabled,
          }}
        />
      </Card>

      <Card className="mt-6 border-coral-100">
        <h2 className="text-lg font-extrabold text-ink">Excluir este perfil</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Apaga o perfil e todo o histórico de brincadeiras. Não dá para desfazer.
        </p>
        <form action={excluirPerfil} className="mt-4">
          <input type="hidden" name="childId" value={child.id} />
          <button
            type="submit"
            className="rounded-full bg-coral-500 px-5 py-3 font-bold text-white transition hover:bg-coral-600"
          >
            Excluir perfil de {child.nickname}
          </button>
        </form>
      </Card>
    </>
  );
}
