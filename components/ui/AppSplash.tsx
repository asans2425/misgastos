import { Banknote, WalletCards } from "lucide-react";

export function AppSplash() {
  return (
    <div className="flex min-h-dvh items-center justify-center overflow-hidden bg-brand px-6 text-white">
      <div className="relative flex size-40 items-center justify-center">
        <span className="moneyflow-splash-ring absolute size-36 rounded-full border border-white/20" />
        <span className="moneyflow-splash-ring moneyflow-splash-ring-delay absolute size-36 rounded-full border border-white/15" />

        <div className="moneyflow-bill moneyflow-bill-one absolute left-4 top-2 rounded-md bg-white/95 p-1.5 text-brand shadow-lg shadow-slate-950/20">
          <Banknote aria-hidden="true" size={25} />
        </div>
        <div className="moneyflow-bill moneyflow-bill-two absolute right-2 top-11 rounded-md bg-emerald-50 p-1.5 text-brand shadow-lg shadow-slate-950/20">
          <Banknote aria-hidden="true" size={23} />
        </div>
        <div className="moneyflow-bill moneyflow-bill-three absolute bottom-7 left-2 rounded-md bg-teal-50 p-1.5 text-brand shadow-lg shadow-slate-950/20">
          <Banknote aria-hidden="true" size={21} />
        </div>

        <div className="moneyflow-wallet-loader relative z-10 flex size-28 items-center justify-center rounded-[30px] border border-white/30 bg-white/15 shadow-2xl shadow-slate-950/25 backdrop-blur">
          <WalletCards aria-hidden="true" className="drop-shadow" size={56} />
        </div>
      </div>
    </div>
  );
}
