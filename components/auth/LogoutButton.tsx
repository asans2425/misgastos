import { LogOut } from "lucide-react";
import { logout } from "@/app/app/actions";

export function LogoutButton() {
  return (
    <form action={logout}>
      <button
        className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border-soft px-3 text-sm font-semibold text-slate-600 transition hover:bg-surface-muted"
        type="submit"
      >
        <LogOut aria-hidden="true" size={17} />
        Salir
      </button>
    </form>
  );
}
