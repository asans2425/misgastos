"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  CircleDollarSign,
  ListPlus,
  Loader2,
  Sparkles,
  X,
} from "lucide-react";
import { createQuickExpense, type QuickExpenseState } from "@/app/app/actions";
import { cn } from "@/lib/utils/cn";

type QuickActionItem = {
  accountId: string;
  categoryName: string;
  date: string;
  id: string;
  label: string;
  subcategoryName: string | null;
};

type QuickActionsPanelProps = Readonly<{
  actions: QuickActionItem[];
  className?: string;
}>;

const initialState: QuickExpenseState = {};

function ModalForm({
  action,
  onClose,
  onSuccess,
}: {
  action: QuickActionItem;
  onClose: () => void;
  onSuccess: (message: string) => void;
}) {
  const [state, formAction, pending] = useActionState(
    createQuickExpense,
    initialState,
  );

  useEffect(() => {
    if (state.success) {
      onSuccess(state.successMessage ?? "Movimiento guardado correctamente.");
    }
  }, [onSuccess, state.success, state.successMessage]);

  return (
    <div className="fixed inset-0 z-40 flex items-end bg-slate-950/45 p-0 sm:items-center sm:justify-center sm:p-4">
      <div className="w-full rounded-t-xl bg-white p-4 shadow-2xl sm:max-w-md sm:rounded-lg">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-950">
              {action.label}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {action.categoryName}
              {action.subcategoryName ? ` · ${action.subcategoryName}` : ""}
            </p>
          </div>
          <button
            className="inline-flex size-10 items-center justify-center rounded-md border border-border-soft text-slate-500 transition hover:bg-surface-muted"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" size={18} />
          </button>
        </div>

        <form action={formAction} className="space-y-4">
          <input name="quickActionId" type="hidden" value={action.id} />
          <input name="accountId" type="hidden" value={action.accountId} />
          <input name="date" type="hidden" value={action.date} />

          <div className="rounded-lg border border-border-soft bg-surface-muted px-3 py-3 text-sm text-slate-600">
            <p>Cuenta normal preseleccionada</p>
            <p className="mt-1">Fecha: {action.date}</p>
          </div>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-slate-700">Importe</span>
            <input
              autoFocus
              className="h-14 w-full rounded-md border border-border-soft bg-white px-4 text-xl outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
              inputMode="decimal"
              name="amount"
              placeholder="0,00"
              required
              type="text"
            />
          </label>

          {state.error ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {state.error}
            </p>
          ) : null}

          <button
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-brand px-4 text-base font-semibold text-white transition hover:bg-brand-strong disabled:opacity-70"
            disabled={pending}
            type="submit"
          >
            {pending ? (
              <Loader2 aria-hidden="true" className="animate-spin" size={18} />
            ) : (
              <CircleDollarSign aria-hidden="true" size={18} />
            )}
            Guardar gasto
          </button>
        </form>
      </div>
    </div>
  );
}

export function QuickActionsPanel({ actions, className }: QuickActionsPanelProps) {
  const router = useRouter();
  const [activeAction, setActiveAction] = useState<QuickActionItem | null>(null);
  const [showHabituals, setShowHabituals] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    if (!toastMessage) {
      return;
    }

    const timeoutId = window.setTimeout(() => setToastMessage(""), 2600);

    return () => window.clearTimeout(timeoutId);
  }, [toastMessage]);

  return (
    <>
      <section
        className={cn(
          "relative rounded-lg border border-border-soft bg-surface p-3 shadow-sm sm:p-4",
          className,
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-950 sm:text-base">
              AÑADIR GASTO RÁPIDO
            </h2>
            <p className="hidden text-xs text-slate-500 sm:block">
              Elige uno de tus gastos más habituales.
            </p>
          </div>
          <Link
            className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md bg-brand px-3 text-xs font-semibold text-white transition hover:bg-brand-strong sm:text-sm"
            href="/app/add"
          >
            <ListPlus aria-hidden="true" size={16} />
            <span className="hidden min-[520px]:inline">Movimiento completo</span>
            <span className="min-[520px]:hidden">Completo</span>
          </Link>
        </div>

        <button
          className="mt-3 flex min-h-14 w-full items-center justify-between gap-3 rounded-lg border border-brand/20 bg-teal-50 px-4 py-3 text-left transition hover:border-brand/40 hover:bg-teal-100"
          onClick={() => setShowHabituals((visible) => !visible)}
          type="button"
        >
          <span className="flex min-w-0 items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-brand text-white">
              <Sparkles aria-hidden="true" size={18} />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-teal-950">
                Gastos habituales
              </span>
              <span className="block truncate text-xs text-teal-800">
                Tus {Math.min(actions.length, 10)} accesos más usados
              </span>
            </span>
          </span>
          <ChevronDown
            aria-hidden="true"
            className={cn("shrink-0 transition-transform", showHabituals && "rotate-180")}
            size={19}
          />
        </button>

        {showHabituals ? (
          <div className="moneyflow-quick-popover absolute bottom-[4.5rem] right-3 z-30 w-[min(320px,calc(100vw-2rem))] overflow-hidden rounded-lg border border-border-soft bg-white p-2 shadow-xl sm:right-4">
            <p className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Tus gastos más habituales
            </p>
            <div className="max-h-72 space-y-1 overflow-y-auto">
              {actions.slice(0, 10).map((action) => (
                <button
                  className="flex min-h-11 w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-teal-50 hover:text-teal-950"
                  key={action.id}
                  onClick={() => {
                    setShowHabituals(false);
                    setActiveAction(action);
                  }}
                  type="button"
                >
                  <span className="min-w-0 truncate">{action.label}</span>
                  <span className="shrink-0 text-xs text-slate-400">
                    {action.categoryName}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      {activeAction ? (
        <ModalForm
          action={activeAction}
          onClose={() => setActiveAction(null)}
          onSuccess={(message) => {
            setActiveAction(null);
            setToastMessage(message);
            router.refresh();
          }}
        />
      ) : null}

      {toastMessage ? (
        <div className="fixed inset-x-4 bottom-24 z-50 rounded-lg border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-900 shadow-lg sm:inset-x-auto sm:right-6 sm:w-80">
          {toastMessage}
        </div>
      ) : null}
    </>
  );
}
