"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { audit } from "@/lib/audit";
import { db } from "@/lib/db";
import { getFamilySession, revokeAllFamilySessions, setActiveChild } from "@/lib/session";
import { childProfileSchema, fieldErrors } from "@/lib/validation";

/**
 * Server Actions da área da família.
 * O Next já protege Server Actions contra CSRF (checagem de Origin), então
 * aqui a preocupação é autorização: todo acesso a um perfil infantil é
 * filtrado por guardianId — nunca confiamos só no id vindo do formulário.
 */

export interface ActionState {
  error?: string;
  fields?: Record<string, string>;
  success?: string;
}

async function requireGuardian() {
  const session = await getFamilySession();
  if (!session) redirect("/entrar");
  return session;
}

async function requestMeta() {
  const store = await headers();
  return {
    ip: store.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
    userAgent: store.get("user-agent")?.slice(0, 400) ?? null,
  };
}

function parseProfileForm(formData: FormData) {
  const categories = formData.getAll("allowedCategories").map(String);
  return childProfileSchema.safeParse({
    nickname: String(formData.get("nickname") ?? ""),
    birthYear: Number(formData.get("birthYear") ?? 0),
    avatar: String(formData.get("avatar") ?? "panda"),
    themeColor: String(formData.get("themeColor") ?? "grape"),
    dailyLimitMinutes: Number(formData.get("dailyLimitMinutes") ?? 30),
    allowedCategories: categories.length > 0 ? categories : null,
    soundEnabled: formData.get("soundEnabled") === "on",
    musicEnabled: formData.get("musicEnabled") === "on",
  });
}

export async function criarPerfil(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireGuardian();
  const parsed = parseProfileForm(formData);
  if (!parsed.success) {
    return { error: "Confira os campos.", fields: fieldErrors(parsed.error) };
  }

  // Limite defensivo: evita que uma conta crie perfis sem fim.
  const count = await db.childProfile.count({
    where: { guardianId: session.guardian.id },
  });
  if (count >= 6) {
    return { error: "Você já tem o número máximo de 6 perfis nesta conta." };
  }

  const data = parsed.data;
  const child = await db.childProfile.create({
    data: {
      guardianId: session.guardian.id,
      nickname: data.nickname,
      birthYear: data.birthYear,
      avatar: data.avatar,
      themeColor: data.themeColor,
      dailyLimitMinutes: data.dailyLimitMinutes,
      allowedCategories: data.allowedCategories
        ? JSON.stringify(data.allowedCategories)
        : null,
      soundEnabled: data.soundEnabled ?? true,
      musicEnabled: data.musicEnabled ?? true,
    },
  });

  const meta = await requestMeta();
  await audit({
    actorType: "guardian",
    actorId: session.guardian.id,
    actorLabel: session.guardian.email,
    action: "familia.perfil.criar",
    targetType: "childProfile",
    targetId: child.id,
    ...meta,
  });

  revalidatePath("/familia");
  redirect("/familia");
}

export async function atualizarPerfil(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireGuardian();
  const childId = String(formData.get("childId") ?? "");

  const owned = await db.childProfile.findFirst({
    where: { id: childId, guardianId: session.guardian.id },
  });
  if (!owned) return { error: "Perfil não encontrado." };

  const parsed = parseProfileForm(formData);
  if (!parsed.success) {
    return { error: "Confira os campos.", fields: fieldErrors(parsed.error) };
  }

  const data = parsed.data;
  await db.childProfile.update({
    where: { id: owned.id },
    data: {
      nickname: data.nickname,
      birthYear: data.birthYear,
      avatar: data.avatar,
      themeColor: data.themeColor,
      dailyLimitMinutes: data.dailyLimitMinutes,
      allowedCategories: data.allowedCategories
        ? JSON.stringify(data.allowedCategories)
        : null,
      soundEnabled: data.soundEnabled ?? true,
      musicEnabled: data.musicEnabled ?? true,
    },
  });

  const meta = await requestMeta();
  await audit({
    actorType: "guardian",
    actorId: session.guardian.id,
    actorLabel: session.guardian.email,
    action: "familia.perfil.atualizar",
    targetType: "childProfile",
    targetId: owned.id,
    ...meta,
  });

  revalidatePath("/familia");
  return { success: "Perfil atualizado." };
}

export async function excluirPerfil(formData: FormData): Promise<void> {
  const session = await requireGuardian();
  const childId = String(formData.get("childId") ?? "");

  const owned = await db.childProfile.findFirst({
    where: { id: childId, guardianId: session.guardian.id },
  });
  if (!owned) redirect("/familia");

  // Exclusão real (não soft delete): direito à eliminação, LGPD art. 18, VI.
  await db.childProfile.delete({ where: { id: owned.id } });

  const meta = await requestMeta();
  await audit({
    actorType: "guardian",
    actorId: session.guardian.id,
    actorLabel: session.guardian.email,
    action: "familia.perfil.excluir",
    targetType: "childProfile",
    targetId: owned.id,
    ...meta,
  });

  revalidatePath("/familia");
  redirect("/familia");
}

/** Entra no modo criança com o perfil escolhido. */
export async function entrarModoCrianca(formData: FormData): Promise<void> {
  const session = await requireGuardian();
  const childId = String(formData.get("childId") ?? "");

  const owned = await db.childProfile.findFirst({
    where: { id: childId, guardianId: session.guardian.id, isActive: true },
  });
  if (!owned) redirect("/familia");

  await setActiveChild(session.sessionId, owned.id);
  redirect("/kids");
}

export async function encerrarOutrasSessoes(): Promise<void> {
  const session = await requireGuardian();
  await revokeAllFamilySessions(session.guardian.id);

  const meta = await requestMeta();
  await audit({
    actorType: "guardian",
    actorId: session.guardian.id,
    actorLabel: session.guardian.email,
    action: "familia.sessoes.revogar_todas",
    ...meta,
  });

  redirect("/entrar");
}

/** Direito à eliminação: apaga a conta e tudo que depende dela. */
export async function excluirConta(formData: FormData): Promise<void> {
  const session = await requireGuardian();
  const confirmation = String(formData.get("confirmacao") ?? "");
  if (confirmation.trim().toUpperCase() !== "EXCLUIR") redirect("/familia/conta");

  const meta = await requestMeta();
  await audit({
    actorType: "guardian",
    actorId: session.guardian.id,
    actorLabel: session.guardian.email,
    action: "familia.conta.excluir",
    ...meta,
  });

  // onDelete: Cascade remove perfis, progresso, sessões e tokens.
  await db.guardian.delete({ where: { id: session.guardian.id } });
  redirect("/");
}
