import "server-only";
import { createClient } from "@/lib/supabase/server";

// Asserts the current request is from an authenticated admin. Throws on
// failure — callers wrap in try/catch when they need to translate to a
// user-facing error. Returns the SSR Supabase client so admin actions can
// reuse the same cookie-bound session for follow-up reads.
//
// Relies on the `admins_read_own` RLS policy: a non-admin user reading
// `admins` returns no row, which we treat as "not an admin".
export async function assertAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthenticated");
  const { data: admin } = await supabase
    .from("admins")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();
  if (!admin) throw new Error("Not an admin");
  return supabase;
}
