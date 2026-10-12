"use client";

import { useActionState, useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { createTransaction, type CreateTransactionState } from "@/app/app/add/actions";
import { isInvestmentCategoryOrSubcategory } from "@/lib/finance/transactionRules";
import type { AddTransactionMode } from "@/types/finance";

type AccountOption = {
  id: string;
  name: string;
};

type CategoryOption = {
  id: string;
  name: string;
  type: "expense" | "income" | "special";
};

type SubcategoryOption = {
  categoryId: string;
  id: string;
  isInvestment: boolean;
  isTravelIncome: boolean;
  name: string;
};

type ReimbursementTargetOption = {
  id: string;
  label: string;
};

type SavingsBucketOption = {
  id: string;
  name: string;
};

type TransactionDraftFormProps = Readonly<{
  accounts: AccountOption[];
  categories: CategoryOption[];
  defaultAccountId: string;
  defaultDate: string;
  reimbursementTargets: ReimbursementTargetOption[];
  savingsBuckets: SavingsBucketOption[];
  subcategories: SubcategoryOption[];
}>;

const initialState: CreateTransactionState = {};

export function TransactionDraftForm({
  accounts,
  categories,
  defaultAccountId,
  defaultDate,
  reimbursementTargets,
  savingsBuckets,
  subcategories,
}: TransactionDraftFormProps) {
  const [state, formAction, pending] = useActionState(
    createTransaction,
    initialState,
  );
  const [type, setType] = useState<AddTransactionMode>("expense");
  const [categoryId, setCategoryId] = useState("");
  const [isInvestment, setIsInvestment] = useState(false);
  const [investmentBucketId, setInvestmentBucketId] = useState("");
  const [isReimbursement, setIsReimbursement] = useState(false);
  const [subcategoryId, setSubcategoryId] = useState("");

  const expenseCategories = useMemo(
    () => categories.filter((category) => category.type === "expense"),
    [categories],
  );
  const expenseSubcategories = useMemo(
    () =>
      subcategories.filter((subcategory) =>
        categoryId ? subcategory.categoryId === categoryId : false,
      ),
    [categoryId, subcategories],
  );
  const incomeSubcategories = useMemo(
    () => {
      const incomeCategoryIds = new Set(
        categories
          .filter((category) => category.type === "income")
          .map((category) => category.id),
      );

      return subcategories.filter((subcategory) =>
        incomeCategoryIds.has(subcategory.categoryId),
      );
    },
    [categories, subcategories],
  );
  const isInvestmentSelected = type === "expense" && isInvestment;

  return (
    <form
      action={formAction}
      className="space-y-5 rounded-lg border border-border-soft bg-surface p-4 shadow-sm"
    >
      <div className="grid grid-cols-2 gap-2 rounded-lg bg-surface-muted p-1">
        <button
          className={`h-11 rounded-md text-sm font-semibold transition ${
            type === "expense"
              ? "bg-brand text-white"
              : "text-slate-600 hover:bg-white"
          }`}
          onClick={() => {
            setType("expense");
            setIsReimbursement(false);
            setSubcategoryId("");
          }}
          type="button"
        >
          Gasto
        </button>
        <button
          className={`h-11 rounded-md text-sm font-semibold transition ${
            type === "income"
              ? "bg-brand text-white"
              : "text-slate-600 hover:bg-white"
          }`}
          onClick={() => {
            setType("income");
            setIsInvestment(false);
            setInvestmentBucketId("");
            setCategoryId("");
            setSubcategoryId("");
          }}
          type="button"
        >
          Ingreso
        </button>
      </div>

      <input name="type" type="hidden" value={type} />

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-slate-700">Importe</span>
          <input
            className="h-12 w-full rounded-md border border-border-soft bg-white px-3 text-base outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
            inputMode="decimal"
            name="amount"
            placeholder="0,00"
            required
            type="text"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-slate-700">Fecha</span>
          <input
            className="h-12 w-full rounded-md border border-border-soft bg-white px-3 text-base outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
            defaultValue={defaultDate}
            name="date"
            required
            type="date"
          />
        </label>
      </div>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-slate-700">
          Cuenta principal
        </span>
        <select
          className="h-12 w-full rounded-md border border-border-soft bg-white px-3 text-base outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
          defaultValue={defaultAccountId}
          name="accountId"
          required
        >
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.name}
            </option>
          ))}
        </select>
      </label>

      {type === "expense" ? (
        <>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-slate-700">Categoria</span>
            <select
              className="h-12 w-full rounded-md border border-border-soft bg-white px-3 text-base outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
              name="categoryId"
              onChange={(event) => {
                setCategoryId(event.target.value);
                setSubcategoryId("");
                const category = categories.find(
                  (item) => item.id === event.target.value,
                );
                const categoryIsInvestment = category
                  ? isInvestmentCategoryOrSubcategory(category.name)
                  : false;
                setIsInvestment(categoryIsInvestment);
                if (!categoryIsInvestment) {
                  setInvestmentBucketId("");
                }
              }}
              required
              value={categoryId}
            >
              <option value="">Selecciona una categoria</option>
              {expenseCategories.map((category) => (
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
              className="h-12 w-full rounded-md border border-border-soft bg-white px-3 text-base outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
              name="subcategoryId"
              onChange={(event) => setSubcategoryId(event.target.value)}
              value={subcategoryId}
            >
              <option value="">Sin subcategoria</option>
              {expenseSubcategories.map((subcategory) => (
                <option key={subcategory.id} value={subcategory.id}>
                  {subcategory.name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-3 rounded-md border border-border-soft bg-surface-muted px-3 py-3">
            <input
              checked={isInvestment}
              className="size-4"
              name="isInvestment"
              onChange={(event) => {
                setIsInvestment(event.target.checked);
                if (!event.target.checked) {
                  setInvestmentBucketId("");
                }
              }}
              type="checkbox"
            />
            <span className="text-sm font-medium text-slate-700">
              Marcar como inversion
            </span>
          </label>

          {isInvestmentSelected ? (
            <label className="block space-y-1.5 rounded-md border border-amber-200 bg-amber-50 px-3 py-3">
              <span className="text-sm font-medium text-amber-950">
                Hucha de inversión (opcional)
              </span>
              <select
                className="h-12 w-full rounded-md border border-amber-200 bg-white px-3 text-base outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                name="investmentBucketId"
                onChange={(event) => setInvestmentBucketId(event.target.value)}
                value={investmentBucketId}
              >
                <option value="">Ninguna hucha</option>
                {savingsBuckets.map((bucket) => (
                  <option key={bucket.id} value={bucket.id}>
                    {bucket.name}
                  </option>
                ))}
              </select>
              <span className="block text-xs text-amber-900">
                Se resta de la cuenta principal y se suma a la hucha sin crear
                otro gasto.
              </span>
            </label>
          ) : null}
        </>
      ) : (
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-slate-700">
            Fuente / subcategoria
          </span>
          <select
            className="h-12 w-full rounded-md border border-border-soft bg-white px-3 text-base outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
            name="subcategoryId"
            onChange={(event) => setSubcategoryId(event.target.value)}
            required={!isReimbursement}
            value={subcategoryId}
          >
            <option value="">Selecciona una fuente</option>
            {incomeSubcategories.map((subcategory) => (
              <option key={subcategory.id} value={subcategory.id}>
                {subcategory.name}
              </option>
            ))}
          </select>
        </label>
      )}

      {type === "income" ? (
        <div className="space-y-3 rounded-md border border-border-soft bg-surface-muted px-3 py-3">
          <label className="flex items-center gap-3">
            <input
              className="size-4"
              checked={isReimbursement}
              name="isReimbursement"
              onChange={(event) => setIsReimbursement(event.target.checked)}
              type="checkbox"
              value="on"
            />
            <span className="text-sm font-medium text-slate-700">
              Es un reembolso de un gasto que pague yo
            </span>
          </label>

          {isReimbursement ? (
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-slate-700">
                Gasto asociado
              </span>
              <select
                className="h-12 w-full rounded-md border border-border-soft bg-white px-3 text-base outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                name="reimbursesTransactionId"
                required={isReimbursement}
              >
                <option value="">Selecciona el gasto original</option>
                {reimbursementTargets.map((target) => (
                  <option key={target.id} value={target.id}>
                    {target.label}
                  </option>
                ))}
              </select>
              <span className="block text-xs text-slate-500">
                Se restara de ese gasto en las estadisticas.
              </span>
            </label>
          ) : null}
        </div>
      ) : null}

      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-slate-700">
          Descripcion opcional
        </span>
        <input
          className="h-12 w-full rounded-md border border-border-soft bg-white px-3 text-base outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
          name="description"
          placeholder="Notas, comercio o detalle rapido"
          type="text"
        />
      </label>

      {state.error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}

      <div className="rounded-md border border-teal-200 bg-teal-50 px-3 py-2 text-sm text-teal-700">
        <div className="flex items-center gap-2">
          <CheckCircle2 aria-hidden="true" size={16} />
          Los importes se guardan siempre en positivo.
        </div>
      </div>

      <button
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-brand px-4 text-base font-semibold text-white transition hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-70"
        disabled={pending}
        type="submit"
      >
        {pending ? (
          <Loader2 aria-hidden="true" className="animate-spin" size={18} />
        ) : (
          <ArrowRight aria-hidden="true" size={18} />
        )}
        Guardar movimiento
      </button>
    </form>
  );
}
