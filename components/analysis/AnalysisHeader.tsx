import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { AnalysisPeriod } from "@/lib/analysis";
import { InvestmentToggle } from "@/components/analysis/InvestmentToggle";
import { AnalysisPeriodTabs } from "@/components/analysis/AnalysisPeriodTabs";

type AnalysisHeaderProps = Readonly<{
  currentMonthHref: string;
  includeInvestment: boolean;
  monthLabel: string;
  nextHref: string;
  period: AnalysisPeriod;
  periodHrefs: Record<AnalysisPeriod, string>;
  previousHref: string;
  rangeLabel: string;
}>;

export function AnalysisHeader({
  currentMonthHref,
  includeInvestment,
  monthLabel,
  nextHref,
  period,
  periodHrefs,
  previousHref,
  rangeLabel,
}: AnalysisHeaderProps) {
  return (
    <section className="rounded-lg border border-border-soft bg-surface px-3 py-3 shadow-sm sm:px-4">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight text-slate-950">
            Estadísticas
          </h1>
          <p className="truncate text-sm text-slate-500">{rangeLabel}</p>
        </div>
        <div className="flex shrink-0 items-center rounded-md border border-border-soft bg-white p-1">
          <Link
            aria-label="Periodo anterior"
            className="flex size-9 items-center justify-center rounded-md text-slate-500 hover:bg-surface-muted"
            href={previousHref}
          >
            <ChevronLeft aria-hidden="true" size={18} />
          </Link>
          <Link
            className="min-w-24 rounded-md px-2 text-center text-sm font-semibold text-slate-950"
            href={currentMonthHref}
          >
            {monthLabel}
          </Link>
          <Link
            aria-label="Periodo siguiente"
            className="flex size-9 items-center justify-center rounded-md text-slate-500 hover:bg-surface-muted"
            href={nextHref}
          >
            <ChevronRight aria-hidden="true" size={18} />
          </Link>
        </div>
      </div>

      <div className="mt-3">
        <AnalysisPeriodTabs period={period} periodHrefs={periodHrefs} />
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-slate-500">
          {includeInvestment
            ? "La inversión está incluida en los gastos."
            : "La inversión queda fuera de los gastos."}
        </p>
        <InvestmentToggle checked={includeInvestment} />
      </div>
    </section>
  );
}
