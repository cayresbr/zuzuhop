import { db } from "@/lib/db";
import { audit, recordLoginAttempt } from "@/lib/audit";
import { clientIp, isSameOrigin, jsonError, jsonOk, tooManyRequests, userAgent } from "@/lib/http";
import { fakeVerifyDelay, verifyPassword } from "@/lib/password";
import { LIMITS, hit } from "@/lib/rate-limit";
import { createAdminSession } from "@/lib/session";
import { verifyTotp } from "@/lib/totp";
import { adminLoginSchema } from "@/lib/validation";

const MAX_FAILURES = 5;
const LOCK_MINUTES = 30;
const GENERIC_ERROR = "Credenciais inválidas.";

/**
 * Login administrativo.
 *
 * Realm separado do das famílias: outra tabela, outro cookie, outro limite de
 * tentativas e segundo fator obrigatório (TOTP). Um vazamento de senha de
 * responsável não chega nem perto daqui.
 */
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return jsonError("Origem não permitida.", 403);

  const ip = clientIp(request);
  const agent = userAgent(request);

  const byIp = hit(`admin-login:ip:${ip}`, LIMITS.adminLogin.limit, LIMITS.adminLogin.window);
  if (!byIp.allowed) return tooManyRequests(byIp.retryAfterSeconds);

  const body = await request.json().catch(() => null);
  const parsed = adminLoginSchema.safeParse(body);
  if (!parsed.success) return jsonError(GENERIC_ERROR, 401);

  const { email, password, totp } = parsed.data;

  const byAccount = hit(
    `admin-login:acct:${email}`,
    LIMITS.adminLogin.limit,
    LIMITS.adminLogin.window,
  );
  if (!byAccount.allowed) return tooManyRequests(byAccount.retryAfterSeconds);

  const admin = await db.adminUser.findUnique({ where: { email } });

  if (!admin || admin.status !== "active") {
    await fakeVerifyDelay();
    await recordLoginAttempt({ realm: "admin", identifier: email, ip, success: false, reason: "inexistente_ou_inativo" });
    return jsonError(GENERIC_ERROR, 401);
  }

  if (admin.lockedUntil && admin.lockedUntil > new Date()) {
    await recordLoginAttempt({ realm: "admin", identifier: email, ip, success: false, reason: "bloqueado" });
    return jsonError("Conta bloqueada temporariamente.", 423);
  }

  const validPassword = await verifyPassword(password, admin.passwordHash, admin.passwordSalt);

  if (!validPassword) {
    const failures = admin.failedLoginCount + 1;
    await db.adminUser.update({
      where: { id: admin.id },
      data: {
        failedLoginCount: failures,
        lockedUntil:
          failures >= MAX_FAILURES ? new Date(Date.now() + LOCK_MINUTES * 60_000) : null,
      },
    });
    await recordLoginAttempt({ realm: "admin", identifier: email, ip, success: false, reason: "senha_invalida" });
    await audit({
      actorType: "system",
      action: "admin.login.falha",
      targetType: "adminUser",
      targetId: admin.id,
      ip,
      userAgent: agent,
      metadata: { tentativas: failures },
    });
    return jsonError(GENERIC_ERROR, 401);
  }

  // Segundo fator, quando já configurado.
  if (admin.totpEnabledAt && admin.totpSecret) {
    if (!totp) {
      return jsonOk({ needsTotp: true });
    }
    if (!verifyTotp(admin.totpSecret, totp)) {
      await db.adminUser.update({
        where: { id: admin.id },
        data: { failedLoginCount: admin.failedLoginCount + 1 },
      });
      await recordLoginAttempt({ realm: "admin", identifier: email, ip, success: false, reason: "totp_invalido" });
      return jsonError("Código de verificação inválido.", 401);
    }
  }

  await db.adminUser.update({
    where: { id: admin.id },
    data: { failedLoginCount: 0, lockedUntil: null, lastLoginAt: new Date() },
  });

  await createAdminSession({ adminId: admin.id, ip, userAgent: agent });
  await recordLoginAttempt({ realm: "admin", identifier: email, ip, success: true });
  await audit({
    actorType: "admin",
    actorId: admin.id,
    actorLabel: admin.email,
    action: "admin.login",
    ip,
    userAgent: agent,
  });

  // Sem 2FA configurado, o primeiro destino obrigatório é a configuração dele.
  const redirect = admin.totpEnabledAt ? "/admin" : "/admin/seguranca";
  return jsonOk({ redirect });
}
