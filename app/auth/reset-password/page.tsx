import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { WalletCards } from "lucide-react";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const RECOVERY_SESSION_COOKIE = "moneyflow-recovery-session";

export default async function ResetPasswordPage() {
  const cookieStore = await cookies();

  if (cookieStore.get(RECOVERY_SESSION_COOKIE)?.value !== "1") {
    redirect("/login?error=recovery_invalid");
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    redirect("/login?error=recovery_expired");
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <section className="w-full max-w-sm rounded-lg border border-border-soft bg-surface p-5 shadow-sm">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-md bg-brand text-white">
            <WalletCards aria-hidden="true" size={22} />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              Nueva contraseña
            </h1>
            <p className="text-sm text-slate-500">
              Elige una contraseña para continuar
            </p>
          </div>
        </div>

        <ResetPasswordForm email={data.user.email} />
      </section>
    </main>
  );
}
