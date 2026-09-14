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
 * Defesa anti-CSRF.
 *
 * O cabeçalho `Origin` é preenchido pelo navegador e não pode ser forjado por
 * um site atacante — é essa a garantia em que a checagem se apoia.
 *
 * Comparamos o HOST da origem com os hosts legítimos: o que o navegador de
 * fato acessou (`Host`, ou `X-Forwarded-Host` atrás de proxy reverso) e o
 * configurado em APP_ORIGIN. Comparar a origem inteira quebraria dois casos
 * reais: acesso por IP da rede local (o tablet da criança abrindo
 * http://192.168.0.10:3000) e terminação de TLS no proxy, em que o app recebe
 * http e o navegador falou https.
 */
export function isSameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");

  if (!origin) {
    // Navegadores enviam Origin em todo POST/PUT/DELETE cross-site.
    // A ausência costuma ser same-origin de formulário clássico; confirmamos
    // com Sec-Fetch-Site quando disponível.
    const site = req.headers.get("sec-fetch-site");
    return site === null || site === "same-origin" || site === "none";
  }

  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    return false;
  }

  const allowedHosts = new Set<string>();

  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  if (host) allowedHosts.add(host);

  try {
    allowedHosts.add(new URL(env.appOrigin).host);
  } catch {
    // APP_ORIGIN malformado: seguimos só com o host da requisição.
  }

  return allowedHosts.has(originHost);
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
