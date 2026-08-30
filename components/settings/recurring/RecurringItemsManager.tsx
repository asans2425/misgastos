"use client";

import { useActionState, useMemo, useState } from "react";
import { CalendarPlus, Loader2, Save, Trash2 } from "lucide-react";
import {
  deleteRecurringItem,
  generateRecurringTransactions,
  saveRecurringItem,
  type RecurringFormState,
} from "@/app/app/settings/recurring/actions";
import { formatMoney, getMonthKey } from "@/lib/finance";
import { cn } from "@/lib/utils/cn";
import type { RecurringItemType } from "@/types/database";

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
  name: string;
};

type RecurringItem = {
  accountId: string | null;
  accountName: string;
  amount: number;
  categoryId: string | null;
  categoryName: string | null;
  dayOfMonth: number;
  id: string;
  isActive: boolean;
  isInvestment: boolean;
  name: string;
  subcategoryId: string | null;
  subcategoryName: string | null;
  type: RecurringItemType;
};

type RecurringItemsManagerProps = Readonly<{
  accounts: AccountOption[];
  categories: CategoryOption[];
  currentMonth: string;
  items: RecurringItem[];
  status?: string;
  subcategories: SubcategoryOption[];
}>;

type RecurringFormProps = Readonly<{
  accounts: AccountOption[];
  categories: CategoryOption[];
  item?: RecurringItem;
  subcategories: SubcategoryOption[];
}>;

const initialState: RecurringFormState = {};

function getStatusMessage(status?: string) {
  if (!status) {
    return null;
  }

  if (status === "created") return "Fijo creado correctamente.";
  if (status === "updated") return "Fijo actualizado correctamente.";
  if (status === "deleted") return "Fijo eliminado correctamente.";
  if (status.startsWith("generated-")) {
    const count = status.replace("generated-", "");

    return `${count} movimiento(s) fijo(s) generados para el mes.`;
  }
  if (status === "invalid-month") return "El mes seleccionado no es valido.";
  if (status === "generate-error") return "No se han podido generar los fijos.";

  return null;
}

function typeLabel(type: RecurringItemType) {
  if (type === "income") return "Ingreso";
  return "Gasto";
}

function typeTone(type: RecurringItemType) {
  if (type === "income") return "text-emerald-700 bg-emerald-50";
  return "text-rose-700 bg-rose-50";
}

function RecurringForm({
  accounts,
  categories,
  item,
  subcategories,
}: RecurringFormProps) {
  const [state, formAction, pending] = useActionState(
    saveRecurringItem,
    initialState,
  );
  const [type, setType] = useState<RecurringItemType>(item?.type ?? "expense");
  const [categoryId, setCategoryId] = useState(item?.categoryId ?? "");
  const filteredCategories = useMemo(
    () =>
      categories.filter((category) => category.type === type),
    [categories, type],
  );
  const filteredSubcategories = useMemo(
    () =>
      subcategories.filter((subcategory) =>
        categoryId ? subcategory.categoryId === categoryId : false,
      ),
    [categoryId, subcategories],
  );
  const defaultAccountId =
    item?.accountId ?? accounts.find((account) => account.name === "Cuenta normal")?.id;

  return (
    <form action={formAction} className="space-y-4">
      {item ? <input name="recurringId" type="hidden" value={item.id} /> : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-slate-700">Nombre</span>
          <input
            className="h-11 w-full rounded-md border border-border-soft bg-white px-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
            defaultValue={item?.name ?? ""}
            name="name"
            placeholder="Nomina, alquiler, Spotify..."
            required
            type="text"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-slate-700">Tipo</span>
          <select
            className="h-11 w-full rounded-md border border-border-soft bg-white px-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
            name="type"
            onChange={(event) => {
              const nextType = event.target.value as RecurringItemType;

              setType(nextType);
              setCategoryId("");
            }}
            value={type}
          >
            <option value="expense">Gasto</option>
            <option value="income">Ingreso</option>
          </select>
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-slate-700">Importe</span>
          <input
            className="h-11 w-full rounded-md border border-border-soft bg-white px-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
            defaultValue={item ? String(item.amount) : ""}
            inputMode="decimal"
            name="amount"
            placeholder="0,00"
            required
            type="text"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-slate-700">Dia del mes</span>
          <input
            className="h-11 w-full rounded-md border border-border-soft bg-white px-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
            defaultValue={item?.dayOfMonth ?? 1}
            max={31}
            min={1}
            name="dayOfMonth"
            required
            type="number"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-slate-700">Cuenta</span>
          <select
            className="h-11 w-full rounded-md border border-border-soft bg-white px-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
            defaultValue={defaultAccountId ?? ""}
            name="accountId"
            required
          >
            <option value="">Selecciona cuenta</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
        </label>

        <>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-slate-700">Categoria</span>
            <select
              className="h-11 w-full rounded-md border border-border-soft bg-white px-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
              name="categoryId"
              onChange={(event) => setCategoryId(event.target.value)}
              required
              value={categoryId}
            >
              <option value="">Selecciona categoria</option>
              {filteredCategories.map((category) => (
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
              defaultValue={item?.subcategoryId ?? ""}
              name="subcategoryId"
            >
              <option value="">Sin subcategoria</option>
              {filteredSubcategories.map((subcategory) => (
                <option key={subcategory.id} value={subcategory.id}>
                  {subcategory.name}
                </option>
              ))}
            </select>
          </label>
        </>
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-border-soft bg-surface-muted p-3 sm:flex-row sm:items-center sm:justify-between">
        <input name="isActive" type="hidden" value="off" />
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <input
            className="size-4 rounded border-border-soft text-brand focus:ring-brand"
            defaultChecked={item?.isActive ?? true}
            name="isActive"
            value="on"
            type="checkbox"
          />
          Activo
        </label>
        <p className="text-sm leading-6 text-slate-500">
          Los fijos activos se crean cuando pulsas Generar movimientos.
        </p>
      </div>

      {state.error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}

      <button
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-brand px-4 text-sm font-semibold text-white transition hover:bg-brand-strong disabled:opacity-70 sm:w-auto"
        disabled={pending}
        type="submit"
      >
        {pending ? (
          <Loader2 aria-hidden="true" className="animate-spin" size={18} />
        ) : (
          <Save aria-hidden="true" size={18} />
        )}
        {item ? "Guardar fijo" : "Crear fijo"}
      </button>
    </form>
  );
}

function RecurringItemCard({
  accounts,
  categories,
  item,
  subcategories,
}: RecurringFormProps & { item: RecurringItem }) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <article className="rounded-lg border border-border-soft bg-surface p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "rounded-full px-2.5 py-1 text-xs font-semibold",
                typeTone(item.type),
              )}
            >
              {typeLabel(item.type)}
            </span>
            {item.isInvestment ? (
              <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-900">
                Inversion
              </span>
            ) : null}
            {!item.isActive ? (
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                Pausado
              </span>
            ) : (
              <span className="rounded-full bg-teal-100 px-2.5 py-1 text-xs font-semibold text-teal-900">
                Se genera
              </span>
            )}
          </div>
          <h2 className="mt-3 text-base font-semibold text-slate-950">
            {item.name}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Dia {item.dayOfMonth} de cada mes · {item.accountName}
          </p>
          {item.categoryName ? (
            <p className="mt-1 text-sm text-slate-500">
              {item.categoryName}
              {item.subcategoryName ? ` · ${item.subcategoryName}` : ""}
            </p>
          ) : null}
        </div>
        <p className="shrink-0 text-right text-base font-semibold text-slate-950">
          {formatMoney(item.amount)}
        </p>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <button
          className="h-10 rounded-md border border-border-soft px-4 text-sm font-semibold text-slate-600 transition hover:bg-surface-muted"
          onClick={() => setIsEditing((current) => !current)}
          type="button"
        >
          {isEditing ? "Cerrar edicion" : "Editar"}
        </button>
        <form
          action={deleteRecurringItem}
          onSubmit={(event) => {
            if (!window.confirm("Seguro que quieres eliminar este fijo?")) {
              event.preventDefault();
            }
          }}
        >
          <input name="recurringId" type="hidden" value={item.id} />
          <button
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-red-200 px-4 text-sm font-semibold text-red-700 transition hover:bg-red-50 sm:w-auto"
            type="submit"
          >
            <Trash2 aria-hidden="true" size={16} />
            Eliminar
          </button>
        </form>
      </div>

      {isEditing ? (
        <div className="mt-4 border-t border-border-soft pt-4">
          <RecurringForm
            accounts={accounts}
            categories={categories}
            item={item}
            subcategories={subcategories}
          />
        </div>
      ) : null}
    </article>
  );
}

export function RecurringItemsManager({
  accounts,
  categories,
  currentMonth,
  items,
  status,
  subcategories,
}: RecurringItemsManagerProps) {
  const statusMessage = getStatusMessage(status);

  return (
    <div className="space-y-6">
      {statusMessage ? (
        <section className="rounded-lg border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-medium text-teal-800 shadow-sm">
          {statusMessage}
        </section>
      ) : null}

      <section className="rounded-lg border border-border-soft bg-surface p-4 shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-950">
            Generar fijos del mes
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Crea solo los fijos activos del mes y evita duplicados.
          </p>
        </div>
        <form
          action={generateRecurringTransactions}
          className="flex flex-col gap-3 sm:flex-row sm:items-end"
        >
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-slate-700">Mes</span>
            <input
              className="h-11 rounded-md border border-border-soft bg-white px-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
              defaultValue={currentMonth || getMonthKey()}
              name="month"
              type="month"
            />
          </label>
          <button
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-brand px-4 text-sm font-semibold text-white transition hover:bg-brand-strong"
            type="submit"
          >
            <CalendarPlus aria-hidden="true" size={18} />
            Generar movimientos
          </button>
        </form>
      </section>

      <section className="rounded-lg border border-border-soft bg-surface p-4 shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-950">Nuevo fijo</h2>
          <p className="mt-1 text-sm text-slate-500">
            Configura nominas, suscripciones, inversiones u otros fijos.
          </p>
        </div>
        <RecurringForm
          accounts={accounts}
          categories={categories}
          subcategories={subcategories}
        />
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">
            Fijos configurados
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Edita el importe normal cuando cambie para meses futuros.
          </p>
        </div>

        {items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border-soft bg-surface p-6 text-center shadow-sm">
            <p className="text-sm font-semibold text-slate-700">
              Todavia no tienes fijos configurados.
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Crea tu primer gasto o ingreso fijo.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <RecurringItemCard
                accounts={accounts}
                categories={categories}
                item={item}
                key={item.id}
                subcategories={subcategories}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
