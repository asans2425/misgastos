"use client";

import { usePathname } from "next/navigation";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="motion-safe:animate-[moneyflow-page-enter_180ms_ease-out]" key={pathname}>
      {children}
    </div>
  );
}
