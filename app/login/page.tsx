import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { WalletCards } from "lucide-react";
import { LoginForm } from "@/components/auth/LoginForm";
import { getCurrentUser } from "@/lib/auth/currentUser";

export const metadata: Metadata = {
  title: "Login",
};

export default async function LoginPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/app");
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
              MoneyFlow Albert
            </h1>
            <p className="text-sm text-slate-500">Acceso privado</p>
          </div>
        </div>

        <LoginForm />
      </section>
    </main>
  );
}
