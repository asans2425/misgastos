"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  validatePasswordPair,
  type PasswordRecoveryState,
} from "@/lib/auth/recovery";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const RECOVERY_SESSION_COOKIE = "moneyflow-recovery-session";

export async function updatePassword(
  _previousState: PasswordRecoveryState,
  formData: FormData,
): Promise<PasswordRecoveryState> {
  const password = String(formData.get("password") ?? "");
  const confirmation = String(formData.get("confirmation") ?? "");
  const validationError = validatePasswordPair(password, confirmation);

  if (validationError) {
    return { error: validationError };
  }

  const cookieStore = await cookies();

  if (cookieStore.get(RECOVERY_SESSION_COOKIE)?.value !== "1") {
    return {
      error: "Este enlace de recuperación no es válido o ya ha caducado.",
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error: userError } = await supabase.auth.getUser();

  if (userError || !data.user) {
    return {
      error: "La sesión de recuperación ha caducado. Solicita un enlace nuevo.",
    };
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: error.message };
  }

  cookieStore.delete(RECOVERY_SESSION_COOKIE);
  redirect("/app?password=updated");
}
