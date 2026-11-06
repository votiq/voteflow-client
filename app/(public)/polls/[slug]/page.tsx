"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useState, useEffect } from "react";
import { usePoll } from "@/lib/hooks/usePoll";
import { ContestantCard } from "@/components/contestant-card";
import { useAuthStore } from "@/lib/stores/auth";
import { AddContestantModal } from "@/components/add-contestant-modal";
import { CustomSelect } from "@/components/ui/custom-select";
import { toast } from "sonner";

function useCountdown(endsAt: string | undefined) {
  const [parts, setParts] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  useEffect(() => {
    if (!endsAt) return;
    const update = () => {
      const diff = new Date(endsAt).getTime() - Date.now();
      if (diff <= 0) {
        setParts({ days: 0, hours: 0, mins: 0, secs: 0 });
        return;
      }
      setParts({
        days:  Math.floor(diff / 86_400_000),
        hours: Math.floor((diff % 86_400_000) / 3_600_000),
        mins:  Math.floor((diff % 3_600_000) / 60_000),
        secs:  Math.floor((diff % 60_000) / 1000),
      });
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  return parts;
}

export default function PollDetailPage() {
  const { slug } = useParams() as { slug: string };
  const { data: poll, isLoading, error } = usePoll(slug);
  const { user } = useAuthStore();
  const [sortMode, setSortMode] = useState<"votes" | "alphabetical">("votes");

  const countdown = useCountdown(poll?.endsAt);
  const totalVotes = poll?.contestants.reduce((sum, c) => sum + c.votes, 0) || 0;
  const leadingShare = poll && totalVotes ? Math.max(...poll.contestants.map((contestant) => contestant.votes)) / totalVotes * 100 : 0;
  const contestants = poll ? [...poll.contestants].sort((a, b) => sortMode === "votes" ? b.votes - a.votes : a.name.localeCompare(b.name)) : [];

  const sharePoll = async () => {
    if (!poll) return;
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: poll.title, url });
      else {
        await navigator.clipboard.writeText(url);
        toast.success("Poll link copied.");
      }
    } catch {
      // The voter closed the native share sheet.
    }
  };

  if (isLoading) {
    return (
      <div className="bg-[#f8f9ff] min-h-screen flex items-center justify-center">
        <span className="material-symbols-outlined text-[48px] text-[#004ac6] animate-spin">refresh</span>
      </div>
    );
  }

  if (error || !poll) {
    notFound();
  }

  const statusLabel: Record<typeof poll.status, string> = {
    active: "Active Contest",
    ending_soon: "Ending Soon",
    new: "New",
    closed: "Closed",
    draft: "Draft",
  };

  return (
    <div className="bg-[#f8f9ff] min-h-screen">
      <div className="max-w-[1280px] mx-auto px-4 md:px-12 py-10">

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[13px] text-[#737686] mb-6">
          <Link href="/polls" className="hover:text-[#004ac6] transition-colors">
            Discover Contests
          </Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-[#0b1c30] font-medium truncate max-w-[200px]">{poll.title}</span>
        </nav>

        {/* Hero Banner */}
        <section className="mb-10 relative rounded-xl overflow-hidden bg-[#eff4ff] border border-[#c3c6d7] soft-glow-shadow">
          <div className="absolute inset-0">
            <img
              src={poll.image || "/window.svg"}
              alt={poll.title}
              className="w-full h-full object-cover opacity-15"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#eff4ff] via-[#eff4ff]/90 to-transparent" />
          </div>
          <div className="relative z-10 p-6 md:p-10 lg:p-16 max-w-3xl">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#d3e4fe] text-[#004ac6] font-geist text-[12px] font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#004ac6] animate-pulse" />
                {statusLabel[poll.status]}
              </span>
              <span className="font-geist text-[12px] font-semibold text-[#434655] uppercase tracking-wider">
                By {poll.organizer}
              </span>
              {poll.isPaid && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#712ae2] text-white font-geist text-[12px] font-semibold">
                  <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: '"FILL" 1' }}>paid</span>
                  ₦{Number(poll.pricePerVote || 0).toLocaleString("en-NG")}/vote
                </span>
              )}
            </div>

            <h1 className="font-geist text-[32px] md:text-[44px] font-bold leading-[1.15] tracking-[-0.02em] text-[#0b1c30] mb-4">
              {poll.title}
            </h1>
            <p className="font-inter text-[17px] leading-[1.6] text-[#434655] mb-6 max-w-2xl">
              {poll.description}
            </p>

            <div className="flex flex-wrap gap-3">
              <button onClick={sharePoll} className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-[#c3c6d7] rounded-lg font-geist text-[13px] font-medium text-[#0b1c30] hover:bg-[#eff4ff] transition-colors">
                <span className="material-symbols-outlined text-[18px]">share</span>
                Share Contest
              </button>
              <Link href={`/results/${poll.slug}`} className="inline-flex items-center gap-2 rounded-lg border border-[#c3c6d7] bg-white px-5 py-2.5 font-geist text-[13px] font-medium text-[#0b1c30] transition-colors hover:bg-[#eff4ff]">
                View Results
              </Link>
              <div className="inline-flex items-center gap-2 text-[#434655] font-inter text-[13px] bg-white px-4 py-2.5 rounded-lg border border-[#c3c6d7]">
                <span className="material-symbols-outlined text-[#004ac6] text-[18px]" style={{ fontVariationSettings: '"FILL" 1' }}>verified_user</span>
                Secure · 1 vote per person
              </div>
            </div>
          </div>
        </section>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Sticky Sidebar */}
          <aside className="lg:col-span-4 space-y-5">
            <div className="sticky top-20 space-y-5">

              {/* Live Countdown */}
              <div className="bg-white rounded-xl border border-[#c3c6d7] soft-glow-shadow overflow-hidden">
                <div className="px-5 py-4 border-b border-[#c3c6d7] bg-[#eff4ff]/60 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#004ac6]">timer</span>
                  <h2 className="font-geist text-[16px] font-semibold text-[#0b1c30]">Voting Ends In</h2>
                </div>
                <div className="p-5">
                  <div className="grid grid-cols-4 gap-2 text-center">
                    {[
                      { value: String(countdown.days).padStart(2, "0"), label: "Days" },
                      { value: String(countdown.hours).padStart(2, "0"), label: "Hours" },
                      { value: String(countdown.mins).padStart(2, "0"), label: "Mins" },
                      { value: String(countdown.secs).padStart(2, "0"), label: "Secs" },
                    ].map((item) => (
                      <div key={item.label} className="bg-[#e5eeff] p-2 rounded-lg border border-[#cbdbf5]">
                        <div className="font-geist text-[28px] font-bold tracking-[-0.02em] text-[#004ac6] leading-none">
                          {item.value}
                        </div>
                        <div className="font-geist text-[10px] font-semibold text-[#737686] mt-1 uppercase">
                          {item.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Live Stats */}
              <div className="bg-white rounded-xl border border-[#c3c6d7] soft-glow-shadow overflow-hidden">
                <div className="px-5 py-4 border-b border-[#c3c6d7] bg-[#eff4ff]/60 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#712ae2]">monitoring</span>
                  <h2 className="font-geist text-[16px] font-semibold text-[#0b1c30]">Live Statistics</h2>
                </div>
                <div className="p-5 space-y-4">
                  <div>
                    <div className="flex justify-between items-end mb-1">
                      <span className="font-geist text-[13px] font-medium text-[#434655]">Total Votes Cast</span>
                      <span className="font-geist text-[22px] font-semibold text-[#0b1c30]">
                        {totalVotes.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-[#dbe1ff] rounded-full overflow-hidden">
                      <div className="h-full bg-[#712ae2] rounded-full transition-all duration-500" style={{ width: `${leadingShare}%` }} />
                    </div>
                  </div>
                  <div className="pt-4 border-t border-[#c3c6d7] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#737686] text-[20px]">group</span>
                      <span className="font-inter text-[14px] text-[#434655]">Contestants</span>
                    </div>
                    <span className="font-geist text-[22px] font-semibold text-[#0b1c30]">
                      {poll.contestants.length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Category & Tags */}
              <div className="bg-white rounded-xl border border-[#c3c6d7] soft-glow-shadow p-5">
                <h2 className="font-geist text-[14px] font-semibold text-[#737686] uppercase tracking-wider mb-3">Category</h2>
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#eff4ff] text-[#004ac6] font-geist text-[13px] font-semibold border border-[#c3c6d7]">
                  {poll.category}
                </span>
                {poll.tags && poll.tags.length > 0 && (
                  <div className="mt-4">
                    <h2 className="font-geist text-[14px] font-semibold text-[#737686] uppercase tracking-wider mb-2">Tags</h2>
                    <div className="flex flex-wrap gap-2">
                      {poll.tags.map((tag) => (
                        <span key={tag} className="px-2.5 py-1 bg-[#f8f9ff] border border-[#c3c6d7] rounded-md font-inter text-[12px] text-[#434655]">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* Contestants Grid */}
          <div className="lg:col-span-8">
            <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6">
              <div className="flex items-center gap-4">
                <h2 className="font-geist text-[26px] font-semibold text-[#0b1c30]">
                  Nominees
                  <span className="ml-2 text-[16px] font-normal text-[#737686]">({poll.contestants.length})</span>
                </h2>
                {user && (user.name === poll.organizer || user.role === "admin") && (
                  <AddContestantModal pollSlug={poll.slug} />
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-inter text-[13px] text-[#737686]">Sort by:</span>
                <CustomSelect
                  aria-label="Sort contestants"
                  value={sortMode}
                  onValueChange={(value) => setSortMode(value as "votes" | "alphabetical")}
                  options={[{ value: "votes", label: "Most Votes" }, { value: "alphabetical", label: "Alphabetical" }]}
                  className="min-w-36 rounded-lg border border-[#c3c6d7] bg-white px-3 py-1.5 text-left font-inter text-[13px] text-[#0b1c30] outline-none focus-visible:border-[#004ac6] focus-visible:ring-2 focus-visible:ring-[#004ac6]/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {contestants.map((contestant, idx) => (
                  <ContestantCard
                    key={contestant.id}
                    contestant={contestant}
                    poll={poll}
                    rank={idx + 1}
                  />
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
