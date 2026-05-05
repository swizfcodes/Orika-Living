import { createClient } from "@supabase/supabase-js";

// This client bypasses RLS — only used in server-side admin operations.
// We verify the JWT payload carries role=service_role so that an
// accidentally-pasted anon key fails fast with a clear message instead
// of producing RLS "violates policy" errors at insert time.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase admin client requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  try {
    const payload = JSON.parse(
      Buffer.from(key.split(".")[1] ?? "", "base64").toString("utf8"),
    ) as { role?: string };
    if (payload.role !== "service_role") {
      throw new Error(
        `SUPABASE_SERVICE_ROLE_KEY has role="${payload.role}", expected "service_role". ` +
          "Copy the service_role key from Supabase Dashboard → Settings → API.",
      );
    }
  } catch (err) {
    if (err instanceof Error && err.message.startsWith("SUPABASE_SERVICE_ROLE_KEY")) throw err;
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not a valid JWT.");
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
