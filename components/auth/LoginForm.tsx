"use client";

import { useActionState, useState } from "react";
import { ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import {
  authenticateWithGoogle,
  authenticateWithPassword,
  type AuthFormState,
} from "@/app/login/actions";

const initialState: AuthFormState = {};

function GoogleMark() {
  return (
    <svg
      aria-hidden="true"
      className="size-5"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M21.35 12.27c0-.71-.06-1.4-.18-2.06H12v3.9h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.23Z" fill="#4285F4" />
      <path d="M12 21.5c2.63 0 4.84-.87 6.45-2.36l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.7-1.72-5.47-4.03H3.28v2.53A9.74 9.74 0 0 0 12 21.5Z" fill="#34A853" />
      <path d="M6.53 13.58a5.86 5.86 0 0 1 0-3.16V7.89H3.28a9.5 9.5 0 0 0 0 8.22l3.25-2.53Z" fill="#FBBC05" />
      <path d="M12 6.39c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.84 3.39 14.63 2.5 12 2.5a9.74 9.74 0 0 0-8.72 5.39l3.25 2.53C7.3 8.11 9.46 6.39 12 6.39Z" fill="#EA4335" />
    </svg>
  );
}

export function LoginForm() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [state, formAction, pending] = useActionState(
    authenticateWithPassword,
    initialState,
  );
  const [googleState, googleFormAction, googlePending] = useActionState(
    authenticateWithGoogle,
    initialState,
  );
  const isRegister = mode === "register";

  return (
    <div className="space-y-5">
      <form action={googleFormAction}>
        <button
          className="inline-flex h-12 w-full items-center justify-center gap-3 rounded-lg border border-border-soft bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-70"
          disabled={googlePending || pending}
          type="submit"
        >
          {googlePending ? (
            <Loader2 aria-hidden="true" className="animate-spin" size={18} />
          ) : (
            <GoogleMark />
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
          o con email
        </span>
        <div className="h-px flex-1 bg-border-soft" />
      </div>

      <form action={formAction} className="space-y-4">
        <input name="intent" type="hidden" value={mode} />

        <div>
          <h2 className="text-base font-semibold text-slate-900">
            {isRegister ? "Crea tu cuenta" : "Entra con tu email"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {isRegister
              ? "Empieza a organizar tus finanzas."
              : "Usa el email y la contraseña de tu cuenta."}
          </p>
        </div>

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
          <span className="text-sm font-medium text-slate-700">Contraseña</span>
          <span className="relative block">
            <input
              autoComplete={isRegister ? "new-password" : "current-password"}
              className="h-11 w-full rounded-md border border-border-soft bg-white px-3 pr-11 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
              minLength={6}
              name="password"
              placeholder="********"
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

        {!isRegister ? (
          <div className="flex justify-end">
            <Link
              className="text-right text-xs font-semibold leading-relaxed text-brand hover:text-brand-strong sm:text-sm"
              href="/login/forgot-password"
            >
              Crear contraseña para entrar sin Google
            </Link>
          </div>
        ) : null}

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
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-brand px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-70"
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

        <button
          className="h-11 w-full rounded-lg border border-border-soft px-4 text-sm font-semibold text-slate-600 transition hover:bg-surface-muted"
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
