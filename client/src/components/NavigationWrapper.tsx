import { ThemeToggle } from "@/components/ThemeToggle";
import { AppSidebar } from "@/components/AppSidebar";
import { FloatingNav } from "@/components/FloatingNav";
import { SubscriptionBadge } from "@/components/SubscriptionBadge";
import { AuthButtons } from "@/components/AuthButtons";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";

interface NavigationWrapperProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

export function NavigationWrapper({ children, showSidebar = true }: NavigationWrapperProps) {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  if (!showSidebar) {
    return (
      <>
        {children}
        <FloatingNav />
      </>
    );
  }

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex-1 flex flex-col">
          <header className="sticky top-0 z-40 flex h-14 items-center justify-between gap-4 border-b border-border bg-background/95 backdrop-blur-lg px-4">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <div className="flex items-center gap-2">
              <SubscriptionBadge />
              <AuthButtons />
              <ThemeToggle />
            </div>
          </header>
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </SidebarInset>
      </div>
      <FloatingNav />
    </SidebarProvider>
  );
}
