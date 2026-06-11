import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, WalletCards } from "lucide-react";

export const metadata: Metadata = {
  title: "Login",
};

export default function LoginPage() {
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

        <form className="space-y-4">
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-slate-700">Email</span>
            <input
              className="h-11 w-full rounded-md border border-border-soft bg-white px-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
              name="email"
              placeholder="albert@example.com"
              type="email"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-slate-700">
              Contrasena
            </span>
            <input
              className="h-11 w-full rounded-md border border-border-soft bg-white px-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
              name="password"
              placeholder="********"
              type="password"
            />
          </label>

          <Link
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-brand px-4 text-sm font-semibold text-white transition hover:bg-brand-strong"
            href="/app"
          >
            Entrar
            <ArrowRight aria-hidden="true" size={18} />
          </Link>
        </form>
      </section>
    </main>
  );
}
