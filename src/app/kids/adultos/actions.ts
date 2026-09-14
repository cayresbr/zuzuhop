"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { audit } from "@/lib/audit";
import { hit } from "@/lib/rate-limit";
import { getFamilySession, setActiveChild } from "@/lib/session";
import { verifyChallenge } from "@/lib/parental-gate";

export interface GateState {
  error?: string;
}

export async function atravessarPortao(
  _state: GateState,
  formData: FormData,
): Promise<GateState> {
  const session = await getFamilySession();
  if (!session) redirect("/entrar");

  // Trava por conta: tentativa e erro em massa não vence o portão.
  const attempt = hit(`portao:${session.guardian.id}`, 10, 300);
  if (!attempt.allowed) {
    return { error: "Muitas tentativas. Aguarde alguns minutos." };
  }

  const token = String(formData.get("token") ?? "");
  const answer = String(formData.get("answer") ?? "");

  if (!verifyChallenge(token, answer)) {
    return { error: "Resposta incorreta. Tente de novo." };
  }

  // Sai do modo criança: limpa o perfil ativo da sessão.
  await setActiveChild(session.sessionId, null);

  const store = await headers();
  await audit({
    actorType: "guardian",
    actorId: session.guardian.id,
    actorLabel: session.guardian.email,
    action: "familia.portao_parental.sucesso",
    ip: store.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
    userAgent: store.get("user-agent")?.slice(0, 400) ?? null,
  });

  redirect("/familia");
}
