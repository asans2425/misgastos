import Link from "next/link";
import { Layers3, PiggyBank, Repeat2 } from "lucide-react";
import { SettingsChecklist } from "@/components/settings/SettingsChecklist";
import { PageShell } from "@/components/ui/PageShell";

export default function SettingsPage() {
  return (
    <PageShell
      description="Espacio preparado para perfil, preferencias y conexion con Supabase."
      title="Ajustes"
    >
      <div className="space-y-6">
        <section className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-lg border border-border-soft bg-surface p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-brand text-white">
                <Repeat2 aria-hidden="true" size={20} />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="text-base font-semibold text-slate-950">
                  Gastos e ingresos fijos
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Configura nominas, suscripciones, inversiones y otros
                  movimientos mensuales para generarlos sin repetir trabajo.
                </p>
                <Link
                  className="mt-4 inline-flex h-10 items-center justify-center rounded-md bg-brand px-4 text-sm font-semibold text-white transition hover:bg-brand-strong"
                  href="/app/settings/recurring"
                >
                  Gestionar fijos
                </Link>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border-soft bg-surface p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-sky-600 text-white">
                <PiggyBank aria-hidden="true" size={20} />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="text-base font-semibold text-slate-950">
                  Huchas
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Aparta dinero para objetivos sin que cuente como gasto ni
                  distorsione el ahorro del mes.
                </p>
                <Link
                  className="mt-4 inline-flex h-10 items-center justify-center rounded-md bg-sky-600 px-4 text-sm font-semibold text-white transition hover:bg-sky-700"
                  href="/app/settings/buckets"
                >
                  Gestionar huchas
                </Link>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border-soft bg-surface p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-slate-900 text-white">
                <Layers3 aria-hidden="true" size={20} />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="text-base font-semibold text-slate-950">
                  Categorias y subcategorias
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Adapta ingresos y gastos a tu vida para registrar rapido y
                  tener estadisticas utiles.
                </p>
                <Link
                  className="mt-4 inline-flex h-10 items-center justify-center rounded-md bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
                  href="/app/settings/categories"
                >
                  Gestionar categorias
                </Link>
              </div>
            </div>
          </div>
        </section>

        <SettingsChecklist />
      </div>
    </PageShell>
  );
}
