type TransactionFiltersProps = Readonly<{
  categories: Array<{
    id: string;
    name: string;
  }>;
  selectedCategory: string;
  selectedMonth: string;
  selectedText: string;
  selectedType: string;
}>;

export function TransactionFilters({
  categories,
  selectedCategory,
  selectedMonth,
  selectedText,
  selectedType,
}: TransactionFiltersProps) {
  return (
    <form className="grid gap-3 rounded-lg border border-border-soft bg-surface p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-slate-700">Mes</span>
        <input
          className="h-11 w-full rounded-md border border-border-soft bg-white px-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
          defaultValue={selectedMonth}
          name="month"
          type="month"
        />
      </label>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-slate-700">Tipo</span>
        <select
          className="h-11 w-full rounded-md border border-border-soft bg-white px-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
          defaultValue={selectedType}
          name="type"
        >
          <option value="">Todos</option>
          <option value="expense">Gasto</option>
          <option value="income">Ingreso</option>
          <option value="transfer">Transferencia</option>
        </select>
      </label>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-slate-700">Categoria</span>
        <select
          className="h-11 w-full rounded-md border border-border-soft bg-white px-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
          defaultValue={selectedCategory}
          name="category"
        >
          <option value="">Todas</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-slate-700">Texto</span>
        <input
          className="h-11 w-full rounded-md border border-border-soft bg-white px-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
          defaultValue={selectedText}
          name="text"
          placeholder="Descripcion o categoria"
          type="text"
        />
      </label>

      <button
        className="h-11 rounded-md bg-brand px-4 text-sm font-semibold text-white transition hover:bg-brand-strong sm:col-span-2 lg:col-span-4"
        type="submit"
      >
        Aplicar filtros
      </button>
    </form>
  );
}
