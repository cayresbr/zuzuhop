import { db } from "@/lib/db";
import { isSameOrigin, jsonError, jsonOk, tooManyRequests } from "@/lib/http";
import { LIMITS, hit } from "@/lib/rate-limit";
import { getFamilySession } from "@/lib/session";
import { addPlayTime, getScreenTimeStatus } from "@/lib/screen-time";
import { progressSchema } from "@/lib/validation";

/**
 * Recebe o heartbeat do jogo: tempo brincado + resultado da partida.
 *
 * O tempo de tela é contabilizado aqui, no servidor. Alterar o relógio do
 * tablet ou mexer no JavaScript do cliente não estende o limite diário.
 */
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return jsonError("Origem não permitida.", 403);

  const session = await getFamilySession();
  if (!session) return jsonError("Sessão expirada.", 401);
  if (!session.activeChildId) return jsonError("Nenhum perfil ativo.", 400);

  const limit = hit(
    `progresso:${session.activeChildId}`,
    LIMITS.mutation.limit,
    LIMITS.mutation.window,
  );
  if (!limit.allowed) return tooManyRequests(limit.retryAfterSeconds);

  const body = await request.json().catch(() => null);
  const parsed = progressSchema.safeParse(body);
  if (!parsed.success) return jsonError("Dados inválidos.", 400);

  const { gameSlug, seconds, score, stars } = parsed.data;

  // Confirma que o perfil ativo realmente pertence a esta conta.
  const child = await db.childProfile.findFirst({
    where: { id: session.activeChildId, guardianId: session.guardian.id },
  });
  if (!child) return jsonError("Perfil não encontrado.", 404);

  const game = await db.game.findUnique({ where: { slug: gameSlug } });
  if (!game || !game.isActive) return jsonError("Jogo indisponível.", 404);

  const status = seconds > 0
    ? await addPlayTime(child.id, seconds)
    : await getScreenTimeStatus(child.id);

  // Só grava resultado quando a partida terminou (score/estrelas informados).
  if (score > 0 || stars > 0) {
    const existing = await db.gameProgress.findUnique({
      where: { childProfileId_gameId: { childProfileId: child.id, gameId: game.id } },
    });

    await db.gameProgress.upsert({
      where: { childProfileId_gameId: { childProfileId: child.id, gameId: game.id } },
      create: {
        childProfileId: child.id,
        gameId: game.id,
        timesPlayed: 1,
        bestScore: score,
        stars,
        totalSeconds: seconds,
        lastPlayedAt: new Date(),
      },
      update: {
        timesPlayed: { increment: 1 },
        bestScore: Math.max(existing?.bestScore ?? 0, score),
        stars: Math.max(existing?.stars ?? 0, stars),
        totalSeconds: { increment: seconds },
        lastPlayedAt: new Date(),
      },
    });
  } else if (seconds > 0) {
    await db.gameProgress
      .update({
        where: { childProfileId_gameId: { childProfileId: child.id, gameId: game.id } },
        data: { totalSeconds: { increment: seconds }, lastPlayedAt: new Date() },
      })
      .catch(() => undefined);
  }

  return jsonOk({
    screenTime: {
      remainingSeconds: status.remainingSeconds,
      blocked: status.blocked,
    },
  });
}
