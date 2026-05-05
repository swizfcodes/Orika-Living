"use server";

import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { enquirySchema } from "@/lib/validations";
import { checkRateLimit, getClientIp } from "@/lib/ratelimit";
import {
  notifyAdminEnquiry,
  sendEnquiryConfirmation,
} from "@/lib/email/templates/enquiries";
import type { EnquiryType } from "@/lib/types";
import type { EnquiryFormState } from "@/lib/enquiries/state";

// Server action: validate → insert via service role (enquiries RLS allows
// public insert, but service role keeps it uniform with the rest of the
// write path) → fire-and-forget notification email.
export async function submitEnquiryAction(
  _prev: EnquiryFormState,
  formData: FormData,
): Promise<EnquiryFormState> {
  const ip = getClientIp(await headers());
  const rl = await checkRateLimit("enquiries", ip, 5, 3600);
  if (!rl.allowed) {
    return {
      status: "error",
      message: "Too many enquiries from this connection. Please try again shortly.",
    };
  }

  const raw = {
    name: String(formData.get("name") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim(),
    type: String(formData.get("type") ?? "").trim(),
    message: String(formData.get("message") ?? "").trim(),
  };

  const parsed = enquirySchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: EnquiryFormState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof NonNullable<EnquiryFormState["fieldErrors"]>;
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return {
      status: "error",
      message: "Please check the highlighted fields.",
      fieldErrors,
    };
  }

  const supabase = createAdminClient();
  const { error: insertError } = await supabase.from("enquiries").insert({
    ...parsed.data,
    status: "new",
  });

  if (insertError) {
    return {
      status: "error",
      message: "Could not submit your enquiry. Please try again in a moment.",
    };
  }

  // Fire-and-forget. A failed email must not fail the enquiry —
  // the record is already saved in the admin inbox.
  const enquiryData = {
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone,
    type: parsed.data.type as EnquiryType,
    message: parsed.data.message,
  };
  await Promise.allSettled([
    notifyAdminEnquiry(enquiryData),
    sendEnquiryConfirmation({
      name: enquiryData.name,
      email: enquiryData.email,
      type: enquiryData.type,
    }),
  ]);

  return {
    status: "success",
    message: "Thank you. We'll be in touch within two business days.",
  };
}
