"use client";

import { useActionState, useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import {
  authenticateWithPassword,
  type AuthFormState,
} from "@/app/login/actions";

const initialState: AuthFormState = {};

export function LoginForm() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [state, formAction, pending] = useActionState(
    authenticateWithPassword,
    initialState,
  );
  const isRegister = mode === "register";

  return (
    <form action={formAction} className="space-y-4">
      <input name="intent" type="hidden" value={mode} />

      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-slate-700">Email</span>
        <input
          autoComplete="email"
          className="h-11 w-full rounded-md border border-border-soft bg-white px-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
          name="email"
          placeholder="albert@example.com"
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
        disabled={pending}
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
        className="h-10 w-full rounded-md border border-border-soft px-4 text-sm font-semibold text-slate-600 transition hover:bg-surface-muted"
        disabled={pending}
        onClick={() => setMode(isRegister ? "login" : "register")}
        type="button"
      >
        {isRegister ? "Ya tengo cuenta" : "Crear cuenta nueva"}
      </button>
    </form>
  );
}
