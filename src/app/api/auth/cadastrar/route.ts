import { db } from "@/lib/db";
import { audit } from "@/lib/audit";
import { CONSENT_VERSION } from "@/lib/consent";
import { clientIp, isSameOrigin, jsonError, jsonOk, tooManyRequests, userAgent } from "@/lib/http";
import { checkPasswordStrength, hashPassword } from "@/lib/password";
import { LIMITS, hit } from "@/lib/rate-limit";
import { createFamilySession } from "@/lib/session";
import { fieldErrors, signupSchema } from "@/lib/validation";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return jsonError("Origem não permitida.", 403);

  const ip = clientIp(request);
  const limit = hit(`signup:${ip}`, LIMITS.signup.limit, LIMITS.signup.window);
  if (!limit.allowed) return tooManyRequests(limit.retryAfterSeconds);

  const body = await request.json().catch(() => null);
  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Confira os campos.", 400, { fields: fieldErrors(parsed.error) });
  }

  const { name, email, password, marketingOptIn } = parsed.data;

  const strength = checkPasswordStrength(password);
  if (!strength.ok) {
    return jsonError("Senha fraca.", 400, {
      fields: { password: strength.problems.join(" ") },
    });
  }

  const existing = await db.guardian.findUnique({ where: { email } });
  if (existing) {
    // Não revelamos que o e-mail já existe (evita enumeração de contas).
    // A orientação é sempre a mesma: tente entrar ou recupere a senha.
    return jsonError(
      "Não foi possível concluir o cadastro com esses dados. Se você já tem conta, use a tela de entrar.",
      409,
    );
  }

  const { hash, salt } = await hashPassword(password);

  const guardian = await db.guardian.create({
    data: {
      name,
      email,
      passwordHash: hash,
      passwordSalt: salt,
      marketingOptIn,
      consentAcceptedAt: new Date(),
      consentVersion: CONSENT_VERSION,
      consentIp: ip,
    },
  });

  await createFamilySession({
    guardianId: guardian.id,
    ip,
    userAgent: userAgent(request),
  });

  await audit({
    actorType: "guardian",
    actorId: guardian.id,
    actorLabel: guardian.email,
    action: "familia.cadastro",
    ip,
    userAgent: userAgent(request),
    metadata: { consentVersion: CONSENT_VERSION },
  });

  return jsonOk({ redirect: "/familia" }, 201);
}
