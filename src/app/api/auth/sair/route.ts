import { isSameOrigin, jsonError, jsonOk } from "@/lib/http";
import { destroyFamilySession } from "@/lib/session";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return jsonError("Origem não permitida.", 403);
  await destroyFamilySession();
  return jsonOk({ redirect: "/" });
}
