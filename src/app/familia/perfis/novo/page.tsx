import { Card, PageTitle } from "@/components/ui";
import { criarPerfil } from "../../actions";
import { ProfileForm } from "../profile-form";

export const metadata = { title: "Novo perfil — Zuzuhop" };

export default function NovoPerfilPage() {
  return (
    <>
      <PageTitle
        title="Novo perfil"
        subtitle="Cada criança tem o seu espaço, com o próprio tempo de tela e progresso."
      />
      <Card>
        <ProfileForm
          action={criarPerfil}
          submitLabel="Criar perfil"
          initial={{
            nickname: "",
            birthYear: new Date().getFullYear() - 5,
            avatar: "panda",
            themeColor: "grape",
            dailyLimitMinutes: 30,
            allowedCategories: null,
            soundEnabled: true,
            musicEnabled: true,
          }}
        />
      </Card>
    </>
  );
}
