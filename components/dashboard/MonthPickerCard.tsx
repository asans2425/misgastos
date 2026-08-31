"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { CalendarDays, ChevronDown, Loader2 } from "lucide-react";

type MonthPickerCardProps = Readonly<{
  className?: string;
  monthLabel: string;
  rangeLabel: string;
  selectedMonth: string;
  title?: string;
}>;

export function MonthPickerCard({
  className,
  monthLabel,
  rangeLabel,
  selectedMonth,
  title = "Resumen mensual",
}: MonthPickerCardProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  return (
    <section
      className={`rounded-lg border border-border-soft bg-surface px-3 py-2.5 shadow-sm sm:px-4 ${className ?? ""}`}
    >
      <div className="flex min-w-0 items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-brand/10 text-brand">
            <CalendarDays aria-hidden="true" size={18} />
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold tracking-tight text-slate-950 sm:text-lg">
              {title}
            </h1>
            <p className="truncate text-xs font-medium text-slate-500 sm:text-sm">
              {rangeLabel}
            </p>
          </div>
        </div>

        <label className="relative flex h-10 shrink-0 items-center overflow-hidden rounded-md border border-border-soft bg-white px-2.5 text-sm font-semibold text-slate-950 shadow-sm transition focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20">
          <span className="sr-only">Mes</span>
          <span className="flex items-center gap-1.5 whitespace-nowrap">
            {monthLabel}
            {isPending ? (
              <Loader2
                aria-hidden="true"
                className="animate-spin text-slate-400"
                size={15}
              />
            ) : (
              <ChevronDown
                aria-hidden="true"
                className="text-slate-400"
                size={15}
              />
            )}
          </span>
          <input
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            defaultValue={selectedMonth}
            name="month"
            onChange={(event) => {
              const params = new URLSearchParams(searchParams.toString());

              params.set("month", event.target.value);
              startTransition(() => {
                router.push(`${pathname}?${params.toString()}`);
              });
            }}
            type="month"
          />
        </label>
      </div>
    </section>
  );
}
