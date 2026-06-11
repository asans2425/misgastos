export function TransactionDraftForm() {
  return (
    <form className="space-y-4 rounded-lg border border-border-soft bg-surface p-4 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-slate-700">Tipo</span>
          <select className="h-11 w-full rounded-md border border-border-soft bg-white px-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20">
            <option>Gasto</option>
            <option>Ingreso</option>
          </select>
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-slate-700">Importe</span>
          <input
            className="h-11 w-full rounded-md border border-border-soft bg-white px-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
            inputMode="decimal"
            placeholder="0,00"
            type="text"
          />
        </label>
      </div>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-slate-700">Concepto</span>
        <input
          className="h-11 w-full rounded-md border border-border-soft bg-white px-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
          placeholder="Supermercado, nomina, transporte..."
          type="text"
        />
      </label>

      <button
        className="h-11 w-full rounded-md bg-slate-300 px-4 text-sm font-semibold text-slate-600"
        disabled
        type="button"
      >
        Guardar en siguiente fase
      </button>
    </form>
  );
}
