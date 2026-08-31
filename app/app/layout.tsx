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

function isAdminEmail(email?: string | null) {
  const adminEmails = (process.env.APP_ADMIN_EMAILS ?? "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  return Boolean(email && adminEmails.includes(email.toLowerCase()));
}

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
      return <SupabaseSetupRequired isAdmin={isAdminEmail(user.email)} />;
    }

    throw error;
  }

  return (
    <AppShell
      avatarUrl={
        typeof user.user_metadata.avatar_url === "string"
          ? user.user_metadata.avatar_url
          : null
      }
      userEmail={user.email ?? "Usuario"}
      userName={
        typeof user.user_metadata.full_name === "string"
          ? user.user_metadata.full_name
          : typeof user.user_metadata.name === "string"
            ? user.user_metadata.name
            : null
      }
    >
      {children}
    </AppShell>
  );
}
