import type { BucketsAnalysis } from "@/lib/analysis";
import { formatMoney } from "@/lib/finance";

export function BucketsSummary({ buckets }: { buckets: BucketsAnalysis }) {
  return (
    <section className="rounded-lg border border-border-soft bg-surface p-4 shadow-sm lg:col-span-2">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Huchas</h2>
          <p className="text-sm text-slate-500">
            Patrimonio apartado. No se mezcla con ingresos ni gastos.
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-xs font-semibold uppercase text-slate-400">Total</p>
          <p className="text-lg font-semibold text-slate-950">
            {formatMoney(buckets.total)}
          </p>
        </div>
      </div>

      {buckets.buckets.length === 0 ? (
        <p className="rounded-md bg-surface-muted p-4 text-sm text-slate-500">
          Todavía no tienes huchas. Puedes crearlas desde Gestión.
        </p>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {buckets.buckets.map((bucket) => (
            <div className="rounded-md bg-surface-muted p-3" key={bucket.id}>
              <div className="flex items-center justify-between gap-3">
                <p className="truncate text-sm font-semibold text-slate-950">
                  {bucket.name}
                </p>
                <span
                  className="size-3 shrink-0 rounded-full"
                  style={{ backgroundColor: bucket.color ?? "#0f766e" }}
                />
              </div>
              <p className="mt-2 text-lg font-semibold text-slate-950">
                {formatMoney(bucket.currentBalance)}
              </p>
              <p className="text-xs text-slate-500">
                {bucket.movementDelta >= 0 ? "+" : ""}
                {formatMoney(bucket.movementDelta)} en el periodo
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
