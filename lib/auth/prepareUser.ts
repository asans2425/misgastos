import { ensureUserProfile } from "@/lib/auth/profile";
import {
  initializeUserData,
  userHasInitialData,
} from "@/lib/auth/initialization";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function prepareCurrentUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("No se ha podido validar la sesion.");
  }

  await ensureUserProfile(supabase, user);

  const hasInitialData = await userHasInitialData(user.id, supabase);

  if (!hasInitialData) {
    await initializeUserData(user.id, supabase);
  }

  return user;
}
