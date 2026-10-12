"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Loader2 } from "lucide-react";

type InvestmentToggleProps = Readonly<{
  checked: boolean;
}>;

export function InvestmentToggle({ checked }: InvestmentToggleProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  return (
    <label className="inline-flex min-h-9 items-center gap-2 rounded-full border border-border-soft bg-white px-2.5 py-1.5 text-sm font-medium text-slate-700 shadow-sm">
      <input
        checked={checked}
        className="peer sr-only"
        disabled={isPending}
        onChange={(event) => {
          const params = new URLSearchParams(searchParams.toString());

          if (event.target.checked) {
            params.set("investment", "1");
          } else {
            params.delete("investment");
          }

          startTransition(() => {
            router.push(`${pathname}?${params.toString()}`);
          });
        }}
        type="checkbox"
      />
      <span
        aria-hidden="true"
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
          checked ? "bg-brand" : "bg-slate-300"
        } peer-focus-visible:ring-2 peer-focus-visible:ring-brand/30 peer-disabled:opacity-60`}
      >
        <span
          className={`absolute left-0.5 top-0.5 size-4 rounded-full bg-white shadow-sm transition-transform ${
            checked ? "translate-x-4" : ""
          }`}
        />
      </span>
      <span className="whitespace-nowrap">Contar inversión</span>
      {isPending ? <Loader2 aria-hidden="true" className="animate-spin" size={15} /> : null}
    </label>
  );
}
