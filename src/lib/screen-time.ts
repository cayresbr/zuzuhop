import { db } from "./db";

/** Chave do dia local (YYYY-MM-DD), base dos limites diários. */
export function dayKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export interface ScreenTimeStatus {
  usedSeconds: number;
  limitSeconds: number;
  remainingSeconds: number;
  blocked: boolean;
}

export async function getScreenTimeStatus(
  childProfileId: string,
): Promise<ScreenTimeStatus> {
  const child = await db.childProfile.findUnique({
    where: { id: childProfileId },
    select: { dailyLimitMinutes: true },
  });
  const limitSeconds = (child?.dailyLimitMinutes ?? 30) * 60;

  const aggregate = await db.playSession.aggregate({
    where: { childProfileId, dayKey: dayKey() },
    _sum: { seconds: true },
  });

  const usedSeconds = aggregate._sum.seconds ?? 0;
  const remainingSeconds = Math.max(0, limitSeconds - usedSeconds);

  return {
    usedSeconds,
    limitSeconds,
    remainingSeconds,
    blocked: remainingSeconds <= 0,
  };
}

/** Soma tempo de brincadeira ao dia corrente. */
export async function addPlayTime(
  childProfileId: string,
  seconds: number,
): Promise<ScreenTimeStatus> {
  const safeSeconds = Math.max(0, Math.min(seconds, 900));
  if (safeSeconds > 0) {
    const key = dayKey();
    const existing = await db.playSession.findFirst({
      where: { childProfileId, dayKey: key, endedAt: null },
      orderBy: { startedAt: "desc" },
    });

    if (existing) {
      await db.playSession.update({
        where: { id: existing.id },
        data: { seconds: { increment: safeSeconds } },
      });
    } else {
      await db.playSession.create({
        data: { childProfileId, dayKey: key, seconds: safeSeconds },
      });
    }
  }
  return getScreenTimeStatus(childProfileId);
}
