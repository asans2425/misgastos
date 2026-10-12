"use client";

import { useState, useTransition } from "react";
import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import type { AnalysisPeriod } from "@/lib/analysis";
import { cn } from "@/lib/utils/cn";

const periodItems: Array<{ label: string; value: AnalysisPeriod }> = [
  { label: "Mes", value: "1" },
  { label: "3M", value: "3" },
  { label: "6M", value: "6" },
  { label: "12M", value: "12" },
];

type AnalysisPeriodTabsProps = Readonly<{
  period: AnalysisPeriod;
  periodHrefs: Record<AnalysisPeriod, string>;
}>;

export function AnalysisPeriodTabs({
  period,
  periodHrefs,
}: AnalysisPeriodTabsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedPeriod, setSelectedPeriod] = useState(period);
  const displayedPeriod = isPending ? selectedPeriod : period;

  return (
    <div
      aria-busy={isPending}
      className="grid grid-cols-4 rounded-md bg-surface-muted p-1"
    >
      {periodItems.map((item) => {
        const active = item.value === displayedPeriod;

        return (
          <button
            aria-pressed={active}
            className={cn(
              "flex min-h-10 items-center justify-center gap-1 rounded-md px-2 py-2 text-sm font-semibold text-slate-500 transition-all duration-200 active:scale-[0.98]",
              active && "bg-white text-brand shadow-sm",
              isPending && !active && "opacity-60",
            )}
            disabled={isPending}
            key={item.value}
            onPointerDown={() => {
              if (!isPending && item.value !== displayedPeriod) {
                router.prefetch(periodHrefs[item.value]);
              }
            }}
            onClick={() => {
              if (isPending || item.value === displayedPeriod) {
                return;
              }

              setSelectedPeriod(item.value);
              startTransition(() => {
                router.push(periodHrefs[item.value]);
              });
            }}
            type="button"
          >
            {item.label}
            {isPending && active ? (
              <LoaderCircle aria-hidden="true" className="animate-spin" size={14} />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
