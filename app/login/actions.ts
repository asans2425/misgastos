"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prepareCurrentUser } from "@/lib/auth/prepareUser";
import { getRequestOrigin } from "@/lib/auth/requestOrigin";
import { isSupabaseSchemaMissingError } from "@/lib/supabase/errors";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AuthFormState = {
  error?: string;
  message?: string;
};

function getAuthErrorMessage(error: { message?: string; code?: string }) {
  const message = error.message?.toLowerCase() ?? "";

  if (
    error.code === "invalid_credentials" ||
    message.includes("invalid login credentials")
  ) {
    return "Email o contraseña incorrectos. Si esta cuenta se creó con Google, usa la recuperación de contraseña para añadir una contraseña propia.";
  }

  if (
    error.code === "email_not_confirmed" ||
    message.includes("email not confirmed")
  ) {
    return "Confirma primero el email que te hemos enviado y vuelve a intentarlo.";
  }

  if (
    error.code === "user_already_exists" ||
    error.code === "email_exists" ||
    message.includes("already registered") ||
    message.includes("already been registered")
  ) {
    return "Ese email ya está registrado. Inicia sesión o usa la recuperación de contraseña.";
  }

  return error.message ?? "No se ha podido completar la operación.";
}

export async function authenticateWithPassword(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const intent = String(formData.get("intent") ?? "login");

  if (!email || !password) {
    return { error: "Introduce email y contraseña." };
  }

  if (password.length < 6) {
    return { error: "La contraseña debe tener al menos 6 caracteres." };
  }

  const supabase = await createSupabaseServerClient();

  if (intent === "register") {
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      return { error: getAuthErrorMessage(error) };
    }

    if (data.user && (data.user.identities?.length ?? 0) === 0) {
      return {
        error:
          "Ese email ya está asociado a una cuenta. Usa «Crear contraseña para entrar sin Google» para añadir la contraseña a esa misma cuenta.",
      };
    }

    if (data.user && data.session) {
      try {
        await prepareCurrentUser();
      } catch (error) {
        if (isSupabaseSchemaMissingError(error)) {
          return {
            error:
              "Login correcto, pero no hemos podido preparar tu espacio. Prueba de nuevo en unos segundos.",
          };
        }

        throw error;
      }
      redirect("/app");
    }

    return {
      message:
        "Registro creado. Revisa tu email si hace falta confirmar la cuenta.",
    };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return {
      error: error
        ? getAuthErrorMessage(error)
        : "No se ha podido iniciar sesión.",
    };
  }

  try {
    await prepareCurrentUser();
  } catch (error) {
    if (isSupabaseSchemaMissingError(error)) {
      return {
        error:
          "Login correcto, pero no hemos podido preparar tu espacio. Prueba de nuevo en unos segundos.",
      };
    }

    throw error;
  }

  redirect("/app");
}

export async function authenticateWithGoogle(): Promise<AuthFormState> {
  const supabase = await createSupabaseServerClient();
  const origin = getRequestOrigin(await headers());

  if (!origin) {
    return { error: "No se ha podido preparar el login con Google." };
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    options: {
      redirectTo: new URL("/auth/callback?next=/app", origin).toString(),
    },
    provider: "google",
  });

  if (error || !data.url) {
    return { error: error?.message ?? "No se ha podido iniciar Google." };
  }

  redirect(data.url);
}
