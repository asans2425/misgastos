"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { CategoryEvolutionItem } from "@/lib/analysis";
import { formatMoney } from "@/lib/finance";

function formatAxisValue(value: number) {
  return String(Math.round(Number(value)));
}

export function CategoryEvolutionChart({
  items,
}: {
  items: readonly CategoryEvolutionItem[];
}) {
  const [selectedId, setSelectedId] = useState(items[0]?.id ?? "");
  const selected = useMemo(
    () => items.find((item) => item.id === selectedId) ?? items[0],
    [items, selectedId],
  );

  return (
    <section className="rounded-lg border border-border-soft bg-surface p-4 shadow-sm">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">
            Evolución por categoría
          </h2>
          <p className="text-sm text-slate-500">
            Elige una categoría o subcategoría para ver barras mes a mes.
          </p>
        </div>

        {items.length > 0 ? (
          <label className="block sm:min-w-64">
            <span className="sr-only">Categoría o subcategoría</span>
            <select
              className="h-11 w-full rounded-md border border-border-soft bg-white px-3 text-sm font-semibold text-slate-950 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
              onChange={(event) => setSelectedId(event.target.value)}
              value={selected?.id ?? ""}
            >
              {items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.parentName ? `${item.parentName} / ${item.name}` : item.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>

      {!selected ? (
        <p className="rounded-md bg-surface-muted p-4 text-sm text-slate-500">
          Añade algunos gastos para ver la evolución por categoría.
        </p>
      ) : (
        <>
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-950">
                {selected.parentName
                  ? `${selected.parentName} / ${selected.name}`
                  : selected.name}
              </p>
              <p className="text-xs text-slate-500">Total del periodo</p>
            </div>
            <p className="text-lg font-semibold text-slate-950">
              {formatMoney(selected.total)}
            </p>
          </div>

          <div className="h-64">
            <ResponsiveContainer height="100%" width="100%">
              <BarChart
                data={selected.points}
                margin={{ bottom: 6, left: 0, right: 6, top: 8 }}
              >
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
                  tickFormatter={formatAxisValue}
                  tickLine={false}
                  width={56}
                />
                <Tooltip
                  formatter={(value) => [formatMoney(Number(value)), "Gasto"]}
                  labelClassName="font-semibold text-slate-950"
                />
                <Bar dataKey="amount" fill="#0f766e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </section>
  );
}
