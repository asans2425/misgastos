import type { SpendingProjection } from "@/lib/analysis";
import { formatMoney } from "@/lib/finance";

function getMessage(projection: SpendingProjection) {
  if (projection.reliability === "low") {
    return "Todavía es pronto para una estimación fiable.";
  }

  if (projection.status === "above") {
    return "Vas por encima de tu media habitual.";
  }

  if (projection.status === "below") {
    return "Vas por debajo de tu media habitual.";
  }

  if (projection.status === "inline") {
    return "Vas en línea con tu media habitual.";
  }

  return "Aún falta histórico para comparar con tu media.";
}

export function SpendingPaceCard({
  projection,
}: {
  projection: SpendingProjection | null;
}) {
  return (
    <section className="rounded-lg border border-border-soft bg-surface p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-950">Ritmo del mes</h2>
      <p className="text-sm text-slate-500">Estimación lineal del ciclo actual.</p>

      {!projection ? (
        <p className="mt-4 rounded-md bg-surface-muted p-4 text-sm text-slate-500">
          La proyección solo se muestra para el ciclo actual.
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-md bg-surface-muted p-3">
              <p className="text-xs font-semibold uppercase text-slate-400">
                Has gastado
              </p>
              <p className="mt-1 text-xl font-semibold text-slate-950">
                {formatMoney(projection.averageDaily * projection.daysElapsed)}
              </p>
            </div>
            <div className="rounded-md bg-surface-muted p-3">
              <p className="text-xs font-semibold uppercase text-slate-400">
                Proyección
              </p>
              <p className="mt-1 text-xl font-semibold text-slate-950">
                {formatMoney(projection.projectedExpense)}
              </p>
            </div>
          </div>
          <p className="text-sm text-slate-600">{getMessage(projection)}</p>
          <p className="text-xs text-slate-400">
            Día {projection.daysElapsed} de {projection.daysTotal}. Media 6M:{" "}
            {formatMoney(projection.sixMonthAverage)}.
          </p>
        </div>
      )}
    </section>
  );
}
