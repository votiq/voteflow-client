"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { Button } from "@/components/ui/button";

export function MobileSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Close sidebar on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden shrink-0"
        onClick={() => setIsOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 border-0 bg-background/80 p-0 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}
          />
          {/* Sidebar container */}
          <div className="relative flex w-64 max-w-[80%] flex-col bg-background shadow-xl animate-in slide-in-from-left-1/2 duration-300">
            <div className="absolute right-[-48px] top-3">
              <Button
                variant="ghost"
                size="icon"
                className="text-foreground bg-background/50 hover:bg-background/80 rounded-full"
                onClick={() => setIsOpen(false)}
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <Sidebar className="w-full" />
          </div>
        </div>
      )}
    </>
  );
}
