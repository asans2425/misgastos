"use client";

import { useState } from "react";
import { LogOut, UserRound } from "lucide-react";
import { logout } from "@/app/app/actions";

type UserMenuProps = Readonly<{
  avatarUrl?: string | null;
  userEmail: string;
  userName?: string | null;
}>;

function getInitials(userEmail: string, userName?: string | null) {
  const source = userName?.trim() || userEmail;
  const parts = source.split(/[\s@._-]+/).filter(Boolean);

  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function UserMenu({ avatarUrl, userEmail, userName }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const initials = getInitials(userEmail, userName) || "MF";

  return (
    <div className="relative">
      <button
        aria-expanded={isOpen}
        aria-label="Abrir menu de usuario"
        className="flex size-10 items-center justify-center overflow-hidden rounded-full border border-border-soft bg-surface text-sm font-semibold text-brand shadow-sm transition hover:bg-surface-muted"
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt=""
            className="size-full object-cover"
            referrerPolicy="no-referrer"
            src={avatarUrl}
          />
        ) : (
          initials
        )}
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-12 z-40 w-64 rounded-lg border border-border-soft bg-white p-3 shadow-xl">
          <div className="flex items-center gap-3 border-b border-border-soft pb-3">
            <span className="flex size-10 items-center justify-center overflow-hidden rounded-full bg-brand text-sm font-semibold text-white">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  alt=""
                  className="size-full object-cover"
                  referrerPolicy="no-referrer"
                  src={avatarUrl}
                />
              ) : (
                <UserRound aria-hidden="true" size={18} />
              )}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-950">
                {userName || "Usuario"}
              </p>
              <p className="truncate text-xs text-slate-500">{userEmail}</p>
            </div>
          </div>

          <form action={logout} className="pt-3">
            <button
              className="flex h-10 w-full items-center justify-center gap-2 rounded-md border border-border-soft px-3 text-sm font-semibold text-slate-600 transition hover:bg-surface-muted"
              type="submit"
            >
              <LogOut aria-hidden="true" size={17} />
              Cerrar sesion
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
