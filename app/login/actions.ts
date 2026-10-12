"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prepareCurrentUser } from "@/lib/auth/prepareUser";
import { isSupabaseSchemaMissingError } from "@/lib/supabase/errors";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AuthFormState = {
  error?: string;
  message?: string;
};

function getRequestOrigin(requestHeaders: Headers) {
  const requestOrigin = requestHeaders.get("origin");

  if (requestOrigin) {
    return requestOrigin;
  }

  const forwardedHost = requestHeaders.get("x-forwarded-host");
  const host = forwardedHost ?? requestHeaders.get("host");
  const forwardedProto = requestHeaders.get("x-forwarded-proto")?.split(",")[0];
  const protocol = forwardedProto ?? (host?.startsWith("localhost") ? "http" : "https");

  if (host) {
    return `${protocol}://${host}`;
  }

  return null;
}

export async function authenticateWithPassword(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const intent = String(formData.get("intent") ?? "login");

  if (!email || !password) {
    return { error: "Introduce email y contrasena." };
  }

  if (password.length < 6) {
    return { error: "La contrasena debe tener al menos 6 caracteres." };
  }

  const supabase = await createSupabaseServerClient();

  if (intent === "register") {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return { error: error.message };
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
    return { error: error?.message ?? "No se ha podido iniciar sesion." };
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
