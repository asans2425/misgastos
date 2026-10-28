"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff, KeyRound, Loader2 } from "lucide-react";
import { updatePassword } from "@/app/auth/reset-password/actions";
import type { PasswordRecoveryState } from "@/lib/auth/recovery";

const initialState: PasswordRecoveryState = {};

export function ResetPasswordForm({ email }: { email?: string }) {
  const [state, formAction, pending] = useActionState(
    updatePassword,
    initialState,
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  return (
    <form action={formAction} className="space-y-4">
      {email ? (
        <p className="text-sm text-slate-500">Cuenta: {email}</p>
      ) : null}

      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-slate-700">
          Nueva contraseña
        </span>
        <span className="relative block">
          <input
            autoComplete="new-password"
            className="h-12 w-full rounded-md border border-border-soft bg-white px-3 pr-11 text-base outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
            minLength={6}
            name="password"
            required
            type={showPassword ? "text" : "password"}
          />
          <button
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-500 hover:text-brand"
            onClick={() => setShowPassword((visible) => !visible)}
            type="button"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </span>
      </label>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-slate-700">
          Repite la contraseña
        </span>
        <span className="relative block">
          <input
            autoComplete="new-password"
            className="h-12 w-full rounded-md border border-border-soft bg-white px-3 pr-11 text-base outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
            minLength={6}
            name="confirmation"
            required
            type={showConfirmation ? "text" : "password"}
          />
          <button
            aria-label={
              showConfirmation ? "Ocultar contraseña" : "Mostrar contraseña"
            }
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-500 hover:text-brand"
            onClick={() => setShowConfirmation((visible) => !visible)}
            type="button"
          >
            {showConfirmation ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </span>
      </label>

      {state.error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
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
          <KeyRound aria-hidden="true" size={19} />
        )}
        Guardar contraseña
      </button>
    </form>
  );
}
