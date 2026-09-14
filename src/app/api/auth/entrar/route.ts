import { db } from "@/lib/db";
import { audit, recordLoginAttempt } from "@/lib/audit";
import { clientIp, isSameOrigin, jsonError, jsonOk, tooManyRequests, userAgent } from "@/lib/http";
import { fakeVerifyDelay, verifyPassword } from "@/lib/password";
import { LIMITS, hit } from "@/lib/rate-limit";
import { createFamilySession } from "@/lib/session";
import { loginSchema } from "@/lib/validation";

const MAX_FAILURES = 6;
const LOCK_MINUTES = 15;

// Mensagem única para qualquer falha: nunca dizemos se o e-mail existe.
const GENERIC_ERROR = "E-mail ou senha incorretos.";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return jsonError("Origem não permitida.", 403);

  const ip = clientIp(request);
  const agent = userAgent(request);

  const byIp = hit(`login:ip:${ip}`, LIMITS.login.limit, LIMITS.login.window);
  if (!byIp.allowed) return tooManyRequests(byIp.retryAfterSeconds);

  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) return jsonError(GENERIC_ERROR, 401);

  const { email, password } = parsed.data;

  const byAccount = hit(`login:acct:${email}`, LIMITS.login.limit, LIMITS.login.window);
  if (!byAccount.allowed) return tooManyRequests(byAccount.retryAfterSeconds);

  const guardian = await db.guardian.findUnique({ where: { email } });

  if (!guardian || guardian.status !== "active" || guardian.deletedAt) {
    // Gasta o mesmo tempo de um hash real: o atacante não distingue pelo timing.
    await fakeVerifyDelay();
    await recordLoginAttempt({ realm: "guardian", identifier: email, ip, success: false, reason: "inexistente_ou_inativa" });
    return jsonError(GENERIC_ERROR, 401);
  }

  if (guardian.lockedUntil && guardian.lockedUntil > new Date()) {
    await recordLoginAttempt({ realm: "guardian", identifier: email, ip, success: false, reason: "bloqueada" });
    return jsonError(
      `Conta temporariamente bloqueada por excesso de tentativas. Tente novamente em alguns minutos.`,
      423,
    );
  }

  const valid = await verifyPassword(password, guardian.passwordHash, guardian.passwordSalt);

  if (!valid) {
    const failures = guardian.failedLoginCount + 1;
    await db.guardian.update({
      where: { id: guardian.id },
      data: {
        failedLoginCount: failures,
        lockedUntil:
          failures >= MAX_FAILURES
            ? new Date(Date.now() + LOCK_MINUTES * 60_000)
            : null,
      },
    });
    await recordLoginAttempt({ realm: "guardian", identifier: email, ip, success: false, reason: "senha_invalida" });
    return jsonError(GENERIC_ERROR, 401);
  }

  await db.guardian.update({
    where: { id: guardian.id },
    data: { failedLoginCount: 0, lockedUntil: null, lastLoginAt: new Date() },
  });

  await createFamilySession({ guardianId: guardian.id, ip, userAgent: agent });
  await recordLoginAttempt({ realm: "guardian", identifier: email, ip, success: true });
  await audit({
    actorType: "guardian",
    actorId: guardian.id,
    actorLabel: guardian.email,
    action: "familia.login",
    ip,
    userAgent: agent,
  });

  return jsonOk({ redirect: "/familia" });
}
