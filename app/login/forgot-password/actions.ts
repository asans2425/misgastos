"use server";

import { cookies, headers } from "next/headers";
import { getRequestOrigin } from "@/lib/auth/requestOrigin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { PasswordRecoveryState } from "@/lib/auth/recovery";

const RECOVERY_INTENT_COOKIE = "moneyflow-recovery-intent";

export async function requestPasswordReset(
  _previousState: PasswordRecoveryState,
  formData: FormData,
): Promise<PasswordRecoveryState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!email) {
    return { error: "Introduce tu email." };
  }

  const origin = getRequestOrigin(await headers());

  if (!origin) {
    return { error: "No se ha podido preparar el enlace de recuperación." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: new URL(
      "/auth/callback?next=/auth/reset-password",
      origin,
    ).toString(),
  });

  if (error) {
    return {
      error:
        error.message.toLowerCase().includes("rate limit")
          ? "Se han solicitado demasiados enlaces. Espera unos minutos antes de volver a intentarlo."
          : error.message,
    };
  }

  const cookieStore = await cookies();
  cookieStore.set(RECOVERY_INTENT_COOKIE, "1", {
    httpOnly: true,
    maxAge: 10 * 60,
    path: "/",
    sameSite: "lax",
    secure: origin.startsWith("https://"),
  });

  return {
    message:
      "Si existe una cuenta con ese email, recibirás un enlace para establecer la contraseña.",
  };
}
