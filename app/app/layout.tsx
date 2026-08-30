import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { ensureUserProfile } from "@/lib/auth/profile";
import {
  initializeUserData,
  userHasInitialData,
} from "@/lib/auth/initialization";
import { SupabaseSetupRequired } from "@/components/setup/SupabaseSetupRequired";
import { isSupabaseSchemaMissingError } from "@/lib/supabase/errors";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "App",
};

export default async function PrivateAppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  try {
    await ensureUserProfile(supabase, user);

    const hasInitialData = await userHasInitialData(user.id, supabase);

    if (!hasInitialData) {
      await initializeUserData(user.id, supabase);
    }
  } catch (error) {
    if (isSupabaseSchemaMissingError(error)) {
      return <SupabaseSetupRequired />;
    }

    throw error;
  }

  return <AppShell userEmail={user.email ?? "Usuario"}>{children}</AppShell>;
}
