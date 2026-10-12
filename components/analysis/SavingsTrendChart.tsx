"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import type { MonthlyTrendPoint } from "@/lib/analysis";
import { formatMoney } from "@/lib/finance";

function formatAxisValue(value: number) {
  return String(Math.round(Number(value)));
}

function formatMonthTick(value: string) {
  const [month, year] = value.split(" ");

  return year ? `${month} ${year.slice(-2)}` : value;
}

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
              <AreaChart data={data} margin={{ bottom: 6, left: 8, right: 12, top: 12 }}>
                <defs>
                  <linearGradient id="savings-trend-fill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#0f766e" stopOpacity={0.32} />
                    <stop offset="100%" stopColor="#0f766e" stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <CartesianGrid horizontal={true} vertical={false} stroke="#dbe5e7" strokeDasharray="4 4" />
                <XAxis
                  axisLine={false}
                  dataKey="label"
                  angle={-45}
                  dy={12}
                  height={66}
                  interval={0}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  tickFormatter={formatMonthTick}
                  tickLine={false}
                  textAnchor="end"
                />
                <YAxis
                  axisLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  tickFormatter={formatAxisValue}
                  tickLine={false}
                  width={56}
                />
                <Tooltip
                  formatter={(value) => [formatMoney(Number(value)), "Ahorrado"]}
                  labelClassName="font-semibold text-slate-950"
                />
                <Area
                  dataKey="balance"
                  dot={{ fill: "#0f766e", r: 4, stroke: "#ffffff", strokeWidth: 2 }}
                  fill="url(#savings-trend-fill)"
                  stroke="#0f766e"
                  strokeWidth={2.5}
                  type="monotone"
                />
              </AreaChart>
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
