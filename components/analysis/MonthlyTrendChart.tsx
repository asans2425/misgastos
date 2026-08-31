"use client";

import { useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MonthlyTrendPoint } from "@/lib/analysis";
import { formatMoney } from "@/lib/finance";
import { cn } from "@/lib/utils/cn";

type Metric = "balance" | "expenses" | "income";

const metrics: Array<{ label: string; value: Metric }> = [
  { label: "Gastos", value: "expenses" },
  { label: "Ingresos", value: "income" },
  { label: "Balance", value: "balance" },
];

export function MonthlyTrendChart({
  data,
}: {
  data: readonly MonthlyTrendPoint[];
}) {
  const [metric, setMetric] = useState<Metric>("expenses");
  const average =
    data.length > 0
      ? data.reduce((total, point) => total + point[metric], 0) / data.length
      : 0;

  return (
    <section className="rounded-lg border border-border-soft bg-surface p-4 shadow-sm">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Evolución</h2>
          <p className="text-sm text-slate-500">
            Comportamiento mensual del periodo.
          </p>
        </div>
        <div className="grid grid-cols-3 rounded-md bg-surface-muted p-1">
          {metrics.map((item) => (
            <button
              className={cn(
                "rounded-md px-3 py-2 text-sm font-semibold text-slate-500",
                item.value === metric && "bg-white text-brand shadow-sm",
              )}
              key={item.value}
              onClick={() => setMetric(item.value)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {data.every((point) => point.expenses === 0 && point.income === 0) ? (
        <p className="rounded-md bg-surface-muted p-4 text-sm text-slate-500">
          Añade algunos movimientos para ver la evolución mensual.
        </p>
      ) : (
        <div className="h-64">
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
                formatter={(value) => [formatMoney(Number(value)), ""]}
                labelClassName="font-semibold text-slate-950"
              />
              {average > 0 ? (
                <ReferenceLine
                  stroke="#94a3b8"
                  strokeDasharray="4 4"
                  y={average}
                />
              ) : null}
              <Line
                dataKey={metric}
                dot={{ r: 3 }}
                stroke={metric === "expenses" ? "#d97706" : "#0f766e"}
                strokeWidth={3}
                type="monotone"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
