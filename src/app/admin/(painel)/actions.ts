"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { z } from "zod";
import { audit } from "@/lib/audit";
import { db } from "@/lib/db";
import { checkPasswordStrength, hashPassword } from "@/lib/password";
import {
  can,
  getAdminSession,
  type AdminPermission,
  type AdminSessionInfo,
} from "@/lib/session";
import { generateTotpSecret, verifyTotp } from "@/lib/totp";
import { emailSchema } from "@/lib/validation";

export interface AdminActionState {
  error?: string;
  success?: string;
  secret?: string;
}

/**
 * Toda ação administrativa passa por aqui: exige sessão válida, checa a
 * permissão do papel e devolve o ator para o log de auditoria.
 */
async function requireAdmin(permission: AdminPermission): Promise<AdminSessionInfo> {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  if (!can(session.admin.role, permission)) {
    throw new Error("Seu perfil não tem permissão para esta ação.");
  }
  return session;
}

async function meta() {
  const store = await headers();
  return {
    ip: store.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
    userAgent: store.get("user-agent")?.slice(0, 400) ?? null,
  };
}

async function log(
  session: AdminSessionInfo,
  action: string,
  target?: { type: string; id: string },
  metadata?: Record<string, unknown>,
) {
  await audit({
    actorType: "admin",
    actorId: session.admin.id,
    actorLabel: session.admin.email,
    action,
    targetType: target?.type,
    targetId: target?.id,
    metadata,
    ...(await meta()),
  });
}

// ---------------------------------------------------------------------------
// Famílias
// ---------------------------------------------------------------------------

export async function alterarStatusFamilia(formData: FormData): Promise<void> {
  const session = await requireAdmin("familias:escrever");
  const guardianId = String(formData.get("guardianId") ?? "");
  const status = String(formData.get("status") ?? "");

  if (!["active", "suspended"].includes(status)) return;

  await db.guardian.update({ where: { id: guardianId }, data: { status } });
  // Suspender derruba as sessões abertas imediatamente.
  if (status === "suspended") {
    await db.guardianSession.updateMany({
      where: { guardianId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  await log(session, "admin.familia.status", { type: "guardian", id: guardianId }, { status });
  revalidatePath("/admin/familias");
  revalidatePath(`/admin/familias/${guardianId}`);
}

export async function alterarPlanoFamilia(formData: FormData): Promise<void> {
  const session = await requireAdmin("familias:escrever");
  const guardianId = String(formData.get("guardianId") ?? "");
  const plan = String(formData.get("plan") ?? "");

  if (!["free", "plus"].includes(plan)) return;

  await db.guardian.update({ where: { id: guardianId }, data: { plan } });
  await log(session, "admin.familia.plano", { type: "guardian", id: guardianId }, { plan });
  revalidatePath(`/admin/familias/${guardianId}`);
}

export async function excluirFamilia(formData: FormData): Promise<void> {
  const session = await requireAdmin("familias:escrever");
  const guardianId = String(formData.get("guardianId") ?? "");
  const confirmation = String(formData.get("confirmacao") ?? "");
  if (confirmation.trim().toUpperCase() !== "EXCLUIR") return;

  const guardian = await db.guardian.findUnique({ where: { id: guardianId } });
  if (!guardian) return;

  await db.guardian.delete({ where: { id: guardianId } });
  await log(
    session,
    "admin.familia.excluir",
    { type: "guardian", id: guardianId },
    { email: guardian.email },
  );
  redirect("/admin/familias");
}

// ---------------------------------------------------------------------------
// Conteúdo
// ---------------------------------------------------------------------------

export async function alternarJogo(formData: FormData): Promise<void> {
  const session = await requireAdmin("conteudo:escrever");
  const gameId = String(formData.get("gameId") ?? "");

  const game = await db.game.findUnique({ where: { id: gameId } });
  if (!game) return;

  await db.game.update({ where: { id: gameId }, data: { isActive: !game.isActive } });
  await log(
    session,
    "admin.conteudo.alternar",
    { type: "game", id: gameId },
    { slug: game.slug, isActive: !game.isActive },
  );
  revalidatePath("/admin/conteudo");
}

export async function alternarPremium(formData: FormData): Promise<void> {
  const session = await requireAdmin("conteudo:escrever");
  const gameId = String(formData.get("gameId") ?? "");

  const game = await db.game.findUnique({ where: { id: gameId } });
  if (!game) return;

  await db.game.update({ where: { id: gameId }, data: { isPremium: !game.isPremium } });
  await log(
    session,
    "admin.conteudo.premium",
    { type: "game", id: gameId },
    { slug: game.slug, isPremium: !game.isPremium },
  );
  revalidatePath("/admin/conteudo");
}

// ---------------------------------------------------------------------------
// Administradores
// ---------------------------------------------------------------------------

const novoAdminSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: emailSchema,
  password: z.string().min(10).max(200),
  role: z.enum(["superadmin", "suporte", "conteudo"]),
});

export async function criarAdmin(
  _state: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const session = await requireAdmin("admins:gerenciar");

  const parsed = novoAdminSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  });
  if (!parsed.success) return { error: "Confira os campos do formulário." };

  const strength = checkPasswordStrength(parsed.data.password);
  if (!strength.ok) return { error: strength.problems.join(" ") };

  const existing = await db.adminUser.findUnique({ where: { email: parsed.data.email } });
  if (existing) return { error: "Já existe um administrador com este e-mail." };

  const { hash, salt } = await hashPassword(parsed.data.password);
  const created = await db.adminUser.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      role: parsed.data.role,
      passwordHash: hash,
      passwordSalt: salt,
      // Senha temporária: quem recebe é obrigado a trocar no primeiro acesso.
      mustChangePassword: true,
    },
  });

  await log(
    session,
    "admin.admins.criar",
    { type: "adminUser", id: created.id },
    { email: created.email, role: created.role },
  );
  revalidatePath("/admin/admins");
  return { success: `Administrador ${created.email} criado.` };
}

export async function alterarStatusAdmin(formData: FormData): Promise<void> {
  const session = await requireAdmin("admins:gerenciar");
  const adminId = String(formData.get("adminId") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!["active", "suspended"].includes(status)) return;

  // Ninguém se suspende sozinho: evita trancar o próprio painel.
  if (adminId === session.admin.id) return;

  await db.adminUser.update({ where: { id: adminId }, data: { status } });
  if (status === "suspended") {
    await db.adminSession.updateMany({
      where: { adminId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  await log(session, "admin.admins.status", { type: "adminUser", id: adminId }, { status });
  revalidatePath("/admin/admins");
}

// ---------------------------------------------------------------------------
// Segundo fator do próprio administrador
// ---------------------------------------------------------------------------

export async function gerarSegredoTotp(): Promise<AdminActionState> {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const secret = generateTotpSecret();
  // Guardado como pendente: só passa a valer após confirmar um código válido.
  await db.adminUser.update({
    where: { id: session.admin.id },
    data: { totpSecret: secret, totpEnabledAt: null },
  });

  return { secret };
}

export async function confirmarTotp(
  _state: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const code = String(formData.get("code") ?? "");
  const admin = await db.adminUser.findUnique({ where: { id: session.admin.id } });
  if (!admin?.totpSecret) return { error: "Gere um novo segredo antes de confirmar." };

  if (!verifyTotp(admin.totpSecret, code)) {
    return { error: "Código inválido. Confira o relógio do aparelho e tente de novo." };
  }

  await db.adminUser.update({
    where: { id: admin.id },
    data: { totpEnabledAt: new Date() },
  });

  await log(session, "admin.seguranca.2fa_ativado", { type: "adminUser", id: admin.id });
  revalidatePath("/admin/seguranca");
  return { success: "Verificação em duas etapas ativada." };
}

export async function trocarSenhaAdmin(
  _state: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const nova = String(formData.get("novaSenha") ?? "");
  const strength = checkPasswordStrength(nova);
  if (!strength.ok) return { error: strength.problems.join(" ") };

  const { hash, salt } = await hashPassword(nova);
  await db.adminUser.update({
    where: { id: session.admin.id },
    data: { passwordHash: hash, passwordSalt: salt, mustChangePassword: false },
  });

  // Troca de senha invalida as outras sessões do mesmo administrador.
  await db.adminSession.updateMany({
    where: { adminId: session.admin.id, revokedAt: null, NOT: { id: session.sessionId } },
    data: { revokedAt: new Date() },
  });

  await log(session, "admin.seguranca.senha_alterada", {
    type: "adminUser",
    id: session.admin.id,
  });
  return { success: "Senha alterada." };
}
