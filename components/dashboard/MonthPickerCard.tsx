"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { CalendarDays, Loader2 } from "lucide-react";

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
      className={`rounded-lg border border-border-soft bg-surface p-3 shadow-sm sm:p-4 ${className ?? ""}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">
            {title}
          </h1>
          <div className="mt-1 flex items-center gap-2 text-xs font-semibold uppercase text-slate-400">
            <CalendarDays aria-hidden="true" size={14} />
            {monthLabel}
          </div>
          <p className="mt-0.5 text-sm text-slate-500">{rangeLabel}</p>
        </div>

        <label className="relative shrink-0">
          <span className="sr-only">Mes</span>
          <input
            className="h-10 w-32 rounded-md border border-border-soft bg-white px-2 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20 min-[380px]:w-36"
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
          {isPending ? (
            <Loader2
              aria-hidden="true"
              className="absolute -right-7 top-3 animate-spin text-slate-400"
              size={16}
            />
          ) : null}
        </label>
      </div>
    </section>
  );
}
