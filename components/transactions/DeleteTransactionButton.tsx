"use client";

import { Trash2 } from "lucide-react";
import { deleteTransaction } from "@/app/app/transactions/actions";

type DeleteTransactionButtonProps = Readonly<{
  returnTo: string;
  transactionId: string;
}>;

export function DeleteTransactionButton({
  returnTo,
  transactionId,
}: DeleteTransactionButtonProps) {
  return (
    <form
      action={deleteTransaction}
      onSubmit={(event) => {
        if (!window.confirm("Seguro que quieres eliminar este movimiento?")) {
          event.preventDefault();
        }
      }}
    >
      <input name="transactionId" type="hidden" value={transactionId} />
      <input name="returnTo" type="hidden" value={returnTo} />
      <button
        aria-label="Eliminar movimiento"
        className="inline-flex size-9 items-center justify-center rounded-md border border-red-200 bg-white text-red-700 shadow-sm transition hover:bg-red-50"
        title="Eliminar movimiento"
        type="submit"
      >
        <Trash2 aria-hidden="true" size={15} />
      </button>
    </form>
  );
}
