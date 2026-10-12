"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CirclePlus,
  Home,
  ListChecks,
  Settings,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { MoneyFlowLogo } from "@/components/ui/MoneyFlowLogo";

type NavItem = {
  href: string;
  icon: LucideIcon;
  label: string;
  exact?: boolean;
};

const navItems: NavItem[] = [
  { href: "/app", icon: Home, label: "Inicio", exact: true },
  { href: "/app/transactions", icon: ListChecks, label: "Movimientos" },
  { href: "/app/add", icon: CirclePlus, label: "Anadir" },
  { href: "/app/analysis", icon: BarChart3, label: "Analisis" },
  { href: "/app/settings", icon: Settings, label: "Gestion" },
];

function isActive(pathname: string, item: NavItem) {
  return item.exact
    ? pathname === item.href
    : pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function DesktopSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden min-h-screen w-64 border-r border-border-soft bg-surface px-4 py-5 md:flex md:flex-col">
      <MoneyFlowLogo className="mb-8 px-2" textClassName="text-base" />

      <nav aria-label="Navegacion principal" className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(pathname, item);

          return (
            <Link
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex h-11 items-center gap-3 rounded-md px-3 text-sm font-medium text-slate-600 transition",
                "hover:bg-surface-muted hover:text-foreground",
                active && "bg-brand text-white hover:bg-brand hover:text-white",
              )}
              href={item.href}
              key={item.href}
              prefetch
            >
              <Icon aria-hidden="true" size={19} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export function MobileTabBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegacion principal"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border-soft bg-surface/95 px-2 pb-[env(safe-area-inset-bottom)] shadow-[0_-10px_30px_rgba(15,23,42,0.08)] backdrop-blur md:hidden"
    >
      <div className="mx-auto grid h-16 max-w-md grid-cols-5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(pathname, item);

          return (
            <Link
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-w-0 flex-col items-center justify-center gap-1 text-[11px] font-medium text-slate-500 transition",
                active && "text-brand",
              )}
              href={item.href}
              key={item.href}
              prefetch
            >
              <Icon
                aria-hidden="true"
                className={cn("rounded-md p-1", active && "bg-brand text-white")}
                size={28}
              />
              <span className="max-w-full truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
