import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AppSidebar } from "@/components/AppSidebar";
import { FloatingNav } from "@/components/FloatingNav";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";

interface NavigationWrapperProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

export function NavigationWrapper({ children, showSidebar = true }: NavigationWrapperProps) {
  const style = {
    "--sidebar-width": "20rem",
    "--sidebar-width-icon": "4rem",
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
          <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b border-border bg-background/95 backdrop-blur-lg px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger data-testid="button-sidebar-toggle" className="md:flex hidden">
                <Menu className="h-5 w-5" />
              </SidebarTrigger>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => {
                  const sidebar = document.querySelector('[data-sidebar="sidebar"]');
                  if (sidebar) {
                    sidebar.setAttribute('data-state', sidebar.getAttribute('data-state') === 'collapsed' ? 'expanded' : 'collapsed');
                  }
                }}
                data-testid="button-mobile-menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
            <ThemeToggle />
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
