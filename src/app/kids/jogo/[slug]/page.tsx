import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getFamilySession } from "@/lib/session";
import { getScreenTimeStatus } from "@/lib/screen-time";
import { getGame } from "@/games/catalog";
import { GamePlayer } from "../../game-player";

export const dynamic = "force-dynamic";

export default async function JogoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = (await getFamilySession())!;
  if (!session.activeChildId) redirect("/kids");

  const child = await db.childProfile.findFirst({
    where: { id: session.activeChildId, guardianId: session.guardian.id },
  });
  if (!child) redirect("/kids");

  // Limite diário: checado no servidor antes de sequer renderizar o jogo.
  const screenTime = await getScreenTimeStatus(child.id);
  if (screenTime.blocked) redirect("/kids/fim");

  const game = await db.game.findUnique({ where: { slug } });
  if (!game || !game.isActive) notFound();

  // Autorização de conteúdo: categoria liberada pelo responsável e plano.
  const allowedCategories = child.allowedCategories
    ? (JSON.parse(child.allowedCategories) as string[])
    : null;
  if (allowedCategories && !allowedCategories.includes(game.category)) {
    redirect("/kids");
  }
  if (game.isPremium && session.guardian.plan !== "plus") redirect("/kids");

  // O catálogo é a fonte da verdade do que existe; o componente em si é
  // resolvido no cliente (ver comentário em games/registry.ts).
  if (!getGame(slug)) notFound();

  return (
    <GamePlayer slug={slug} soundEnabled={child.soundEnabled} color={game.color} />
  );
}
