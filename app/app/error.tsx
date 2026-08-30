"use client";

import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { isSupabaseSchemaMissingError } from "@/lib/supabase/errors";

type AppErrorProps = Readonly<{
  error: Error;
  reset: () => void;
}>;

export default function AppError({ error, reset }: AppErrorProps) {
  const isSchemaError = isSupabaseSchemaMissingError(error);

  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-2xl items-center px-4 py-10">
      <section className="w-full rounded-lg border border-border-soft bg-surface p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-amber-100 text-amber-800">
            <AlertTriangle aria-hidden="true" size={20} />
          </span>
          <div>
            <h1 className="text-lg font-semibold text-slate-950">
              No se han podido cargar los datos
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {isSchemaError
                ? "La base de datos parece no tener aplicada alguna migracion reciente. Tus movimientos no se han borrado; la app no puede leerlos hasta que Supabase tenga el esquema actualizado."
                : "Ha fallado una consulta al cargar esta pantalla."}
            </p>
          </div>
        </div>

        <pre className="mt-4 overflow-x-auto rounded-md bg-slate-950 p-3 text-xs text-white">
          {error.message}
        </pre>

        {isSchemaError ? (
          <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            Aplica las migraciones pendientes desde `supabase/migrations` en el
            SQL Editor de Supabase y recarga la pagina.
          </div>
        ) : null}

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <button
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-brand px-4 text-sm font-semibold text-white transition hover:bg-brand-strong"
            onClick={reset}
            type="button"
          >
            <RefreshCw aria-hidden="true" size={16} />
            Reintentar
          </button>
          <Link
            className="inline-flex h-11 items-center justify-center rounded-md border border-border-soft px-4 text-sm font-semibold text-slate-600 transition hover:bg-surface-muted"
            href="/app/settings"
          >
            Ir a ajustes
          </Link>
        </div>
      </section>
    </main>
  );
}
