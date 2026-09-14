import { redirect } from "next/navigation";
import { getFamilySession } from "@/lib/session";

export const metadata = { title: "Zuzuhop" };

export default async function KidsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // O modo criança vive dentro da sessão da família: nenhuma rota /kids é
  // acessível sem que um adulto tenha entrado antes.
  const session = await getFamilySession();
  if (!session) redirect("/entrar");

  return <div className="kid-mode min-h-screen">{children}</div>;
}
