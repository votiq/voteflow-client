"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { useAuthStore } from "@/lib/stores/auth";

export function Navbar() {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const [menuOpen, setMenuOpen] = useState(false);
  const isCreator = user?.role === "creator" || user?.role === "admin";
  const createHref = isCreator ? "/create" : "/become-creator";

  useEffect(() => setMenuOpen(false), [pathname]);

  const linkClass = (path: string) => {
    const active = pathname === path || (path !== "/" && pathname.startsWith(`${path}/`));
    return `rounded-md px-3 py-2 text-sm font-medium transition-colors ${active ? "text-[#004ac6]" : "text-[#434655] hover:text-[#004ac6]"}`;
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[#c3c6d7] bg-[#f8f9ff]/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-4 md:px-12">
        <Link href="/" className="flex items-center gap-2 font-geist text-2xl font-bold text-[#004ac6]" aria-label="VoteFlow home">
          <span className="material-symbols-outlined" aria-hidden="true" style={{ fontVariationSettings: '"FILL" 1' }}>how_to_vote</span>
          VoteFlow
        </Link>

        <nav className="hidden items-center gap-2 md:flex" aria-label="Main navigation">
          <Link href="/" className={linkClass("/")}>Home</Link>
          <Link href="/polls" className={linkClass("/polls")}>Explore polls</Link>
          <Link href="/results" className={linkClass("/results")}>Results</Link>
          <Link href={createHref} className={linkClass(createHref)}>{isCreator ? "Create poll" : "Become a creator"}</Link>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              {user.role === "admin" && <Link href="/admin" className="text-sm font-medium text-[#434655] hover:text-[#004ac6]">Admin console</Link>}
              <Link href="/dashboard" className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#004ac6] px-4 text-sm font-semibold text-white transition hover:bg-[#003ea8]">
                Dashboard <ArrowRight className="h-4 w-4" />
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-[#434655] hover:text-[#004ac6]">Log in</Link>
              <Link href="/register" className="inline-flex min-h-10 items-center rounded-lg bg-[#004ac6] px-4 text-sm font-semibold text-white transition hover:bg-[#003ea8]">Create account</Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#d9deea] bg-white text-[#17243b] md:hidden"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-public-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {menuOpen && (
        <nav id="mobile-public-navigation" className="border-t border-[#e5e8f1] bg-[#f8f9ff] px-4 py-3 shadow-lg md:hidden" aria-label="Mobile navigation">
          <div className="mx-auto flex max-w-[1280px] flex-col gap-1">
            <Link href="/" className={linkClass("/")}>Home</Link>
            <Link href="/polls" className={linkClass("/polls")}>Explore polls</Link>
            <Link href="/results" className={linkClass("/results")}>Results</Link>
            <Link href={createHref} className={linkClass(createHref)}>{isCreator ? "Create poll" : "Become a creator"}</Link>
            {user ? (
              <>
                {user.role === "admin" && <Link href="/admin" className={linkClass("/admin")}>Admin console</Link>}
                <Link href="/dashboard" className="mt-2 rounded-lg bg-[#004ac6] px-3 py-2.5 text-center text-sm font-semibold text-white">Dashboard</Link>
              </>
            ) : (
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Link href="/login" className="rounded-lg border border-[#c3c6d7] bg-white px-3 py-2.5 text-center text-sm font-semibold text-[#17243b]">Log in</Link>
                <Link href="/register" className="rounded-lg bg-[#004ac6] px-3 py-2.5 text-center text-sm font-semibold text-white">Create account</Link>
              </div>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
