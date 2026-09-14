/**
 * Rate limit em memória (janela deslizante por chave).
 *
 * Suficiente para uma instância única / desenvolvimento. Em produção com
 * múltiplas réplicas, troque a implementação de `hit` por Redis
 * (INCR + EXPIRE) mantendo a mesma assinatura.
 */
type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

// Limpeza preguiçosa para o Map não crescer indefinidamente.
let lastSweep = Date.now();
function sweep(now: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export function hit(
  key: string,
  limit: number,
  windowSeconds: number,
): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return { allowed: true, remaining: limit - 1, retryAfterSeconds: 0 };
  }

  bucket.count += 1;
  if (bucket.count > limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000),
    };
  }
  return {
    allowed: true,
    remaining: limit - bucket.count,
    retryAfterSeconds: 0,
  };
}

/** Perfis de limite por tipo de rota. */
export const LIMITS = {
  login: { limit: 8, window: 300 },
  signup: { limit: 5, window: 3600 },
  passwordReset: { limit: 5, window: 3600 },
  adminLogin: { limit: 5, window: 900 },
  mutation: { limit: 60, window: 60 },
  read: { limit: 240, window: 60 },
} as const;
