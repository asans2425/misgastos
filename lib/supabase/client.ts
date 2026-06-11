import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";
import { getSupabaseConfig } from "@/lib/supabase/env";

export function createSupabaseBrowserClient() {
  const { supabaseAnonKey, supabaseUrl } = getSupabaseConfig();

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}
