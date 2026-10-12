"use client";

import { useMemo, useState } from "react";
import type { DailySpending, PeriodMonth } from "@/lib/analysis";
import { formatMoney } from "@/lib/finance";
import { cn } from "@/lib/utils/cn";

function formatDayLabel(date: string) {
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
    weekday: "long",
  }).format(new Date(`${date}T00:00:00`));
}

function dateKey(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

export function SpendingCalendar({
  days,
  month,
}: {
  days: readonly DailySpending[];
  month: PeriodMonth;
}) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const dailyByDate = new Map(days.map((day) => [day.date, day]));
  const max = Math.max(...days.map((day) => day.amount), 0);
  const calendarDays = useMemo(() => {
    const start = new Date(`${month.start}T00:00:00`);
    const end = new Date(`${month.end}T00:00:00`);
    const rows: string[] = [];

    for (const cursor = new Date(start); cursor <= end; cursor.setDate(cursor.getDate() + 1)) {
      rows.push(dateKey(cursor));
    }

    return rows;
  }, [month.end, month.start]);
  const selected = selectedDate ? dailyByDate.get(selectedDate) : null;

  return (
    <section className="rounded-lg border border-border-soft bg-surface p-4 shadow-sm lg:col-span-2">
      <h2 className="text-lg font-semibold text-slate-950">Calendario de gasto</h2>
      <p className="text-sm text-slate-500">
        Intensidad por día dentro del ciclo seleccionado.
      </p>

      <div className="mt-4 grid grid-cols-7 gap-1">
        {calendarDays.map((day) => {
          const amount = dailyByDate.get(day)?.amount ?? 0;
          const intensity = max > 0 ? amount / max : 0;

          return (
            <button
              aria-label={`${formatDayLabel(day)}: ${formatMoney(amount)}`}
              className={cn(
                "flex aspect-square items-center justify-center rounded-md border text-xs font-semibold transition",
                selectedDate === day
                  ? "border-brand bg-brand text-white"
                  : "border-border-soft text-slate-700",
              )}
              key={day}
              onClick={() => setSelectedDate(day)}
              style={
                selectedDate === day
                  ? undefined
                  : {
                      backgroundColor:
                        amount > 0
                          ? `rgba(15, 118, 110, ${0.12 + intensity * 0.5})`
                          : "#ffffff",
                    }
              }
              type="button"
            >
              {Number(day.slice(-2))}
            </button>
          );
        })}
      </div>

      <div className="mt-4 rounded-md bg-surface-muted p-3">
        {!selectedDate ? (
          <p className="text-sm text-slate-500">
            Toca un día para ver sus movimientos.
          </p>
        ) : !selected ? (
          <p className="text-sm text-slate-500">No hay gastos este día.</p>
        ) : (
          <div>
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-sm font-semibold capitalize text-slate-950">
                {formatDayLabel(selected.date)}
              </p>
              <p className="text-sm font-semibold text-slate-950">
                {formatMoney(selected.amount)}
              </p>
            </div>
            <div className="space-y-2">
              {selected.transactions.map((transaction) => (
                <div
                  className="flex items-center justify-between gap-3 text-sm"
                  key={transaction.id}
                >
                  <span className="truncate text-slate-600">
                    {transaction.description || transaction.subcategoryName}
                  </span>
                  <span className="font-semibold text-slate-900">
                    {formatMoney(transaction.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
