"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BarChart3, Loader2, Trophy } from "lucide-react";
import { usePolls } from "@/lib/hooks/usePolls";
import { PollCard } from "@/components/poll-card";
import { Button } from "@/components/ui/button";
import { POLL_MAX_OFFSET, POLL_PAGE_SIZE } from "@/lib/constants";

export default function ResultsIndexPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error, refetch } = usePolls({ page });
  const polls = data?.results ?? [];
  const hasPreviousPage = page > 1;
  const hasNextPage = page * POLL_PAGE_SIZE < (data?.count ?? 0) && page * POLL_PAGE_SIZE < POLL_MAX_OFFSET;

  return (
    <div className="min-h-[70vh] bg-[#f8f9ff] px-4 py-12 text-[#0b1c30] sm:px-8 md:px-12">
      <div className="mx-auto max-w-7xl">
        <header className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#004ac6]"><BarChart3 className="h-4 w-4" /> Poll results</p>
            <h1 className="mt-3 font-geist text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">Follow every contest</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#626b7d]">View live standings while polls are open and final results after voting closes.</p>
          </div>
          <Button asChild variant="outline"><Link href="/polls">Explore polls <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
        </header>

        {isLoading ? (
          <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-[#004ac6]" /></div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-white px-6 py-14 text-center"><p className="font-semibold">Results could not be loaded.</p><p className="mt-2 text-sm text-[#626b7d]">Check your connection and try again.</p><Button onClick={() => void refetch()} className="mt-5">Try again</Button></div>
        ) : polls.length ? (
          <>
            <div className="mb-5 flex items-center justify-between text-sm text-[#626b7d]"><p>{(data?.count ?? 0).toLocaleString()} public polls</p><p>Page {page}</p></div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {polls.map((poll) => (
                <div key={poll.slug} className="flex flex-col gap-3">
                  <PollCard poll={poll} />
                  <Button asChild variant="outline" className="w-full"><Link href={`/results/${poll.slug}`}><Trophy className="mr-2 h-4 w-4" />View results</Link></Button>
                </div>
              ))}
            </div>
            <nav aria-label="Results pages" className="mt-10 flex items-center justify-between border-t border-[#dfe3ed] pt-5">
              <Button variant="outline" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={!hasPreviousPage || isLoading}><ArrowLeft className="mr-2 h-4 w-4" />Previous</Button>
              <span className="text-sm text-[#626b7d]">Page {page}</span>
              <Button variant="outline" onClick={() => setPage((value) => value + 1)} disabled={!hasNextPage || isLoading}>Next<ArrowRight className="ml-2 h-4 w-4" /></Button>
            </nav>
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-[#c3c6d7] bg-white px-6 py-16 text-center"><Trophy className="mx-auto h-9 w-9 text-[#8b91a1]" /><h2 className="mt-4 text-xl font-semibold">No public results yet</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#626b7d]">When polls are published, you can follow their standings here.</p><Button asChild className="mt-5"><Link href="/polls">Browse polls</Link></Button></div>
        )}
      </div>
    </div>
  );
}
