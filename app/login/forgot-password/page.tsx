import type { Metadata } from "next";
import { WalletCards } from "lucide-react";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Recuperar contraseña",
};

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <section className="w-full max-w-sm rounded-lg border border-border-soft bg-surface p-5 shadow-sm">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-md bg-brand text-white">
            <WalletCards aria-hidden="true" size={22} />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              Crear contraseña
            </h1>
            <p className="text-sm text-slate-500">
              También podrás entrar sin Google
            </p>
          </div>
        </div>

        <ForgotPasswordForm />
      </section>
    </main>
  );
}
