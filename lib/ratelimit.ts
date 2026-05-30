import "server-only";

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

const store = new Map<string, { count: number; resetAt: number }>();

export async function checkRateLimit(
  action: string,
  identifier: string,
  max: number,
  windowSeconds: number,
): Promise<RateLimitResult> {
  const key = `${action}:${identifier}`;
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return {
      allowed: true,
      remaining: max - 1,
      resetAt: new Date(now + windowMs),
    };
  }

  entry.count += 1;
  return {
    allowed: entry.count <= max,
    remaining: Math.max(0, max - entry.count),
    resetAt: new Date(entry.resetAt),
  };
}

export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return headers.get("x-real-ip") ?? "unknown";
}
