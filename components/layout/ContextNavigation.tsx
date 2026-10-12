"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, ChevronRight, Home } from "lucide-react";

type Crumb = {
  href: string;
  label: string;
};

const routeLabels: Record<string, string> = {
  "/app": "Inicio",
  "/app/add": "Nuevo movimiento",
  "/app/analysis": "Análisis",
  "/app/settings": "Mi configuración",
  "/app/settings/buckets": "Patrimonio y huchas",
  "/app/settings/categories": "Categorías",
  "/app/settings/recurring": "Gastos e ingresos fijos",
  "/app/transactions": "Movimientos",
};

function getCrumbs(pathname: string) {
  const parts = pathname.split("/").filter(Boolean);

  return parts.slice(1).reduce<Crumb[]>((crumbs, part, index) => {
    const href = `/${parts.slice(0, index + 2).join("/")}`;
    const label = routeLabels[href];

    if (label) crumbs.push({ href, label });
    return crumbs;
  }, [{ href: "/app", label: "Inicio" }]);
}

export function ContextNavigation() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/app") return null;

  const crumbs = getCrumbs(pathname);
  const fallbackHref = crumbs.at(-2)?.href ?? "/app";

  return (
    <div className="mb-4 flex min-w-0 items-center gap-3 md:mb-6">
      <button
        aria-label="Volver a la página anterior"
        className="inline-flex h-10 shrink-0 items-center gap-2 rounded-md border border-border-soft bg-surface px-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-surface-muted"
        onClick={() => {
          if (window.history.length > 1) {
            router.back();
          } else {
            router.push(fallbackHref);
          }
        }}
        type="button"
      >
        <ArrowLeft aria-hidden="true" size={17} />
        <span className="hidden sm:inline">Atrás</span>
      </button>

      <nav aria-label="Migas de pan" className="min-w-0 overflow-hidden">
        <ol className="flex min-w-0 items-center gap-1.5 text-sm text-slate-500">
          {crumbs.map((crumb, index) => {
            const isLast = index === crumbs.length - 1;

            return (
              <li className="flex min-w-0 items-center gap-1.5" key={crumb.href}>
                {index > 0 ? (
                  <ChevronRight aria-hidden="true" className="shrink-0 text-slate-300" size={15} />
                ) : null}
                {isLast ? (
                  <span aria-current="page" className="truncate font-semibold text-slate-700">
                    {index === 0 ? <Home aria-hidden="true" size={16} /> : crumb.label}
                  </span>
                ) : (
                  <Link className="truncate transition hover:text-brand" href={crumb.href}>
                    {index === 0 ? <Home aria-hidden="true" size={16} /> : crumb.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}
