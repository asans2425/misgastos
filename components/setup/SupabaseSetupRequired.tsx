import { Database } from "lucide-react";

type SupabaseSetupRequiredProps = Readonly<{
  isAdmin?: boolean;
}>;

export function SupabaseSetupRequired({
  isAdmin = false,
}: SupabaseSetupRequiredProps) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <section className="w-full max-w-2xl rounded-lg border border-border-soft bg-surface p-5 shadow-sm">
        <div className="mb-5 flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-accent text-white">
            <Database aria-hidden="true" size={22} />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              {isAdmin
                ? "Falta aplicar la migracion de Supabase"
                : "Estamos preparando tu espacio"}
            </h1>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              {isAdmin
                ? "La sesion funciona, pero la base remota todavia no tiene las tablas de MoneyFlow Albert. Aplica la migracion inicial y vuelve a entrar en la app."
                : "No hemos podido cargar la configuracion de la app en este momento. Prueba a recargar en unos segundos."}
            </p>
          </div>
        </div>

        {isAdmin ? (
          <>
            <div className="space-y-3 rounded-md bg-slate-950 p-4 text-sm text-slate-100">
              <p className="font-semibold text-white">Archivo SQL:</p>
              <code className="block break-all">
                supabase/migrations/20260611143000_initial_finance_schema.sql
              </code>
            </div>

            <p className="mt-4 text-sm leading-6 text-slate-500">
              Puedes pegar ese SQL en el editor SQL de Supabase. Despues, si
              Supabase sigue mostrando cache antigua, recarga el schema cache
              desde el dashboard o espera unos segundos y vuelve a cargar `/app`.
            </p>
          </>
        ) : null}
      </section>
    </main>
  );
}
