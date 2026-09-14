import { NextResponse } from "next/server";
import { env } from "./env";

export function clientIp(req: Request): string {
  const headers = req.headers;
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return headers.get("x-real-ip") ?? "desconhecido";
}

export function userAgent(req: Request): string {
  return (req.headers.get("user-agent") ?? "").slice(0, 400);
}

/**
 * Defesa anti-CSRF: além de SameSite=Lax nos cookies, toda mutação precisa
 * vir de uma origem conhecida.
 */
export function isSameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) {
    // Navegadores enviam Origin em todo POST/PUT/DELETE cross-site.
    // Ausência costuma ser same-origin de form clássico; exigimos Sec-Fetch-Site.
    const site = req.headers.get("sec-fetch-site");
    return site === null || site === "same-origin" || site === "none";
  }
  const allowed = new Set([env.appOrigin, new URL(req.url).origin]);
  return allowed.has(origin);
}

export function jsonError(
  message: string,
  status: number,
  extra?: Record<string, unknown>,
) {
  return NextResponse.json({ ok: false, error: message, ...extra }, { status });
}

export function jsonOk<T extends Record<string, unknown>>(data: T, status = 200) {
  return NextResponse.json({ ok: true, ...data }, { status });
}

export function tooManyRequests(retryAfterSeconds: number) {
  return NextResponse.json(
    {
      ok: false,
      error: "Muitas tentativas. Aguarde um pouco antes de tentar de novo.",
      retryAfterSeconds,
    },
    { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } },
  );
}
