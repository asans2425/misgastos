import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { AnalysisPeriod } from "@/lib/analysis";
import { cn } from "@/lib/utils/cn";

const periodItems: Array<{ label: string; value: AnalysisPeriod }> = [
  { label: "Mes", value: "1" },
  { label: "3M", value: "3" },
  { label: "6M", value: "6" },
  { label: "12M", value: "12" },
];

type AnalysisHeaderProps = Readonly<{
  currentMonthHref: string;
  monthLabel: string;
  nextHref: string;
  period: AnalysisPeriod;
  periodHref: (period: AnalysisPeriod) => string;
  previousHref: string;
  rangeLabel: string;
}>;

export function AnalysisHeader({
  currentMonthHref,
  monthLabel,
  nextHref,
  period,
  periodHref,
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

      <div className="mt-3 grid grid-cols-4 gap-1 rounded-md bg-surface-muted p-1">
        {periodItems.map((item) => (
          <Link
            className={cn(
              "rounded-md px-2 py-2 text-center text-sm font-semibold text-slate-500 transition",
              item.value === period && "bg-white text-brand shadow-sm",
            )}
            href={periodHref(item.value)}
            key={item.value}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
