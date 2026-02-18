import { useState } from "react";
import { Outlet } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { TrialCountdownBadge } from "./TrialCountdownBadge";
import { ThemeToggle } from "./ThemeToggle";
import { SystemStatusIndicator } from "./SystemStatusIndicator";
import { Menu } from "lucide-react";

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <AppSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main */}
      <main className="flex-1 min-w-0">
        {/* Header bar */}
        <div className="flex items-center justify-between gap-3 p-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg bg-secondary text-foreground hover:bg-secondary/80 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:block">
              <p className="text-xs text-muted-foreground leading-relaxed">
                CreatorCore analyzes your performance and tells you exactly what to do next.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <SystemStatusIndicator />
            <ThemeToggle />
            <TrialCountdownBadge />
          </div>
        </div>

        <div className="p-4 md:p-6 lg:p-8 max-w-[1400px]">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
