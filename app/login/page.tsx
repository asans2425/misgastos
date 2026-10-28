import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { WalletCards } from "lucide-react";
import { LoginForm } from "@/components/auth/LoginForm";
import { getCurrentUser } from "@/lib/auth/currentUser";

export const metadata: Metadata = {
  title: "Login",
};

const authMessages: Record<string, string> = {
  invalid_redirect: "No se ha podido validar el destino del acceso.",
  recovery_expired:
    "El enlace de recuperación ha caducado o ya se ha utilizado. Solicita uno nuevo.",
  recovery_invalid:
    "El enlace de recuperación no es válido. Solicita uno nuevo desde aquí.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; reset?: string }>;
}) {
  const user = await getCurrentUser();

  if (user) {
    redirect("/app");
  }

  const params = await searchParams;
  const message = params.error ? authMessages[params.error] : undefined;
  const resetMessage =
    params.reset === "success"
      ? "Contraseña actualizada correctamente. Ya puedes iniciar sesión."
      : undefined;

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-8 sm:py-12">
      <section className="w-full max-w-md overflow-hidden rounded-xl border border-border-soft border-t-4 border-t-brand bg-surface p-5 shadow-lg shadow-slate-200/60 sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand text-white shadow-sm">
            <WalletCards aria-hidden="true" size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              MoneyFlow ARSA
            </h1>
            <p className="text-sm text-slate-500">Tu dinero, bajo control</p>
          </div>
        </div>

        {message ? (
          <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {message}
          </p>
        ) : null}

        {resetMessage ? (
          <p className="mb-4 rounded-md border border-teal-200 bg-teal-50 px-3 py-2 text-sm text-teal-700">
            {resetMessage}
          </p>
        ) : null}

        <div className="mb-6 rounded-lg border border-teal-200 bg-teal-50/70 p-4 text-sm text-teal-950">
          <p className="font-semibold">Dos formas de entrar</p>
          <p className="mt-1 leading-relaxed text-teal-800">
            Puedes usar Google o tu email y contraseña. Si tu cuenta se creó con
            Google, crea una contraseña para acceder desde cualquier lugar y
            dispositivo.
          </p>
        </div>

        <LoginForm />
      </section>
    </main>
  );
}
