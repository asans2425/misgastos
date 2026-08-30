"use client";

import { useActionState, useState } from "react";
import { ArrowDownToLine, ArrowUpFromLine, Loader2, Save, Trash2 } from "lucide-react";
import {
  createBucketMovement,
  deleteBucket,
  saveBucket,
  type BucketFormState,
} from "@/app/app/settings/buckets/actions";
import { formatMoney } from "@/lib/finance";
import type { BucketMovementType } from "@/types/database";

type BucketItem = {
  color: string | null;
  currentBalance: number;
  icon: string | null;
  id: string;
  initialBalance: number;
  isActive: boolean;
  name: string;
  targetAmount: number | null;
};

type BucketsManagerProps = Readonly<{
  buckets: BucketItem[];
  defaultDate: string;
  status?: string;
}>;

const initialState: BucketFormState = {};

function getStatusMessage(status?: string) {
  if (!status) return null;
  if (status === "created") return "Hucha creada correctamente.";
  if (status === "updated") return "Hucha actualizada correctamente.";
  if (status === "deleted") return "Hucha eliminada correctamente.";
  if (status === "contributed") return "Aportacion registrada.";
  if (status === "withdrawn") return "Retirada registrada.";
  if (status === "delete-error") {
    return "No se puede eliminar porque tiene movimientos. Puedes pausarla.";
  }

  return null;
}

function BucketForm({ bucket }: { bucket?: BucketItem }) {
  const [state, formAction, pending] = useActionState(saveBucket, initialState);

  return (
    <form action={formAction} className="space-y-4">
      {bucket ? <input name="bucketId" type="hidden" value={bucket.id} /> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-slate-700">Nombre</span>
          <input
            className="h-11 w-full rounded-md border border-border-soft bg-white px-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
            defaultValue={bucket?.name ?? ""}
            name="name"
            placeholder="AHORROS, VIAJES, COCHE..."
            required
            type="text"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-slate-700">
            Saldo inicial
          </span>
          <input
            className="h-11 w-full rounded-md border border-border-soft bg-white px-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
            defaultValue={bucket?.initialBalance ?? ""}
            inputMode="decimal"
            name="initialBalance"
            placeholder="0,00"
            type="text"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-slate-700">Objetivo</span>
          <input
            className="h-11 w-full rounded-md border border-border-soft bg-white px-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
            defaultValue={bucket?.targetAmount ?? ""}
            inputMode="decimal"
            name="targetAmount"
            placeholder="Opcional"
            type="text"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-slate-700">Icono</span>
          <input
            className="h-11 w-full rounded-md border border-border-soft bg-white px-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
            defaultValue={bucket?.icon ?? ""}
            name="icon"
            placeholder="piggy-bank, plane, car..."
            type="text"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-slate-700">Color</span>
          <input
            className="h-11 w-full rounded-md border border-border-soft bg-white px-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
            defaultValue={bucket?.color ?? "#14b8a6"}
            name="color"
            type="color"
          />
        </label>
      </div>

      <input name="isActive" type="hidden" value="off" />
      <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
        <input
          className="size-4 rounded border-border-soft text-brand focus:ring-brand"
          defaultChecked={bucket?.isActive ?? true}
          name="isActive"
          type="checkbox"
          value="on"
        />
        Activa
      </label>

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
        {bucket ? "Guardar hucha" : "Crear hucha"}
      </button>
    </form>
  );
}

function BucketMovementForm({
  bucket,
  defaultDate,
  type,
}: {
  bucket: BucketItem;
  defaultDate: string;
  type: BucketMovementType;
}) {
  const [state, formAction, pending] = useActionState(
    createBucketMovement,
    initialState,
  );
  const isContribution = type === "contribution";

  return (
    <form action={formAction} className="space-y-3">
      <input name="bucketId" type="hidden" value={bucket.id} />
      <input name="type" type="hidden" value={type} />
      <input name="date" type="hidden" value={defaultDate} />
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
        <span className="text-sm font-medium text-slate-700">Nota</span>
        <input
          className="h-11 w-full rounded-md border border-border-soft bg-white px-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
          name="description"
          placeholder={isContribution ? "Aparto para esta hucha" : "Devuelvo a principal"}
          type="text"
        />
      </label>
      {state.error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      <button
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-brand px-4 text-sm font-semibold text-white transition hover:bg-brand-strong disabled:opacity-70"
        disabled={pending}
        type="submit"
      >
        {pending ? (
          <Loader2 aria-hidden="true" className="animate-spin" size={18} />
        ) : isContribution ? (
          <ArrowDownToLine aria-hidden="true" size={18} />
        ) : (
          <ArrowUpFromLine aria-hidden="true" size={18} />
        )}
        {isContribution ? "Aportar" : "Retirar"}
      </button>
    </form>
  );
}

function BucketCard({
  bucket,
  defaultDate,
}: {
  bucket: BucketItem;
  defaultDate: string;
}) {
  const [mode, setMode] = useState<"edit" | "contribution" | "withdrawal" | null>(
    null,
  );
  const progress =
    bucket.targetAmount && bucket.targetAmount > 0
      ? Math.min((bucket.currentBalance / bucket.targetAmount) * 100, 100)
      : null;

  return (
    <article className="rounded-lg border border-border-soft bg-surface p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap gap-2">
            {!bucket.isActive ? (
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                Pausada
              </span>
            ) : null}
          </div>
          <h2 className="mt-2 text-base font-semibold text-slate-950">
            {bucket.name}
          </h2>
          <p className="mt-1 text-2xl font-semibold text-slate-950">
            {formatMoney(bucket.currentBalance)}
          </p>
          {bucket.initialBalance > 0 ? (
            <p className="mt-1 text-sm text-slate-500">
              Saldo inicial: {formatMoney(bucket.initialBalance)}
            </p>
          ) : null}
          {bucket.targetAmount ? (
            <p className="mt-1 text-sm text-slate-500">
              Objetivo: {formatMoney(bucket.targetAmount)}
            </p>
          ) : null}
        </div>
        <span
          aria-hidden="true"
          className="size-9 shrink-0 rounded-md border border-border-soft"
          style={{ backgroundColor: bucket.color ?? "#e2e8f0" }}
        />
      </div>

      {progress !== null ? (
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-surface-muted">
          <div
            className="h-full rounded-full bg-brand"
            style={{ width: `${progress}%` }}
          />
        </div>
      ) : null}

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <button
          className="h-10 rounded-md bg-brand px-3 text-sm font-semibold text-white transition hover:bg-brand-strong"
          onClick={() => setMode(mode === "contribution" ? null : "contribution")}
          type="button"
        >
          Aportar
        </button>
        <button
          className="h-10 rounded-md border border-border-soft px-3 text-sm font-semibold text-slate-600 transition hover:bg-surface-muted"
          onClick={() => setMode(mode === "withdrawal" ? null : "withdrawal")}
          type="button"
        >
          Retirar
        </button>
        <button
          className="h-10 rounded-md border border-border-soft px-3 text-sm font-semibold text-slate-600 transition hover:bg-surface-muted"
          onClick={() => setMode(mode === "edit" ? null : "edit")}
          type="button"
        >
          Editar
        </button>
        <form
          action={deleteBucket}
          onSubmit={(event) => {
            if (!window.confirm("Seguro que quieres eliminar esta hucha?")) {
              event.preventDefault();
            }
          }}
        >
          <input name="bucketId" type="hidden" value={bucket.id} />
          <button
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-red-200 px-3 text-sm font-semibold text-red-700 transition hover:bg-red-50"
            type="submit"
          >
            <Trash2 aria-hidden="true" size={16} />
          </button>
        </form>
      </div>

      {mode ? (
        <div className="mt-4 border-t border-border-soft pt-4">
          {mode === "edit" ? (
            <BucketForm bucket={bucket} />
          ) : (
            <BucketMovementForm
              bucket={bucket}
              defaultDate={defaultDate}
              type={mode}
            />
          )}
        </div>
      ) : null}
    </article>
  );
}

export function BucketsManager({
  buckets,
  defaultDate,
  status,
}: BucketsManagerProps) {
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
          <h2 className="text-lg font-semibold text-slate-950">Nueva hucha</h2>
          <p className="mt-1 text-sm text-slate-500">
            Crea compartimentos para apartar dinero sin afectar a estadisticas.
          </p>
        </div>
        <BucketForm />
      </section>

      {buckets.length === 0 ? (
        <section className="rounded-lg border border-dashed border-border-soft bg-surface p-6 text-center shadow-sm">
          <p className="text-sm font-semibold text-slate-700">
            Todavia no tienes huchas.
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Crea AHORROS, VIAJES, COCHE o lo que necesites.
          </p>
        </section>
      ) : (
        <section className="grid gap-4 xl:grid-cols-2">
          {buckets.map((bucket) => (
            <BucketCard
              bucket={bucket}
              defaultDate={defaultDate}
              key={bucket.id}
            />
          ))}
        </section>
      )}
    </div>
  );
}
