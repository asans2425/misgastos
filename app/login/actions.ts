"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ensureUserProfile } from "@/lib/auth/profile";
import {
  initializeUserData,
  userHasInitialData,
} from "@/lib/auth/initialization";
import { isSupabaseSchemaMissingError } from "@/lib/supabase/errors";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AuthFormState = {
  error?: string;
  message?: string;
};

async function prepareUserAfterLogin(userId: string) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user || user.id !== userId) {
    throw new Error("No se ha podido validar la sesion.");
  }

  await ensureUserProfile(supabase, user);

  const hasInitialData = await userHasInitialData(user.id, supabase);

  if (!hasInitialData) {
    await initializeUserData(user.id, supabase);
  }
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
        await prepareUserAfterLogin(data.user.id);
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
    await prepareUserAfterLogin(data.user.id);
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
  const origin = (await headers()).get("origin");

  if (!origin) {
    return { error: "No se ha podido preparar el login con Google." };
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    options: {
      redirectTo: `${origin}/auth/callback?next=/app`,
    },
    provider: "google",
  });

  if (error || !data.url) {
    return { error: error?.message ?? "No se ha podido iniciar Google." };
  }

  redirect(data.url);
}
