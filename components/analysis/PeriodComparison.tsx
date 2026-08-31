import type { CategoryComparisonItem } from "@/lib/analysis";
import { formatMoney } from "@/lib/finance";
import { cn } from "@/lib/utils/cn";

export function PeriodComparison({
  items,
  previousLabel,
}: {
  items: readonly CategoryComparisonItem[];
  previousLabel: string;
}) {
  return (
    <section className="rounded-lg border border-border-soft bg-surface p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-950">
        Cambios por categoría
      </h2>
      <p className="text-sm text-slate-500">Respecto a {previousLabel}.</p>

      {items.length === 0 ? (
        <p className="mt-4 rounded-md bg-surface-muted p-4 text-sm text-slate-500">
          Aún no hay suficientes movimientos para comparar meses.
        </p>
      ) : (
        <div className="mt-4 space-y-2">
          {items.map((item) => (
            <div
              className="flex items-center justify-between gap-3 rounded-md bg-surface-muted px-3 py-3"
              key={item.categoryName}
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-950">
                  {item.categoryName}
                </p>
                <p className="text-xs text-slate-500">
                  {formatMoney(item.previous)} → {formatMoney(item.current)}
                </p>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-full px-2 py-1 text-xs font-semibold",
                  item.variation === null
                    ? "bg-white text-brand"
                    : item.amountDelta > 0
                      ? "bg-amber-100 text-amber-800"
                      : "bg-teal-100 text-teal-800",
                )}
              >
                {item.variation === null
                  ? "Nueva"
                  : `${item.amountDelta > 0 ? "+" : ""}${item.variation}%`}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
