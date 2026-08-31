"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { CategoryAnalysis } from "@/lib/analysis";
import { formatMoney } from "@/lib/finance";
import { cn } from "@/lib/utils/cn";

export function CategoryBreakdown({
  categories,
}: {
  categories: readonly CategoryAnalysis[];
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const visibleCategories = showAll ? categories : categories.slice(0, 5);
  const max = categories[0]?.amount ?? 0;

  return (
    <section className="rounded-lg border border-border-soft bg-surface p-4 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-950">Categorías</h2>
        <p className="text-sm text-slate-500">
          Gasto neto del periodo, con reembolsos descontados.
        </p>
      </div>

      {categories.length === 0 ? (
        <p className="rounded-md bg-surface-muted p-4 text-sm text-slate-500">
          Añade algunos gastos para ver cómo se distribuyen por categorías.
        </p>
      ) : (
        <div className="space-y-2">
          {visibleCategories.map((category) => {
            const key = category.categoryId ?? category.categoryName;
            const isOpen = expanded === key;

            return (
              <div className="rounded-md bg-surface-muted p-3" key={key}>
                <button
                  className="flex w-full items-center justify-between gap-3 text-left"
                  onClick={() => setExpanded(isOpen ? null : key)}
                  type="button"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-sm font-semibold text-slate-950">
                        {category.categoryName}
                      </p>
                      <p className="shrink-0 text-sm font-semibold text-slate-950">
                        {formatMoney(category.amount)} · {category.percent}%
                      </p>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
                      <div
                        className="h-full rounded-full bg-brand"
                        style={{
                          width: `${max > 0 ? Math.max((category.amount / max) * 100, 4) : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                  <ChevronDown
                    aria-hidden="true"
                    className={cn("shrink-0 text-slate-400 transition", isOpen && "rotate-180")}
                    size={18}
                  />
                </button>

                {isOpen ? (
                  <div className="mt-3 space-y-2 border-t border-white pt-3">
                    {category.subcategories.length === 0 ? (
                      <p className="text-sm text-slate-500">
                        Sin subcategorías para esta categoría.
                      </p>
                    ) : (
                      category.subcategories.map((subcategory) => (
                        <div
                          className="flex items-center justify-between gap-3 text-sm"
                          key={subcategory.subcategoryId ?? subcategory.subcategoryName}
                        >
                          <span className="truncate text-slate-600">
                            {subcategory.subcategoryName}
                          </span>
                          <span className="font-semibold text-slate-900">
                            {formatMoney(subcategory.amount)}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                ) : null}
              </div>
            );
          })}

          {categories.length > 5 ? (
            <button
              className="mt-2 h-11 w-full rounded-md border border-border-soft bg-white text-sm font-semibold text-brand"
              onClick={() => setShowAll((value) => !value)}
              type="button"
            >
              {showAll ? "Ver top 5" : "Ver todas"}
            </button>
          ) : null}
        </div>
      )}
    </section>
  );
}
