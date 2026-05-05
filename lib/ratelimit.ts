import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

// Calls the `check_rate_limit` Postgres RPC. Fails open: any infra error
// returns `allowed: true` so a Supabase outage cannot lock real users out
// of public flows. Errors are logged for visibility.
export async function checkRateLimit(
  action: string,
  identifier: string,
  max: number,
  windowSeconds: number,
): Promise<RateLimitResult> {
  const key = `${action}:${identifier}`;
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("check_rate_limit", {
    p_key: key,
    p_max: max,
    p_window_seconds: windowSeconds,
  });

  if (error || !data || !Array.isArray(data) || data.length === 0) {
    console.error("[ratelimit] rpc failed:", { key, error });
    return {
      allowed: true,
      remaining: max,
      resetAt: new Date(Date.now() + windowSeconds * 1000),
    };
  }

  const row = data[0] as {
    allowed: boolean;
    remaining: number;
    reset_at: string;
  };
  return {
    allowed: row.allowed,
    remaining: row.remaining,
    resetAt: new Date(row.reset_at),
  };
}

// Extracts the originating client IP from common proxy headers. Falls back
// to a sentinel so missing IPs still get rate-limited (as one shared bucket)
// rather than bypassing the limiter entirely.
export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return headers.get("x-real-ip") ?? "unknown";
}
