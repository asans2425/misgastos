import Link from "next/link";
import type { TopExpense } from "@/lib/analysis";
import { formatMoney } from "@/lib/finance";

function formatDate(date: string) {
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
  }).format(new Date(`${date}T00:00:00`));
}

export function TopExpenses({ expenses }: { expenses: readonly TopExpense[] }) {
  return (
    <section className="min-w-0 overflow-hidden rounded-lg border border-border-soft bg-surface p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-950">Mayores gastos</h2>
      <p className="text-sm text-slate-500">Movimientos individuales del ciclo.</p>

      {expenses.length === 0 ? (
        <p className="mt-4 rounded-md bg-surface-muted p-4 text-sm text-slate-500">
          Todavía no tienes gastos en este ciclo.
        </p>
      ) : (
        <div className="mt-4 space-y-2">
          {expenses.map((expense) => (
            <Link
              className="flex min-w-0 items-center justify-between gap-3 overflow-hidden rounded-md bg-surface-muted px-3 py-3"
              href={`/app/transactions?text=${encodeURIComponent(expense.description)}`}
              key={expense.id}
            >
              <div className="min-w-0 flex-1 overflow-hidden">
                <p className="max-w-full truncate text-sm font-semibold text-slate-950">
                  {expense.description}
                </p>
                <p className="text-xs text-slate-500">
                  {expense.categoryName} · {formatDate(expense.date)}
                </p>
              </div>
              <p className="shrink-0 text-sm font-semibold text-slate-950">
                {formatMoney(expense.amount)}
              </p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
