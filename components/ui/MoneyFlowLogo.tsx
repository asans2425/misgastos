import Link from "next/link";
import { WalletCards } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type MoneyFlowLogoProps = Readonly<{
  className?: string;
  iconClassName?: string;
  textClassName?: string;
}>;

export function MoneyFlowLogo({
  className,
  iconClassName,
  textClassName,
}: MoneyFlowLogoProps) {
  return (
    <Link className={cn("flex items-center gap-3", className)} href="/app">
      <span
        className={cn(
          "flex size-10 items-center justify-center rounded-md bg-brand text-white shadow-sm",
          iconClassName,
        )}
      >
        <WalletCards aria-hidden="true" size={22} />
      </span>
      <span
        className={cn(
          "text-base font-semibold tracking-tight text-slate-950",
          textClassName,
        )}
      >
        Money Flow ARSA
      </span>
    </Link>
  );
}
