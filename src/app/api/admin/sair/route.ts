import { audit } from "@/lib/audit";
import { clientIp, isSameOrigin, jsonError, jsonOk, userAgent } from "@/lib/http";
import { destroyAdminSession, getAdminSession } from "@/lib/session";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return jsonError("Origem não permitida.", 403);

  const session = await getAdminSession();
  if (session) {
    await audit({
      actorType: "admin",
      actorId: session.admin.id,
      actorLabel: session.admin.email,
      action: "admin.logout",
      ip: clientIp(request),
      userAgent: userAgent(request),
    });
  }

  await destroyAdminSession();
  return jsonOk({ redirect: "/admin/login" });
}
