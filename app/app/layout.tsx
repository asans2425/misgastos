import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { ensureUserProfile } from "@/lib/auth/profile";
import {
  initializeUserData,
  userHasInitialData,
} from "@/lib/auth/initialization";
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

  await ensureUserProfile(supabase, user);

  const hasInitialData = await userHasInitialData(user.id, supabase);

  if (!hasInitialData) {
    await initializeUserData(user.id, supabase);
  }

  return <AppShell userEmail={user.email ?? "Usuario"}>{children}</AppShell>;
}
