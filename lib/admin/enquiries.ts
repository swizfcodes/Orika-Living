"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendTradePackEmail } from "@/lib/email/templates/enquiries";
import type { EnquiryStatus } from "@/lib/types";
import { assertAdmin } from "./auth";

const TRADE_PACK_OBJECT = "orika-living-trade-pack.pdf";

export async function updateEnquiryStatusAction(input: {
  id: string;
  status: EnquiryStatus;
}) {
  const supabase = await assertAdmin();
  const { error } = await supabase
    .from("enquiries")
    .update({ status: input.status })
    .eq("id", input.id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/admin");
  revalidatePath("/admin/enquiries");
  return { ok: true as const };
}

// Sends the trade pack PDF to the enquirer, and stamps the audit columns so
// the UI can show "sent N days ago" and avoid accidental re-sends.
export async function sendTradePackAction(input: { id: string }) {
  const supabase = await assertAdmin();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: enquiry, error: lookupError } = await supabase
    .from("enquiries")
    .select("id, name, email, type")
    .eq("id", input.id)
    .maybeSingle();

  if (lookupError || !enquiry) {
    return { ok: false as const, error: "Enquiry not found." };
  }

  const admin = createAdminClient();
  const { data: file, error: downloadError } = await admin.storage
    .from("trade-pack")
    .download(TRADE_PACK_OBJECT);

  if (downloadError || !file) {
    return {
      ok: false as const,
      error: "Trade pack PDF not uploaded yet. Upload it to the trade-pack bucket first.",
    };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  await sendTradePackEmail({
    name: enquiry.name,
    email: enquiry.email,
    pdf: {
      filename: "Orika-Living-Trade-Pack.pdf",
      base64: buffer.toString("base64"),
    },
  });

  await supabase
    .from("enquiries")
    .update({
      trade_pack_sent_at: new Date().toISOString(),
      trade_pack_sent_by: user?.id ?? null,
      status: "replied",
    })
    .eq("id", input.id);

  revalidatePath("/admin/enquiries");
  return { ok: true as const };
}
