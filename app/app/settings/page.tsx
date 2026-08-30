import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarClock, Layers3, PiggyBank, Repeat2 } from "lucide-react";
import { saveMonthPreferences } from "@/app/app/settings/actions";
import { SettingsChecklist } from "@/components/settings/SettingsChecklist";
import { PageShell } from "@/components/ui/PageShell";
import {
  formatMonthLabel,
  getFinancialMonthKey,
  getFinancialMonthRange,
} from "@/lib/finance";
import { throwIfSupabaseError } from "@/lib/supabase/errors";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type SettingsPageProps = {
  searchParams: Promise<{
    status?: string;
  }>;
};

function getStatusMessage(status?: string) {
  if (status === "preferences-updated") {
    return "Configuracion del mes guardada correctamente.";
  }

  if (status === "invalid-financial-month") {
    return "Revisa el dia y el modo del mes financiero.";
  }

  if (status === "preferences-error") {
    return "No se ha podido guardar la configuracion.";
  }

  return null;
}

function formatRangeDate(value: string) {
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
  }).format(new Date(`${value}T00:00:00`));
}

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: preferences, error: preferencesError } = await supabase
    .from("user_preferences")
    .select("financial_month_start_day,financial_month_label_mode")
    .eq("user_id", user.id)
    .maybeSingle();

  throwIfSupabaseError(preferencesError);

  const startDay = preferences?.financial_month_start_day ?? 1;
  const labelMode =
    startDay >= 16
      ? "next"
      : preferences?.financial_month_label_mode ?? "same";
  const currentMonth = getFinancialMonthKey(new Date(), {
    labelMode,
    startDay,
  });
  const currentMonthLabel = formatMonthLabel(
    new Date(`${currentMonth}-01T00:00:00`),
  );
  const currentRange = getFinancialMonthRange(currentMonth, {
    labelMode,
    startDay,
  });
  const statusMessage = getStatusMessage(params.status);

  return (
    <PageShell
      description="Espacio preparado para perfil, preferencias y conexion con Supabase."
      title="Ajustes"
    >
      <div className="space-y-6">
        {statusMessage ? (
          <section className="rounded-lg border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-medium text-teal-800 shadow-sm">
            {statusMessage}
          </section>
        ) : null}

        <section className="rounded-lg border border-border-soft bg-surface p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-brand text-white">
              <CalendarClock aria-hidden="true" size={20} />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-semibold text-slate-950">
                Mes financiero
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Ajusta el mes a tu dia de cobro. El dia elegido ya pertenece al
                nuevo ciclo. Si cobras a final de mes, la app entiende que ya
                estas usando el mes siguiente.
              </p>
            </div>
          </div>

          <form action={saveMonthPreferences} className="mt-4 space-y-4">
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-slate-700">
                Dia de cobro o inicio del ciclo
              </span>
              <input
                className="h-12 w-full rounded-md border border-border-soft bg-white px-3 text-base outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                defaultValue={startDay}
                max={31}
                min={1}
                name="financialMonthStartDay"
                required
                type="number"
              />
              <span className="block text-xs leading-5 text-slate-500">
                Si es del 1 al 15, empieza ese mismo mes. Si es del 16 al 31,
                empieza el mes siguiente.
              </span>
            </label>

            <div className="space-y-2 rounded-md border border-border-soft bg-surface-muted px-3 py-3 text-sm text-slate-600">
              <p>
                Ahora estas en el ciclo <strong>{currentMonthLabel}</strong>:{" "}
                <strong>{formatRangeDate(currentRange.start)}</strong> -{" "}
                <strong>{formatRangeDate(currentRange.end)}</strong>.
              </p>
              <p>
                Ejemplo: con dia 30, agosto va del 30 de julio al 29 de agosto.
                Septiembre empieza el 30 de agosto.
              </p>
            </div>

            <button
              className="h-11 w-full rounded-md bg-brand px-4 text-sm font-semibold text-white transition hover:bg-brand-strong sm:w-auto"
              type="submit"
            >
              Guardar mes financiero
            </button>
          </form>
        </section>

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
