"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { adminLoginSchema } from "@/lib/validations";
import type {
  LoginState,
  ResetRequestState,
  UpdatePasswordState,
} from "@/lib/auth/state";

export async function signInAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = adminLoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please enter a valid email and password.",
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  // Generic message for both branches — distinguishing them lets attackers
  // enumerate which Supabase users have admin rows.
  const GENERIC_AUTH_ERROR = "Invalid credentials.";

  if (error || !data.user) {
    return { status: "error", message: GENERIC_AUTH_ERROR };
  }

  // Defense in depth: confirm the user is a row in public.admins.
  // Relies on the `admins_read_own` RLS policy.
  const { data: admin } = await supabase
    .from("admins")
    .select("id")
    .eq("id", data.user.id)
    .maybeSingle();

  if (!admin) {
    await supabase.auth.signOut();
    return { status: "error", message: GENERIC_AUTH_ERROR };
  }

  redirect("/admin");
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function sendPasswordResetAction(
  _prev: ResetRequestState,
  formData: FormData,
): Promise<ResetRequestState> {
  const parsed = z
    .string()
    .email("Please enter a valid email.")
    .safeParse(formData.get("email"));

  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0].message };
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const supabase = await createClient();
  // Always respond success — don't reveal whether the email is registered.
  await supabase.auth.resetPasswordForEmail(parsed.data, {
    redirectTo: `${siteUrl}/api/auth/callback?next=/admin/reset-password`,
  });

  return { status: "success" };
}

export async function updatePasswordAction(
  _prev: UpdatePasswordState,
  formData: FormData,
): Promise<UpdatePasswordState> {
  const password = formData.get("password")?.toString() ?? "";
  const confirm = formData.get("confirm")?.toString() ?? "";

  if (password.length < 8) {
    return {
      status: "error",
      message: "Password must be at least 8 characters.",
    };
  }
  if (password !== confirm) {
    return { status: "error", message: "Passwords do not match." };
  }

  const supabase = await createClient();

  // Must be inside a recovery session (callback has exchanged the code).
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      status: "error",
      message: "Your reset link has expired. Please request a new one.",
    };
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return { status: "error", message: error.message };
  }

  redirect("/admin");
}
