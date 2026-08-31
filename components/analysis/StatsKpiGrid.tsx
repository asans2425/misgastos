import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import type { AnalysisKpi } from "@/lib/analysis";
import { formatMoney } from "@/lib/finance";
import { cn } from "@/lib/utils/cn";

type KpiItem = {
  helper?: string;
  invertGood?: boolean;
  kpi: AnalysisKpi;
  suffix?: string;
  title: string;
  valueKind?: "money" | "percent";
};

function formatValue(item: KpiItem) {
  if (item.valueKind === "percent") {
    return `${Math.round(item.kpi.current * 10) / 10}%`;
  }

  return formatMoney(item.kpi.current);
}

function comparisonText(kpi: AnalysisKpi) {
  if (kpi.previous === null) {
    return "Sin histórico suficiente";
  }

  if (kpi.trend === "new") {
    return "Nuevo vs periodo anterior";
  }

  if (kpi.variation === null) {
    return "Sin variación comparable";
  }

  return `${Math.abs(kpi.variation)}% vs periodo anterior`;
}

function TrendIcon({ kpi }: { kpi: AnalysisKpi }) {
  if (kpi.trend === "up") {
    return <ArrowUpRight aria-hidden="true" size={16} />;
  }

  if (kpi.trend === "down") {
    return <ArrowDownRight aria-hidden="true" size={16} />;
  }

  return <Minus aria-hidden="true" size={16} />;
}

export function StatsKpiGrid({ items }: { items: readonly KpiItem[] }) {
  return (
    <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {items.map((item) => {
        const trendIsGood =
          item.kpi.trend === "flat" ||
          (item.kpi.trend === "down" && item.invertGood) ||
          (item.kpi.trend === "up" && !item.invertGood);

        return (
          <article
            className="rounded-lg border border-border-soft bg-surface p-3 shadow-sm sm:p-4"
            key={item.title}
          >
            <p className="text-xs font-semibold uppercase text-slate-400">
              {item.title}
            </p>
            <p className="mt-2 text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">
              {formatValue(item)}
            </p>
            <p
              className={cn(
                "mt-2 flex items-center gap-1 text-xs font-medium",
                item.kpi.previous === null
                  ? "text-slate-400"
                  : trendIsGood
                    ? "text-teal-700"
                    : "text-amber-700",
              )}
            >
              <TrendIcon kpi={item.kpi} />
              {comparisonText(item.kpi)}
            </p>
          </article>
        );
      })}
    </section>
  );
}
