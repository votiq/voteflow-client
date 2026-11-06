"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export function DashboardSearch() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("search", query.trim());
    const queryString = params.toString();
    router.push(`/polls${queryString ? `?${queryString}` : ""}`);
  };

  return (
    <form onSubmit={submit} role="search" className="relative hidden items-center md:flex">
      <Search className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground" />
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search public polls..."
        aria-label="Search public polls"
        className="w-64 rounded-lg border border-border bg-muted/40 py-1.5 pl-9 pr-4 text-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
    </form>
  );
}
