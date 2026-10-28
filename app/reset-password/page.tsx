import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { WalletCards } from "lucide-react";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { getCurrentUser } from "@/lib/auth/currentUser";

export const metadata: Metadata = {
  title: "Crear contraseña",
};

export default async function ResetPasswordPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <section className="w-full max-w-sm rounded-lg border border-border-soft bg-surface p-5 shadow-sm">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-md bg-brand text-white">
            <WalletCards aria-hidden="true" size={22} />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Crear contraseña</h1>
            <p className="text-sm text-slate-500">Money Flow ARSA</p>
          </div>
        </div>

        <ResetPasswordForm />
      </section>
    </main>
  );
}
