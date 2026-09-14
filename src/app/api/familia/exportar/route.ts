import { db } from "@/lib/db";
import { audit } from "@/lib/audit";
import { clientIp, jsonError, userAgent } from "@/lib/http";
import { getFamilySession } from "@/lib/session";

/**
 * Portabilidade de dados (LGPD art. 18, V): devolve em JSON tudo que a
 * plataforma guarda sobre a família — sem hashes de senha nem tokens.
 */
export async function GET(request: Request) {
  const session = await getFamilySession();
  if (!session) return jsonError("Não autenticado.", 401);

  const guardian = await db.guardian.findUnique({
    where: { id: session.guardian.id },
    include: {
      children: {
        include: {
          progress: { include: { game: { select: { slug: true, title: true } } } },
          playSessions: true,
          rewards: true,
        },
      },
    },
  });

  if (!guardian) return jsonError("Conta não encontrada.", 404);

  const payload = {
    exportadoEm: new Date().toISOString(),
    responsavel: {
      nome: guardian.name,
      email: guardian.email,
      plano: guardian.plan,
      criadoEm: guardian.createdAt,
      consentimento: {
        aceitoEm: guardian.consentAcceptedAt,
        versao: guardian.consentVersion,
      },
    },
    criancas: guardian.children.map((child) => ({
      apelido: child.nickname,
      anoNascimento: child.birthYear,
      avatar: child.avatar,
      limiteDiarioMinutos: child.dailyLimitMinutes,
      criadoEm: child.createdAt,
      progresso: child.progress.map((row) => ({
        jogo: row.game.title,
        slug: row.game.slug,
        vezesJogadas: row.timesPlayed,
        melhorPontuacao: row.bestScore,
        estrelas: row.stars,
        segundosTotais: row.totalSeconds,
        ultimaVezEm: row.lastPlayedAt,
      })),
      sessoesDeBrincadeira: child.playSessions.map((play) => ({
        dia: play.dayKey,
        segundos: play.seconds,
      })),
      conquistas: child.rewards.map((reward) => ({
        codigo: reward.code,
        em: reward.unlockedAt,
      })),
    })),
  };

  await audit({
    actorType: "guardian",
    actorId: guardian.id,
    actorLabel: guardian.email,
    action: "familia.dados.exportar",
    ip: clientIp(request),
    userAgent: userAgent(request),
  });

  return new Response(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="zuzuhop-meus-dados.json"`,
    },
  });
}
