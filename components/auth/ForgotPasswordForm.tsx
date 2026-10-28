"use client";

import { useActionState } from "react";
import { ArrowLeft, Mail, Loader2 } from "lucide-react";
import Link from "next/link";
import { requestPasswordReset } from "@/app/login/forgot-password/actions";
import type { PasswordRecoveryState } from "@/lib/auth/recovery";

const initialState: PasswordRecoveryState = {};

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(
    requestPasswordReset,
    initialState,
  );

  return (
    <div className="space-y-4">
      <form action={formAction} className="space-y-4">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-slate-700">Email</span>
          <input
            autoComplete="email"
            className="h-14 w-full rounded-md border border-border-soft bg-white px-3 text-base outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
            name="email"
            placeholder="tu@email.com"
            required
            type="email"
          />
        </label>

        {state.error ? (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {state.error}
          </p>
        ) : null}

        {state.message ? (
          <p className="rounded-md border border-teal-200 bg-teal-50 px-3 py-2 text-sm text-teal-700">
            {state.message}
          </p>
        ) : null}

        <button
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-brand px-4 text-base font-semibold text-white transition hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-70"
          disabled={pending}
          type="submit"
        >
          {pending ? (
            <Loader2 aria-hidden="true" className="animate-spin" size={19} />
          ) : (
            <Mail aria-hidden="true" size={19} />
          )}
          Enviar enlace
        </button>
      </form>

      <Link
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-brand"
        href="/login"
      >
        <ArrowLeft aria-hidden="true" size={16} />
        Volver al acceso
      </Link>
    </div>
  );
}
