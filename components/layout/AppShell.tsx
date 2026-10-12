import { DesktopSidebar, MobileTabBar } from "@/components/layout/AppNavigation";
import { ContextNavigation } from "@/components/layout/ContextNavigation";
import { UserMenu } from "@/components/layout/UserMenu";
import { FirstUseGuide } from "@/components/onboarding/FirstUseGuide";
import { MoneyFlowLogo } from "@/components/ui/MoneyFlowLogo";
import { PageTransition } from "@/components/layout/PageTransition";

type AppShellProps = Readonly<{
  avatarUrl?: string | null;
  children: React.ReactNode;
  userEmail: string;
  userName?: string | null;
}>;

export function AppShell({
  avatarUrl,
  children,
  userEmail,
  userName,
}: AppShellProps) {
  return (
    <div className="min-h-dvh bg-background md:flex">
      <DesktopSidebar />
      <div className="min-w-0 flex-1 pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0">
        <main className="mx-auto w-full max-w-6xl px-4 pb-5 pt-[calc(0.75rem+env(safe-area-inset-top))] sm:px-6 md:px-8 md:py-8">
          <div className="mb-4 flex items-center justify-between md:mb-6">
            <MoneyFlowLogo
              className="md:hidden"
              iconClassName="size-9 rounded-lg"
              textClassName="text-[1.05rem]"
            />
            <div className="hidden md:block">
              <p className="text-sm font-medium text-slate-500">
                Sesion iniciada como {userEmail}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <FirstUseGuide />
              <UserMenu
                avatarUrl={avatarUrl}
                userEmail={userEmail}
                userName={userName}
              />
            </div>
          </div>
          <ContextNavigation />
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
      <MobileTabBar />
    </div>
  );
}
