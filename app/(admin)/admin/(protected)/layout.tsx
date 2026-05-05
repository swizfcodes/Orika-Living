import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminNav from "@/components/admin/AdminNav";
import LiveRevalidator from "@/components/realtime/LiveRevalidator";

const adminTables = [
  "orders",
  "enquiries",
  "products",
  "scents",
  "signatures",
  "newsletter_subscribers",
  "newsletter_campaigns",
] as const;

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  // Definitive admin check against public.admins (allowed by admins_read_own RLS).
  const { data: admin } = await supabase
    .from("admins")
    .select("email, role")
    .eq("id", user.id)
    .maybeSingle();

  if (!admin) {
    await supabase.auth.signOut();
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-(--linen) text-(--charcoal) lg:flex">
      <LiveRevalidator channel="admin-live" tables={adminTables} />
      <AdminNav email={admin.email} role={admin.role} />
      <main className="flex-1 px-6 lg:px-12 py-10 lg:py-14 pb-28 lg:pb-14">
        {children}
      </main>
    </div>
  );
}
