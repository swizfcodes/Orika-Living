import { createClient } from "@supabase/supabase-js";

// Anonymous, no-cookie Supabase client for use inside `unstable_cache`
// scopes (Next 16 forbids reading cookies inside cached functions).
//
// All callers MUST rely on RLS policies that already permit anon SELECT —
// products, scents, and signatures are publicly readable on the storefront,
// so the only thing this client changes vs. the SSR variant is that no
// session cookie is attached.
//
// Singleton — module-scope cache avoids reconstructing a client per call.
let client: ReturnType<typeof createClient> | null = null;

export function createPublicClient() {
  if (!client) {
    client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      },
    );
  }
  return client;
}
