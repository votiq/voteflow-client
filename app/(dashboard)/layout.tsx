import { Sidebar } from "@/components/layout/sidebar";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { UserNav } from "@/components/layout/user-nav";
import { Bell } from "lucide-react";
import Link from "next/link";
import { DashboardSearch } from "@/components/layout/dashboard-search";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-background">
      <Sidebar className="hidden md:flex" />

      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b flex items-center justify-between px-4 md:px-6 bg-background shrink-0 z-10">
          <div className="flex items-center gap-2 md:gap-4">
            <MobileSidebar />
            <DashboardSearch />
          </div>

          {/* Right: Actions */}
          <div className="ml-auto flex items-center gap-3">
            <Link
              href="/polls"
              className="hidden md:inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors border border-border rounded-lg px-3 py-1.5 hover:bg-muted/50"
            >
              <span className="material-symbols-outlined text-[16px]">open_in_new</span>
              View Public Site
            </Link>

            <Link
              href="/notifications"
              aria-label="Notifications"
              className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border transition-colors hover:bg-muted/60"
            >
              <Bell className="h-4 w-4 text-muted-foreground" />
            </Link>


            {/* Avatar / Profile Dropdown */}
            <UserNav />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
