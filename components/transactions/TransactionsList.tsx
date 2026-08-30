"use client";

import { useActionState, useMemo, useState } from "react";
import { CalendarDays, Pencil, Trash2 } from "lucide-react";
import {
  deleteTransaction,
  updateTransaction,
  type UpdateTransactionState,
} from "@/app/app/transactions/actions";
import { formatMoney } from "@/lib/finance";
import { cn } from "@/lib/utils/cn";
import type { TransactionStatus, TransactionType } from "@/types/database";

type CategoryOption = {
  id: string;
  name: string;
  type: "expense" | "income" | "special";
};

type SubcategoryOption = {
  categoryId: string;
  id: string;
  isTravelIncome: boolean;
  name: string;
};

type TransactionItem = {
  amount: number;
  categoryId: string | null;
  categoryName: string;
  date: string;
  description: string | null;
  id: string;
  isInvestment: boolean;
  isTravelIncome: boolean;
  status: TransactionStatus;
  subcategoryId: string | null;
  subcategoryName: string;
  type: TransactionType;
};

type TransactionGroup = {
  date: string;
  items: TransactionItem[];
};

type TransactionEditorProps = Readonly<{
  categories: CategoryOption[];
  returnTo: string;
  subcategories: SubcategoryOption[];
  transaction: TransactionItem;
}>;

type TransactionsListProps = Readonly<{
  categories: CategoryOption[];
  groups: TransactionGroup[];
  returnTo: string;
  subcategories: SubcategoryOption[];
}>;

const initialState: UpdateTransactionState = {};

function formatDisplayDate(value: string) {
  const date = new Date(`${value}T00:00:00`);

  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
    weekday: "long",
  }).format(date);
}

function getSignedAmountLabel(amount: number, type: TransactionType) {
  if (type === "expense") {
    return `-${formatMoney(amount)}`;
  }

  if (type === "income") {
    return `+${formatMoney(amount)}`;
  }

  return formatMoney(amount);
}

function getAmountTone(type: TransactionType) {
  if (type === "expense") {
    return "text-rose-700";
  }

  if (type === "income") {
    return "text-emerald-700";
  }

  return "text-slate-900";
}

function getPrimaryLabel(transaction: TransactionItem) {
  if (transaction.description?.trim()) {
    return transaction.description.trim();
  }

  if (transaction.subcategoryName !== "Sin subcategoria") {
    return transaction.subcategoryName;
  }

  return transaction.categoryName;
}

function TransactionEditor({
  categories,
  returnTo,
  subcategories,
  transaction,
}: TransactionEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [state, formAction, pending] = useActionState(
    updateTransaction,
    initialState,
  );
  const [categoryId, setCategoryId] = useState(transaction.categoryId ?? "");
  const editableCategories = useMemo(
    () =>
      categories.filter((category) =>
        transaction.type === "income"
          ? category.type === "income"
          : category.type === "expense",
      ),
    [categories, transaction.type],
  );
  const editableSubcategories = useMemo(
    () =>
      subcategories.filter((subcategory) =>
        categoryId ? subcategory.categoryId === categoryId : false,
      ),
    [categoryId, subcategories],
  );

  return (
    <article className="rounded-lg border border-border-soft bg-surface p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-400">
            <CalendarDays aria-hidden="true" size={14} />
            {formatDisplayDate(transaction.date)}
          </div>
          <p
            className={cn(
              "mt-3 text-lg font-semibold",
              getAmountTone(transaction.type),
            )}
          >
            {getSignedAmountLabel(transaction.amount, transaction.type)}
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-900">
            {getPrimaryLabel(transaction)}
          </p>
          <p className="mt-1 text-sm text-slate-500">{transaction.categoryName}</p>
          <p className="mt-2 text-xs font-medium uppercase tracking-wide text-slate-400">
            {transaction.type === "expense"
              ? "Gasto"
              : transaction.type === "income"
                ? "Ingreso"
                : "Transferencia"}
          </p>
        </div>

        <button
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border-soft px-3 text-sm font-semibold text-slate-600 transition hover:bg-surface-muted"
          onClick={() => setIsEditing((current) => !current)}
          type="button"
        >
          <Pencil aria-hidden="true" size={16} />
          Editar
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {transaction.isTravelIncome ? (
          <span className="rounded-full bg-sky-100 px-2.5 py-1 text-xs font-semibold text-sky-900">
            VIAJES
          </span>
        ) : null}
        {transaction.isInvestment ? (
          <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-900">
            Inversion
          </span>
        ) : null}
        {transaction.status === "pending" ? (
          <span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-900">
            Pendiente
          </span>
        ) : (
          <span className="rounded-full bg-teal-100 px-2.5 py-1 text-xs font-semibold text-teal-900">
            Confirmado
          </span>
        )}
      </div>

      {isEditing ? (
        <div className="mt-4 space-y-4 border-t border-border-soft pt-4">
          <form action={formAction} className="space-y-4">
            <input name="transactionId" type="hidden" value={transaction.id} />
            <input name="returnTo" type="hidden" value={returnTo} />
            <input name="type" type="hidden" value={transaction.type} />

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-slate-700">Importe</span>
                <input
                  className="h-11 w-full rounded-md border border-border-soft bg-white px-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                  defaultValue={String(transaction.amount)}
                  inputMode="decimal"
                  name="amount"
                  required
                  type="text"
                />
              </label>

              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-slate-700">Fecha</span>
                <input
                  className="h-11 w-full rounded-md border border-border-soft bg-white px-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                  defaultValue={transaction.date}
                  name="date"
                  required
                  type="date"
                />
              </label>
            </div>

            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-slate-700">Categoria</span>
              <select
                className="h-11 w-full rounded-md border border-border-soft bg-white px-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                defaultValue={transaction.categoryId ?? ""}
                name="categoryId"
                onChange={(event) => setCategoryId(event.target.value)}
                required={transaction.type === "expense"}
              >
                {transaction.type === "expense" ? (
                  <option value="">Selecciona una categoria</option>
                ) : null}
                {editableCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-slate-700">
                Subcategoria
              </span>
              <select
                className="h-11 w-full rounded-md border border-border-soft bg-white px-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                defaultValue={transaction.subcategoryId ?? ""}
                name="subcategoryId"
                required={transaction.type === "income"}
              >
                <option value="">
                  {transaction.type === "income"
                    ? "Selecciona una subcategoria"
                    : "Sin subcategoria"}
                </option>
                {editableSubcategories.map((subcategory) => (
                  <option key={subcategory.id} value={subcategory.id}>
                    {subcategory.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-slate-700">
                Descripcion
              </span>
              <input
                className="h-11 w-full rounded-md border border-border-soft bg-white px-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                defaultValue={transaction.description ?? ""}
                name="description"
                type="text"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-slate-700">Estado</span>
              <select
                className="h-11 w-full rounded-md border border-border-soft bg-white px-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                defaultValue={transaction.status}
                name="status"
              >
                <option value="pending">Pendiente</option>
                <option value="confirmed">Confirmado</option>
                <option value="edited">Editado</option>
              </select>
            </label>

            {state.error ? (
              <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {state.error}
              </p>
            ) : null}

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                className="h-11 rounded-md bg-brand px-4 text-sm font-semibold text-white transition hover:bg-brand-strong disabled:opacity-70"
                disabled={pending}
                type="submit"
              >
                Guardar cambios
              </button>
              <button
                className="h-11 rounded-md border border-border-soft px-4 text-sm font-semibold text-slate-600 transition hover:bg-surface-muted"
                onClick={() => setIsEditing(false)}
                type="button"
              >
                Cancelar
              </button>
            </div>
          </form>

          <form
            action={deleteTransaction}
            onSubmit={(event) => {
              if (!window.confirm("Seguro que quieres eliminar este movimiento?")) {
                event.preventDefault();
              }
            }}
          >
            <input name="transactionId" type="hidden" value={transaction.id} />
            <input name="returnTo" type="hidden" value={returnTo} />
            <button
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-red-200 px-3 text-sm font-semibold text-red-700 transition hover:bg-red-50"
              type="submit"
            >
              <Trash2 aria-hidden="true" size={16} />
              Eliminar
            </button>
          </form>
        </div>
      ) : null}
    </article>
  );
}

export function TransactionsList({
  categories,
  groups,
  returnTo,
  subcategories,
}: TransactionsListProps) {
  return (
    <div className="space-y-5">
      {groups.map((group) => (
        <section key={group.date} className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
            <CalendarDays aria-hidden="true" size={16} />
            {formatDisplayDate(group.date)}
          </div>
          <div className="space-y-3">
            {group.items.map((transaction) => (
              <TransactionEditor
                categories={categories}
                key={transaction.id}
                returnTo={returnTo}
                subcategories={subcategories}
                transaction={transaction}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
