import { db } from "./db";

export interface AuditInput {
  actorType: "admin" | "guardian" | "system";
  actorId?: string | null;
  actorLabel?: string | null;
  action: string;
  targetType?: string | null;
  targetId?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, unknown> | null;
}

/**
 * Grava no log de auditoria. Nunca lança: uma falha de auditoria não pode
 * derrubar a operação principal, mas é reportada no console.
 */
export async function audit(input: AuditInput): Promise<void> {
  try {
    await db.auditLog.create({
      data: {
        actorType: input.actorType,
        actorId: input.actorId ?? null,
        actorLabel: input.actorLabel ?? null,
        action: input.action,
        targetType: input.targetType ?? null,
        targetId: input.targetId ?? null,
        ip: input.ip ?? null,
        userAgent: input.userAgent ?? null,
        metadata: input.metadata ? JSON.stringify(input.metadata) : null,
      },
    });
  } catch (error) {
    console.error("[audit] falha ao registrar evento", input.action, error);
  }
}

export async function recordLoginAttempt(params: {
  realm: "guardian" | "admin";
  identifier: string;
  ip?: string | null;
  success: boolean;
  reason?: string;
}): Promise<void> {
  try {
    await db.loginAttempt.create({
      data: {
        realm: params.realm,
        identifier: params.identifier.toLowerCase().slice(0, 200),
        ip: params.ip ?? null,
        success: params.success,
        reason: params.reason ?? null,
      },
    });
  } catch (error) {
    console.error("[audit] falha ao registrar tentativa de login", error);
  }
}
