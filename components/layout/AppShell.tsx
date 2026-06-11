import { DesktopSidebar, MobileTabBar } from "@/components/layout/AppNavigation";

export function AppShell({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-background md:flex">
      <DesktopSidebar />
      <div className="min-w-0 flex-1 pb-20 md:pb-0">
        <main className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 md:px-8 md:py-8">
          {children}
        </main>
      </div>
      <MobileTabBar />
    </div>
  );
}
