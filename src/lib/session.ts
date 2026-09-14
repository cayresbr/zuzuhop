import { cookies } from "next/headers";
import { db } from "./db";
import { env } from "./env";
import { generateToken, hashToken } from "./tokens";

/**
 * Dois realms de sessão completamente separados:
 *  - família (responsável)  -> cookie `zh_family`
 *  - administração          -> cookie `zh_admin`, path restrito a /admin
 *
 * Cookies distintos, tabelas distintas e tempos de vida distintos. Um vazamento
 * do cookie da família nunca dá acesso ao painel administrativo.
 */

export const FAMILY_COOKIE = "zh_family";
export const ADMIN_COOKIE = "zh_admin";

const FAMILY_TTL_DAYS = 30;
const ADMIN_TTL_HOURS = 8;

function baseCookieOptions() {
  return {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: "lax" as const,
    path: "/",
  };
}

// ---------------------------------------------------------------------------
// Família (responsável)
// ---------------------------------------------------------------------------

export async function createFamilySession(params: {
  guardianId: string;
  ip?: string | null;
  userAgent?: string | null;
}): Promise<string> {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + FAMILY_TTL_DAYS * 86_400_000);

  await db.guardianSession.create({
    data: {
      guardianId: params.guardianId,
      tokenHash: hashToken(token),
      ip: params.ip ?? null,
      userAgent: params.userAgent ?? null,
      expiresAt,
    },
  });

  const store = await cookies();
  store.set(FAMILY_COOKIE, token, { ...baseCookieOptions(), expires: expiresAt });
  return token;
}

export interface FamilySession {
  sessionId: string;
  activeChildId: string | null;
  guardian: {
    id: string;
    email: string;
    name: string;
    plan: string;
    status: string;
    emailVerifiedAt: Date | null;
  };
}

export async function getFamilySession(): Promise<FamilySession | null> {
  const store = await cookies();
  const token = store.get(FAMILY_COOKIE)?.value;
  if (!token) return null;

  const session = await db.guardianSession.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { guardian: true },
  });

  if (!session || session.revokedAt || session.expiresAt <= new Date()) return null;
  if (session.guardian.status !== "active" || session.guardian.deletedAt) return null;

  // Atualiza lastUsedAt no máximo a cada 5 minutos (evita escrita a cada request).
  if (Date.now() - session.lastUsedAt.getTime() > 300_000) {
    await db.guardianSession
      .update({ where: { id: session.id }, data: { lastUsedAt: new Date() } })
      .catch(() => undefined);
  }

  return {
    sessionId: session.id,
    activeChildId: session.activeChildId,
    guardian: {
      id: session.guardian.id,
      email: session.guardian.email,
      name: session.guardian.name,
      plan: session.guardian.plan,
      status: session.guardian.status,
      emailVerifiedAt: session.guardian.emailVerifiedAt,
    },
  };
}

export async function setActiveChild(
  sessionId: string,
  childId: string | null,
): Promise<void> {
  await db.guardianSession.update({
    where: { id: sessionId },
    data: { activeChildId: childId },
  });
}

export async function destroyFamilySession(): Promise<void> {
  const store = await cookies();
  const token = store.get(FAMILY_COOKIE)?.value;
  if (token) {
    await db.guardianSession
      .updateMany({
        where: { tokenHash: hashToken(token) },
        data: { revokedAt: new Date() },
      })
      .catch(() => undefined);
  }
  store.delete(FAMILY_COOKIE);
}

export async function revokeAllFamilySessions(guardianId: string): Promise<void> {
  await db.guardianSession.updateMany({
    where: { guardianId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

// ---------------------------------------------------------------------------
// Administração
// ---------------------------------------------------------------------------

export async function createAdminSession(params: {
  adminId: string;
  ip?: string | null;
  userAgent?: string | null;
}): Promise<string> {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + ADMIN_TTL_HOURS * 3_600_000);

  await db.adminSession.create({
    data: {
      adminId: params.adminId,
      tokenHash: hashToken(token),
      ip: params.ip ?? null,
      userAgent: params.userAgent ?? null,
      expiresAt,
    },
  });

  const store = await cookies();
  store.set(ADMIN_COOKIE, token, {
    ...baseCookieOptions(),
    path: "/",
    expires: expiresAt,
  });
  return token;
}

export interface AdminSessionInfo {
  sessionId: string;
  admin: {
    id: string;
    email: string;
    name: string;
    role: string;
    mustChangePassword: boolean;
    totpEnabledAt: Date | null;
  };
}

export async function getAdminSession(): Promise<AdminSessionInfo | null> {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  if (!token) return null;

  const session = await db.adminSession.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { admin: true },
  });

  if (!session || session.revokedAt || session.expiresAt <= new Date()) return null;
  if (session.admin.status !== "active") return null;

  if (Date.now() - session.lastUsedAt.getTime() > 60_000) {
    await db.adminSession
      .update({ where: { id: session.id }, data: { lastUsedAt: new Date() } })
      .catch(() => undefined);
  }

  return {
    sessionId: session.id,
    admin: {
      id: session.admin.id,
      email: session.admin.email,
      name: session.admin.name,
      role: session.admin.role,
      mustChangePassword: session.admin.mustChangePassword,
      totpEnabledAt: session.admin.totpEnabledAt,
    },
  };
}

export async function destroyAdminSession(): Promise<void> {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  if (token) {
    await db.adminSession
      .updateMany({
        where: { tokenHash: hashToken(token) },
        data: { revokedAt: new Date() },
      })
      .catch(() => undefined);
  }
  store.delete(ADMIN_COOKIE);
}

/** Permissões por papel administrativo. */
export const ADMIN_PERMISSIONS = {
  superadmin: [
    "familias:ler",
    "familias:escrever",
    "conteudo:ler",
    "conteudo:escrever",
    "admins:gerenciar",
    "auditoria:ler",
  ],
  suporte: ["familias:ler", "familias:escrever", "conteudo:ler", "auditoria:ler"],
  conteudo: ["conteudo:ler", "conteudo:escrever"],
} as const;

export type AdminPermission =
  (typeof ADMIN_PERMISSIONS)[keyof typeof ADMIN_PERMISSIONS][number];

export function can(role: string, permission: AdminPermission): boolean {
  const list = ADMIN_PERMISSIONS[role as keyof typeof ADMIN_PERMISSIONS];
  return Boolean(list && (list as readonly string[]).includes(permission));
}
