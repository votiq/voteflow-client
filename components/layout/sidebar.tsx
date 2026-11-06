"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/auth";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  CreditCard,
  LayoutDashboard,
  PlusCircle,
  Settings,
  LogOut,
  ShieldCheck,
  Bell,
  List,
  Compass,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

const overviewNavItem: NavItem = { title: "Overview", href: "/dashboard", icon: LayoutDashboard };
const organizerNavItems: NavItem[] = [
  { title: "My Polls", href: "/my-polls", icon: List },
  { title: "Create Poll", href: "/create", icon: PlusCircle },
  { title: "Analytics", href: "/analytics", icon: BarChart3 },
  { title: "Wallet", href: "/wallet", icon: CreditCard },
];

const voterNavItems: NavItem[] = [
  { title: "Explore Polls", href: "/polls", icon: Compass },
];

const adminNavItem: NavItem = { title: "Admin Console", href: "/admin", icon: ShieldCheck };

const secondaryNavItems: NavItem[] = [
  { title: "Notifications", href: "/notifications", icon: Bell },
  { title: "Settings", href: "/settings", icon: Settings },
];

function NavLink({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all group",
        isActive
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
      )}
    >
      <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} />
      <span className="flex-1">{item.title}</span>
      {item.badge && (
        <span className={cn(
          "ml-auto text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center",
          isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-destructive text-destructive-foreground"
        )}>
          {item.badge}
        </span>
      )}
    </Link>
  );
}

export function Sidebar({ className }: { className?: string }) {
  const { user, logout } = useAuthStore();
  const currentUserQuery = useCurrentUser();
  const router = useRouter();
  const role = currentUserQuery.data?.role ?? user?.role;
  const mainNavItems = [
    overviewNavItem,
    ...(role === "creator" || role === "admin" ? organizerNavItems : voterNavItems),
  ];
  if (role === "admin") mainNavItems.push(adminNavItem);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const initials = user?.name
    ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2)
    : "U";

  return (
    <div className={cn("flex h-full w-64 flex-col border-r bg-background shrink-0", className)}>
      {/* Branding */}
      <div className="flex h-16 items-center px-6 border-b gap-2">
        <span
          className="material-symbols-outlined text-primary text-[22px]"
          style={{ fontVariationSettings: '"FILL" 1' }}
        >
          how_to_vote
        </span>
        <Link href="/" className="font-bold text-xl text-foreground font-geist tracking-tight">
          VoteFlow
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-auto py-5 px-3 space-y-6">
        <div>
          <p className="px-3 mb-2 text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest">
            Main
          </p>
          <nav className="space-y-1" aria-label="Main navigation">
            {mainNavItems.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </nav>
        </div>

        <div>
          <p className="px-3 mb-2 text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest">
            Manage
          </p>
          <nav className="space-y-1" aria-label="Secondary navigation">
            {secondaryNavItems.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </nav>
        </div>
      </div>

      {/* User & Logout */}
      <div className="p-3 border-t space-y-2">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/40">
          <div className="h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center font-bold text-primary text-xs shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{user?.name || "Guest User"}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email || "Not logged in"}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </Button>
      </div>
    </div>
  );
}
