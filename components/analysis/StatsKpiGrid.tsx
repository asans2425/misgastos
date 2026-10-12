import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import type { AnalysisKpi } from "@/lib/analysis";
import { formatMoney } from "@/lib/finance";
import { cn } from "@/lib/utils/cn";

type KpiItem = {
  accent?: "amber" | "blue" | "teal" | "violet";
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

function TrendIcon({
  kpi,
  showComparison,
}: {
  kpi: AnalysisKpi;
  showComparison: boolean;
}) {
  if (!showComparison) {
    return <Minus aria-hidden="true" size={16} />;
  }

  if (kpi.trend === "up") {
    return <ArrowUpRight aria-hidden="true" size={16} />;
  }

  if (kpi.trend === "down") {
    return <ArrowDownRight aria-hidden="true" size={16} />;
  }

  return <Minus aria-hidden="true" size={16} />;
}

export function StatsKpiGrid({
  columns = 4,
  fill = false,
  items,
  showComparison = true,
}: {
  columns?: 1 | 2 | 4;
  fill?: boolean;
  items: readonly KpiItem[];
  showComparison?: boolean;
}) {
  return (
    <section
      className={cn(
        "grid gap-3",
        columns === 1
          ? "grid-cols-1"
          : columns === 4
            ? "grid-cols-2 lg:grid-cols-4"
            : "grid-cols-2 lg:grid-cols-2",
        fill &&
          (columns === 1
            ? "lg:h-full lg:grid-rows-4"
            : "lg:h-full lg:grid-rows-2"),
      )}
    >
      {items.map((item) => {
        const trendIsGood =
          item.kpi.trend === "flat" ||
          (item.kpi.trend === "down" && item.invertGood) ||
          (item.kpi.trend === "up" && !item.invertGood);

        const accent = {
          amber: "border-amber-300 bg-amber-100/70",
          blue: "border-sky-300 bg-sky-100/70",
          teal: "border-teal-300 bg-teal-100/70",
          violet: "border-violet-300 bg-violet-100/70",
        }[item.accent ?? "teal"];

        return (
          <article
            className={cn(
              "rounded-lg border p-3 shadow-sm sm:p-4",
              accent,
              fill && "lg:flex lg:h-full lg:flex-col lg:justify-center",
            )}
            key={item.title}
          >
            <p className="text-xs font-semibold uppercase text-slate-400">
              {item.title}
            </p>
            <p className="mt-2 text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">
              {formatValue(item)}
            </p>
            {showComparison ? (
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
                <TrendIcon kpi={item.kpi} showComparison />
                {comparisonText(item.kpi)}
              </p>
            ) : null}
          </article>
        );
      })}
    </section>
  );
}
