"use client";

import { useState } from "react";
import { Check, Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (password !== confirmation) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setPending(true);
    const supabase = createSupabaseBrowserClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
      setPending(false);
      return;
    }

    setIsSaved(true);
    window.setTimeout(() => router.push("/app"), 900);
  }

  if (isSaved) {
    return (
      <div className="rounded-md border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-medium text-teal-800">
        <div className="flex items-center gap-2">
          <Check aria-hidden="true" size={18} />
          Contraseña guardada. Entrando en tu espacio...
        </div>
      </div>
    );
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-slate-700">Nueva contraseña</span>
        <input
          autoComplete="new-password"
          className="h-11 w-full rounded-md border border-border-soft bg-white px-3 text-base outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
          minLength={6}
          onChange={(event) => setPassword(event.target.value)}
          required
          type="password"
          value={password}
        />
      </label>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-slate-700">Repite la contraseña</span>
        <input
          autoComplete="new-password"
          className="h-11 w-full rounded-md border border-border-soft bg-white px-3 text-base outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
          minLength={6}
          onChange={(event) => setConfirmation(event.target.value)}
          required
          type="password"
          value={confirmation}
        />
      </label>

      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
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
          <Save aria-hidden="true" size={18} />
        )}
        Guardar contraseña
      </button>
    </form>
  );
}
