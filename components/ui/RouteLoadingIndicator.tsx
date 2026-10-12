"use client";

import { useEffect, useState } from "react";
import { LoaderCircle, WalletCards } from "lucide-react";

export function RouteLoadingIndicator() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setShow(true);
    }, 350);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  if (!show) {
    return null;
  }

  return (
    <div className="relative flex min-h-[55dvh] items-center justify-center px-6">
      <div className="fixed inset-x-0 top-0 z-50 h-1 overflow-hidden bg-brand/10">
        <div className="moneyflow-route-progress h-full w-1/3 rounded-full bg-brand" />
      </div>
      <div className="flex items-center gap-3 rounded-full border border-border-soft bg-surface px-4 py-3 text-brand shadow-sm">
        <span className="flex size-9 items-center justify-center rounded-full bg-brand/10">
          <WalletCards aria-hidden="true" size={20} />
        </span>
        <LoaderCircle aria-hidden="true" className="animate-spin" size={20} />
        <span className="sr-only">Cargando</span>
      </div>
    </div>
  );
}
