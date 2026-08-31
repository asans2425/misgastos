import type { FixedVariableAnalysis } from "@/lib/analysis";
import { formatMoney } from "@/lib/finance";

export function FixedVariableCard({
  fixedVariable,
}: {
  fixedVariable: FixedVariableAnalysis;
}) {
  const hasExpenses = fixedVariable.fixed + fixedVariable.variable > 0;

  return (
    <section className="rounded-lg border border-border-soft bg-surface p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-950">
        Fijos vs variables
      </h2>
      <p className="text-sm text-slate-500">
        Compromiso mensual según tus recurrentes activos.
      </p>

      <div className="mt-4 rounded-md bg-brand/10 p-3">
        <p className="text-xs font-semibold uppercase text-brand">
          Gasto fijo comprometido
        </p>
        <p className="mt-1 text-2xl font-semibold text-slate-950">
          {formatMoney(fixedVariable.committedFixedExpense)}/mes
        </p>
      </div>

      {!hasExpenses ? (
        <p className="mt-4 rounded-md bg-surface-muted p-4 text-sm text-slate-500">
          No tienes gastos recurrentes configurados o generados en este ciclo.
        </p>
      ) : (
        <div className="mt-4">
          <div className="flex h-3 overflow-hidden rounded-full bg-surface-muted">
            <div
              className="bg-brand"
              style={{ width: `${fixedVariable.fixedPercent}%` }}
            />
            <div
              className="bg-accent"
              style={{ width: `${fixedVariable.variablePercent}%` }}
            />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="font-semibold text-slate-950">
                {formatMoney(fixedVariable.fixed)}
              </p>
              <p className="text-slate-500">Fijos · {fixedVariable.fixedPercent}%</p>
            </div>
            <div>
              <p className="font-semibold text-slate-950">
                {formatMoney(fixedVariable.variable)}
              </p>
              <p className="text-slate-500">
                Variables · {fixedVariable.variablePercent}%
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
