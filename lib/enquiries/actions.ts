"use server";

import { apiPost } from "@/lib/api/client";
import { enquirySchema } from "@/lib/validations";
import type { EnquiryFormState } from "@/lib/enquiries/state";

// ─────────────────────────────────────────────────────────────
// lib/enquiries/actions.ts
//
// Public enquiry submission. Migrated from Supabase to the
// hub-system API (POST /api/store/enquiries).
//
// Rate limiting and the admin-notification / customer-confirmation
// emails now run on the backend. This action validates the form and
// forwards it.
// ─────────────────────────────────────────────────────────────

export async function submitEnquiryAction(
  _prev: EnquiryFormState,
  formData: FormData,
): Promise<EnquiryFormState> {
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
      const key = issue.path[0] as keyof NonNullable<
        EnquiryFormState["fieldErrors"]
      >;
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return {
      status: "error",
      message: "Please check the highlighted fields.",
      fieldErrors,
    };
  }

  try {
    await apiPost("/store/enquiries", parsed.data);
    return {
      status: "success",
      message: "Thank you. We'll be in touch within two business days.",
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "";
    if (message.includes("429")) {
      return {
        status: "error",
        message:
          "Too many enquiries from this connection. Please try again shortly.",
      };
    }
    console.error("[submitEnquiryAction] API call failed:", err);
    return {
      status: "error",
      message: "Could not submit your enquiry. Please try again in a moment.",
    };
  }
}
