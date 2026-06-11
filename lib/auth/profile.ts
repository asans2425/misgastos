import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export async function ensureUserProfile(
  supabase: SupabaseClient<Database>,
  user: User,
) {
  const { error } = await supabase.from("profiles").upsert(
    {
      email: user.email ?? null,
      id: user.id,
    },
    {
      onConflict: "id",
    },
  );

  if (error) {
    throw new Error(error.message);
  }
}
