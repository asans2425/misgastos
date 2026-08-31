"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CircleDollarSign, ListPlus, Loader2, X } from "lucide-react";
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
          "rounded-lg border border-border-soft bg-surface p-3 shadow-sm",
          className,
        )}
      >
        <div className="mb-2 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-950 sm:text-base">
              AÑADIR GASTO RÁPIDO
            </h2>
            <p className="hidden text-xs text-slate-500 sm:block">
              Toca una categoria habitual.
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

        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:mx-0 sm:grid sm:grid-cols-[repeat(auto-fit,minmax(118px,1fr))] sm:overflow-visible sm:px-0">
          {actions.map((action) => (
            <button
              className="min-h-9 min-w-24 shrink-0 rounded-md border border-border-soft bg-white px-3 py-1.5 text-center text-xs font-semibold leading-tight text-slate-700 transition hover:border-brand hover:bg-teal-50 sm:min-h-10 sm:min-w-0"
              key={action.id}
              onClick={() => setActiveAction(action)}
              type="button"
            >
              {action.label}
            </button>
          ))}
        </div>
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
