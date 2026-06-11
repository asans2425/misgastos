import { DesktopSidebar, MobileTabBar } from "@/components/layout/AppNavigation";
import { LogoutButton } from "@/components/auth/LogoutButton";

type AppShellProps = Readonly<{
  children: React.ReactNode;
  userEmail: string;
}>;

export function AppShell({ children, userEmail }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background md:flex">
      <DesktopSidebar />
      <div className="min-w-0 flex-1 pb-20 md:pb-0">
        <main className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 md:px-8 md:py-8">
          <div className="mb-6 flex flex-col gap-3 rounded-lg border border-border-soft bg-surface p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">
                Sesion activa
              </p>
              <p className="mt-1 break-all text-sm font-medium text-foreground">
                {userEmail}
              </p>
            </div>
            <LogoutButton />
          </div>
          {children}
        </main>
      </div>
      <MobileTabBar />
    </div>
  );
}
