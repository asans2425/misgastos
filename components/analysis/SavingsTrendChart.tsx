"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MonthlyTrendPoint } from "@/lib/analysis";
import { formatMoney } from "@/lib/finance";

export function SavingsTrendChart({
  data,
}: {
  data: readonly MonthlyTrendPoint[];
}) {
  const monthsWithIncome = data.filter((point) => point.income > 0);
  const averageSavings =
    monthsWithIncome.length > 0
      ? monthsWithIncome.reduce((total, point) => total + point.balance, 0) /
        monthsWithIncome.length
      : 0;
  const averageRate =
    monthsWithIncome.length > 0
      ? monthsWithIncome.reduce((total, point) => total + point.savingsRate, 0) /
        monthsWithIncome.length
      : 0;

  return (
    <section className="rounded-lg border border-border-soft bg-surface p-4 shadow-sm lg:col-span-2">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-950">Ahorro</h2>
        <p className="text-sm text-slate-500">
          Ingresos reales menos gastos netos. Las huchas no alteran este dato.
        </p>
      </div>

      {data.every((point) => point.balance === 0) ? (
        <p className="rounded-md bg-surface-muted p-4 text-sm text-slate-500">
          Aún no hay histórico suficiente para ver tu ahorro mensual.
        </p>
      ) : (
        <>
          <div className="h-56">
            <ResponsiveContainer height="100%" width="100%">
              <LineChart data={data} margin={{ bottom: 6, left: 0, right: 6, top: 8 }}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                <XAxis
                  axisLine={false}
                  dataKey="label"
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  tickLine={false}
                />
                <YAxis
                  axisLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  tickFormatter={(value) => `${Number(value) / 1000}k`}
                  tickLine={false}
                  width={34}
                />
                <Tooltip
                  formatter={(value) => [formatMoney(Number(value)), "Ahorro"]}
                  labelClassName="font-semibold text-slate-950"
                />
                <Line
                  dataKey="balance"
                  dot={{ r: 3 }}
                  stroke="#0f766e"
                  strokeWidth={3}
                  type="monotone"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-md bg-surface-muted p-3">
              <p className="text-xs font-semibold uppercase text-slate-400">
                Ahorro medio
              </p>
              <p className="mt-1 text-lg font-semibold text-slate-950">
                {formatMoney(averageSavings)}/mes
              </p>
            </div>
            <div className="rounded-md bg-surface-muted p-3">
              <p className="text-xs font-semibold uppercase text-slate-400">
                Tasa media
              </p>
              <p className="mt-1 text-lg font-semibold text-slate-950">
                {Math.round(averageRate * 10) / 10}%
              </p>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
