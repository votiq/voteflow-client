"use client";

import { useAuthStore } from "@/lib/stores/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User } from "lucide-react";

export function UserNav() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const initials = user?.name 
    ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2)
    : "U";

  if (!mounted) {
    return (
      <div className="h-9 w-9 rounded-full bg-primary/15 flex items-center justify-center font-bold text-primary text-sm">
        U
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" aria-label="Open account menu" className="h-9 w-9 rounded-full bg-primary/15 flex items-center justify-center font-bold text-primary text-sm cursor-pointer hover:bg-primary/25 transition-colors select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
          {initials}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-white/70 backdrop-blur-md border-slate-200/50 shadow-xl">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.name || "Guest User"}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email || "Not logged in"}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/settings")} className="cursor-pointer">
          <User className="mr-2 h-4 w-4" />
          <span>Profile Settings</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
