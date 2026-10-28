"use client";

import { useActionState, useState } from "react";
import { ArrowLeft, ArrowRight, CircleUserRound, Loader2 } from "lucide-react";
import {
  authenticateWithGoogle,
  authenticateWithPassword,
  type AuthFormState,
} from "@/app/login/actions";
import { PasswordResetRequest } from "@/components/auth/PasswordResetRequest";

const initialState: AuthFormState = {};

export function LoginForm() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [state, formAction, pending] = useActionState(
    authenticateWithPassword,
    initialState,
  );
  const [googleState, googleFormAction, googlePending] = useActionState(
    authenticateWithGoogle,
    initialState,
  );
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const isRegister = mode === "register";

  if (isResettingPassword) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-slate-950">
            Recuperar acceso
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Crea una contraseña para esta misma cuenta, sin depender de la cuenta
            de Google del dispositivo.
          </p>
        </div>
        <PasswordResetRequest />
        <button
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-700"
          onClick={() => setIsResettingPassword(false)}
          type="button"
        >
          <ArrowLeft aria-hidden="true" size={16} />
          Volver
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm leading-6 text-slate-500">
        Puedes entrar con Google o crear una cuenta con tu propio email y
        contraseña. Para compartir una cuenta que ya usa Google, utiliza el
        mismo email en «He olvidado mi contraseña»; la contraseña de Gmail no se
        utiliza aquí.
      </p>
      <form action={googleFormAction}>
        <button
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md border border-border-soft bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-70"
          disabled={googlePending || pending}
          type="submit"
        >
          {googlePending ? (
            <Loader2 aria-hidden="true" className="animate-spin" size={18} />
          ) : (
            <CircleUserRound aria-hidden="true" size={18} />
          )}
          Entrar con Google
        </button>
      </form>

      {googleState.error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {googleState.error}
        </p>
      ) : null}

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border-soft" />
        <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
          o
        </span>
        <div className="h-px flex-1 bg-border-soft" />
      </div>

      <form action={formAction} className="space-y-4">
        <input name="intent" type="hidden" value={mode} />

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-slate-700">Email</span>
          <input
            autoComplete="email"
            className="h-11 w-full rounded-md border border-border-soft bg-white px-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
            name="email"
            placeholder="tu@email.com"
            required
            type="email"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-slate-700">Contrasena</span>
          <input
            autoComplete={isRegister ? "new-password" : "current-password"}
            className="h-11 w-full rounded-md border border-border-soft bg-white px-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
            minLength={6}
            name="password"
            placeholder="********"
            required
            type="password"
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
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-brand px-4 text-sm font-semibold text-white transition hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-70"
          disabled={pending || googlePending}
          type="submit"
        >
          {pending ? (
            <Loader2 aria-hidden="true" className="animate-spin" size={18} />
          ) : (
            <ArrowRight aria-hidden="true" size={18} />
          )}
          {isRegister ? "Crear cuenta" : "Entrar"}
        </button>

        {!isRegister ? (
          <button
            className="w-full text-sm font-semibold text-brand transition hover:text-brand-strong"
            onClick={() => setIsResettingPassword(true)}
            type="button"
          >
            He olvidado mi contraseña / entrar sin Google
          </button>
        ) : null}

        <button
          className="h-10 w-full rounded-md border border-border-soft px-4 text-sm font-semibold text-slate-600 transition hover:bg-surface-muted"
          disabled={pending || googlePending}
          onClick={() => setMode(isRegister ? "login" : "register")}
          type="button"
        >
          {isRegister ? "Ya tengo cuenta" : "Crear cuenta nueva"}
        </button>
      </form>
    </div>
  );
}
