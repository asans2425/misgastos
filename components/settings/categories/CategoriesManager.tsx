"use client";

import { useActionState, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Layers3,
  Loader2,
  Plus,
  Save,
  Search,
  Trash2,
} from "lucide-react";
import {
  deleteCategory,
  deleteSubcategory,
  saveCategory,
  saveSubcategory,
  type CategoryFormState,
} from "@/app/app/settings/categories/actions";
import { cn } from "@/lib/utils/cn";
import type { CategoryType, DestinationType } from "@/types/database";

type CategoryItem = {
  color: string | null;
  icon: string | null;
  id: string;
  isActive: boolean;
  name: string;
  type: CategoryType;
};

type SubcategoryItem = {
  categoryId: string;
  defaultDestination: DestinationType;
  id: string;
  isActive: boolean;
  isInvestment: boolean;
  name: string;
};

type CategoriesManagerProps = Readonly<{
  categories: CategoryItem[];
  status?: string;
  subcategories: SubcategoryItem[];
}>;

const initialState: CategoryFormState = {};

function getStatusMessage(status?: string) {
  if (!status) return null;
  if (status === "category-created") return "Categoria creada correctamente.";
  if (status === "category-updated") return "Categoria actualizada correctamente.";
  if (status === "category-deleted") return "Categoria eliminada correctamente.";
  if (status === "subcategory-created") return "Subcategoria creada correctamente.";
  if (status === "subcategory-updated") return "Subcategoria actualizada correctamente.";
  if (status === "subcategory-deleted") return "Subcategoria eliminada correctamente.";
  if (status === "delete-error") {
    return "No se puede eliminar porque esta en uso. Puedes pausarla.";
  }

  return null;
}

function typeLabel(type: CategoryType) {
  if (type === "income") return "Ingreso";
  if (type === "expense") return "Gasto";
  return "Especial";
}

function typeTone(type: CategoryType) {
  if (type === "income") return "bg-emerald-50 text-emerald-700";
  if (type === "expense") return "bg-rose-50 text-rose-700";
  return "bg-slate-100 text-slate-700";
}

function FieldLabel({
  children,
  label,
}: Readonly<{
  children: React.ReactNode;
  label: string;
}>) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}

function Badge({
  children,
  className,
}: Readonly<{
  children: React.ReactNode;
  className?: string;
}>) {
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-1 text-xs font-semibold",
        className,
      )}
    >
      {children}
    </span>
  );
}

function CategoryForm({
  category,
}: Readonly<{
  category?: CategoryItem;
}>) {
  const [state, formAction, pending] = useActionState(saveCategory, initialState);

  return (
    <form action={formAction} className="space-y-4">
      {category ? (
        <input name="categoryId" type="hidden" value={category.id} />
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <FieldLabel label="Nombre">
          <input
            className="h-11 w-full rounded-md border border-border-soft bg-white px-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
            defaultValue={category?.name ?? ""}
            name="name"
            placeholder="Alquiler, nomina, transporte..."
            required
            type="text"
          />
        </FieldLabel>

        <FieldLabel label="Tipo">
          <select
            className="h-11 w-full rounded-md border border-border-soft bg-white px-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
            defaultValue={category?.type ?? "expense"}
            name="type"
          >
            <option value="expense">Gasto</option>
            <option value="income">Ingreso</option>
          </select>
        </FieldLabel>

        <FieldLabel label="Icono">
          <input
            className="h-11 w-full rounded-md border border-border-soft bg-white px-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
            defaultValue={category?.icon ?? ""}
            name="icon"
            placeholder="home, wallet, car..."
            type="text"
          />
        </FieldLabel>

        <FieldLabel label="Color">
          <input
            className="h-11 w-full rounded-md border border-border-soft bg-white px-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
            defaultValue={category?.color ?? "#14b8a6"}
            name="color"
            type="color"
          />
        </FieldLabel>
      </div>

      <input name="isActive" type="hidden" value="off" />
      <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
        <input
          className="size-4 rounded border-border-soft text-brand focus:ring-brand"
          defaultChecked={category?.isActive ?? true}
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
        {category ? "Guardar categoria" : "Crear categoria"}
      </button>
    </form>
  );
}

function SubcategoryForm({
  categories,
  fixedCategory,
  subcategory,
}: Readonly<{
  categories: CategoryItem[];
  fixedCategory?: CategoryItem;
  subcategory?: SubcategoryItem;
}>) {
  const [state, formAction, pending] = useActionState(
    saveSubcategory,
    initialState,
  );
  const [categoryId, setCategoryId] = useState(
    fixedCategory?.id ?? subcategory?.categoryId ?? categories[0]?.id ?? "",
  );
  const selectedCategory =
    fixedCategory ?? categories.find((category) => category.id === categoryId);
  const isExpense = selectedCategory?.type === "expense";

  return (
    <form action={formAction} className="space-y-4">
      {subcategory ? (
        <input name="subcategoryId" type="hidden" value={subcategory.id} />
      ) : null}
      {fixedCategory ? (
        <input name="categoryId" type="hidden" value={fixedCategory.id} />
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        {fixedCategory ? (
          <div className="rounded-md border border-border-soft bg-surface-muted px-3 py-2">
            <p className="text-xs font-semibold uppercase text-slate-500">
              Categoria
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-800">
              {fixedCategory.name}
            </p>
          </div>
        ) : (
          <FieldLabel label="Categoria">
            <select
              className="h-11 w-full rounded-md border border-border-soft bg-white px-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
              name="categoryId"
              onChange={(event) => setCategoryId(event.target.value)}
              required
              value={categoryId}
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name} · {typeLabel(category.type)}
                </option>
              ))}
            </select>
          </FieldLabel>
        )}

        <FieldLabel label="Nombre">
          <input
            className="h-11 w-full rounded-md border border-border-soft bg-white px-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
            defaultValue={subcategory?.name ?? ""}
            name="name"
            placeholder="Nomina principal, gimnasio, parking..."
            required
            type="text"
          />
        </FieldLabel>

        <input name="defaultDestination" type="hidden" value="normal" />
      </div>

      <div className="flex flex-col gap-3 rounded-md border border-border-soft bg-surface-muted p-3 sm:flex-row sm:items-center sm:justify-between">
        <input name="isActive" type="hidden" value="off" />
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <input
            className="size-4 rounded border-border-soft text-brand focus:ring-brand"
            defaultChecked={subcategory?.isActive ?? true}
            name="isActive"
            type="checkbox"
            value="on"
          />
          Activa
        </label>
        {isExpense ? (
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input
              className="size-4 rounded border-border-soft text-brand focus:ring-brand"
              defaultChecked={subcategory?.isInvestment ?? false}
              name="isInvestment"
              type="checkbox"
              value="on"
            />
            Inversion
          </label>
        ) : null}
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
        {subcategory ? "Guardar subcategoria" : "Crear subcategoria"}
      </button>
    </form>
  );
}

function SubcategoryRow({
  category,
  subcategory,
}: Readonly<{
  category: CategoryItem;
  subcategory: SubcategoryItem;
}>) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="border-t border-border-soft py-3 first:border-t-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium text-slate-900">{subcategory.name}</p>
            {subcategory.isInvestment ? (
              <Badge className="bg-amber-100 text-amber-900">Inversion</Badge>
            ) : null}
            {!subcategory.isActive ? (
              <Badge className="bg-slate-100 text-slate-600">Pausada</Badge>
            ) : null}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            className="h-9 flex-1 rounded-md border border-border-soft px-3 text-sm font-semibold text-slate-600 transition hover:bg-surface-muted sm:flex-none"
            onClick={() => setIsEditing((current) => !current)}
            type="button"
          >
            {isEditing ? "Cerrar" : "Editar"}
          </button>
          <form
            action={deleteSubcategory}
            onSubmit={(event) => {
              if (!window.confirm("Seguro que quieres eliminar esta subcategoria?")) {
                event.preventDefault();
              }
            }}
          >
            <input name="subcategoryId" type="hidden" value={subcategory.id} />
            <button
              aria-label={`Eliminar ${subcategory.name}`}
              className="inline-flex size-9 items-center justify-center rounded-md border border-red-200 text-red-700 transition hover:bg-red-50"
              type="submit"
            >
              <Trash2 aria-hidden="true" size={16} />
            </button>
          </form>
        </div>
      </div>

      {isEditing ? (
        <div className="mt-3 rounded-md border border-border-soft bg-white p-3">
          <SubcategoryForm
            categories={[category]}
            fixedCategory={category}
            subcategory={subcategory}
          />
        </div>
      ) : null}
    </div>
  );
}

function CategoryGroup({
  category,
  subcategories,
}: Readonly<{
  category: CategoryItem;
  subcategories: SubcategoryItem[];
}>) {
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingSubcategory, setIsAddingSubcategory] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  return (
    <article className="rounded-lg border border-border-soft bg-surface shadow-sm">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <button
            className="flex min-w-0 flex-1 items-start gap-3 text-left"
            onClick={() => setIsOpen((current) => !current)}
            type="button"
          >
            <span
              aria-hidden="true"
              className="mt-1 size-9 shrink-0 rounded-md border border-border-soft"
              style={{ backgroundColor: category.color ?? "#e2e8f0" }}
            />
            <span className="min-w-0">
              <span className="flex flex-wrap items-center gap-2">
                <span className="truncate text-base font-semibold text-slate-950">
                  {category.name}
                </span>
                <Badge className={typeTone(category.type)}>
                  {typeLabel(category.type)}
                </Badge>
                {!category.isActive ? (
                  <Badge className="bg-slate-100 text-slate-600">Pausada</Badge>
                ) : null}
              </span>
              <span className="mt-1 block text-sm text-slate-500">
                {subcategories.length} subcategoria
                {subcategories.length === 1 ? "" : "s"}
              </span>
            </span>
          </button>

          <button
            aria-label={isOpen ? "Plegar categoria" : "Desplegar categoria"}
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-md border border-border-soft text-slate-500 transition hover:bg-surface-muted"
            onClick={() => setIsOpen((current) => !current)}
            type="button"
          >
            {isOpen ? (
              <ChevronUp aria-hidden="true" size={18} />
            ) : (
              <ChevronDown aria-hidden="true" size={18} />
            )}
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          <button
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border-soft px-3 text-sm font-semibold text-slate-600 transition hover:bg-surface-muted"
            onClick={() => setIsAddingSubcategory((current) => !current)}
            type="button"
          >
            <Plus aria-hidden="true" size={16} />
            Subcategoria
          </button>
          <button
            className="h-10 rounded-md border border-border-soft px-3 text-sm font-semibold text-slate-600 transition hover:bg-surface-muted"
            onClick={() => setIsEditing((current) => !current)}
            type="button"
          >
            {isEditing ? "Cerrar" : "Editar"}
          </button>
          <form
            action={deleteCategory}
            className="col-span-2 sm:col-span-1"
            onSubmit={(event) => {
              if (!window.confirm("Seguro que quieres eliminar esta categoria?")) {
                event.preventDefault();
              }
            }}
          >
            <input name="categoryId" type="hidden" value={category.id} />
            <button
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-red-200 px-3 text-sm font-semibold text-red-700 transition hover:bg-red-50"
              type="submit"
            >
              <Trash2 aria-hidden="true" size={16} />
              Eliminar
            </button>
          </form>
        </div>

        {isEditing ? (
          <div className="mt-4 rounded-md border border-border-soft bg-surface-muted p-3">
            <CategoryForm category={category} />
          </div>
        ) : null}

        {isAddingSubcategory ? (
          <div className="mt-4 rounded-md border border-border-soft bg-surface-muted p-3">
            <SubcategoryForm
              categories={[category]}
              fixedCategory={category}
            />
          </div>
        ) : null}
      </div>

      {isOpen ? (
        <div className="border-t border-border-soft px-4 py-1">
          {subcategories.length === 0 ? (
            <div className="py-5 text-sm text-slate-500">
              Todavia no hay subcategorias. Anade una desde esta categoria.
            </div>
          ) : (
            subcategories.map((subcategory) => (
              <SubcategoryRow
                category={category}
                key={subcategory.id}
                subcategory={subcategory}
              />
            ))
          )}
        </div>
      ) : null}
    </article>
  );
}

export function CategoriesManager({
  categories,
  status,
  subcategories,
}: CategoriesManagerProps) {
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "expense" | "income">(
    "all",
  );
  const statusMessage = getStatusMessage(status);

  const activeCategories = useMemo(
    () => categories.filter((category) => category.type !== "special"),
    [categories],
  );

  const visibleGroups = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return activeCategories
      .map((category) => {
        const categorySubcategories = subcategories.filter(
          (subcategory) => subcategory.categoryId === category.id,
        );

        return {
          category,
          subcategories: categorySubcategories,
        };
      })
      .filter(({ category, subcategories: categorySubcategories }) => {
        const matchesType =
          typeFilter === "all" ? true : category.type === typeFilter;

        if (!matchesType) return false;
        if (!normalizedQuery) return true;

        return (
          category.name.toLowerCase().includes(normalizedQuery) ||
          categorySubcategories.some((subcategory) =>
            subcategory.name.toLowerCase().includes(normalizedQuery),
          )
        );
      });
  }, [activeCategories, query, subcategories, typeFilter]);

  return (
    <div className="space-y-5">
      {statusMessage ? (
        <section className="rounded-lg border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-medium text-teal-800 shadow-sm">
          {statusMessage}
        </section>
      ) : null}

      <section className="rounded-lg border border-border-soft bg-surface p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-brand text-white">
              <Layers3 aria-hidden="true" size={20} />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-slate-950">
                Categorias y subcategorias
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Gestiona cada bloque junto a sus detalles, sin ir saltando entre
                listas.
              </p>
            </div>
          </div>

          <button
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-brand px-4 text-sm font-semibold text-white transition hover:bg-brand-strong sm:w-auto"
            onClick={() => setIsCreatingCategory((current) => !current)}
            type="button"
          >
            <Plus aria-hidden="true" size={18} />
            Nueva categoria
          </button>
        </div>

        {isCreatingCategory ? (
          <div className="mt-4 border-t border-border-soft pt-4">
            <CategoryForm />
          </div>
        ) : null}
      </section>

      <section className="rounded-lg border border-border-soft bg-surface p-3 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <label className="relative flex-1">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              className="h-11 w-full rounded-md border border-border-soft bg-white pl-10 pr-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar categoria o subcategoria"
              type="search"
              value={query}
            />
          </label>

          <div className="grid grid-cols-3 rounded-md bg-surface-muted p-1 text-sm font-semibold text-slate-600 lg:w-80">
            {[
              ["all", "Todas"],
              ["expense", "Gastos"],
              ["income", "Ingresos"],
            ].map(([value, label]) => (
              <button
                className={cn(
                  "h-9 rounded-md transition",
                  typeFilter === value
                    ? "bg-white text-slate-950 shadow-sm"
                    : "hover:bg-white/70",
                )}
                key={value}
                onClick={() =>
                  setTypeFilter(value as "all" | "expense" | "income")
                }
                type="button"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {visibleGroups.length === 0 ? (
        <section className="rounded-lg border border-dashed border-border-soft bg-surface p-6 text-center shadow-sm">
          <p className="text-sm font-semibold text-slate-700">
            No hay categorias que coincidan.
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Cambia el filtro o crea una categoria nueva.
          </p>
        </section>
      ) : (
        <section className="grid gap-4 xl:grid-cols-2">
          {visibleGroups.map(({ category, subcategories: categorySubcategories }) => (
            <CategoryGroup
              category={category}
              key={category.id}
              subcategories={categorySubcategories}
            />
          ))}
        </section>
      )}
    </div>
  );
}
