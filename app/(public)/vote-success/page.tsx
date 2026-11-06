"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Copy, Loader2, Share2, Vote } from "lucide-react";
import { toast } from "sonner";
import { usePoll } from "@/lib/hooks/usePoll";
import { Button } from "@/components/ui/button";

interface Confirmation {
  pollSlug: string;
  contestantId: string;
  quantity: number;
}

export default function VoteSuccessPage() {
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const [isReadingConfirmation, setIsReadingConfirmation] = useState(true);
  const [copied, setCopied] = useState(false);
  const { data: poll, isLoading, error } = usePoll(confirmation?.pollSlug ?? "");
  const contestant = poll?.contestants.find((item) => item.id === confirmation?.contestantId);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("voteflow-last-vote");
      const parsed = saved ? JSON.parse(saved) as Partial<Confirmation> : null;
      if (isValidConfirmation(parsed)) {
        setConfirmation(parsed);
      } else {
        const params = new URLSearchParams(window.location.search);
        const fromUrl = {
          pollSlug: params.get("poll"),
          contestantId: params.get("contestant"),
          quantity: Number(params.get("quantity") || 1),
        };
        if (isValidConfirmation(fromUrl)) setConfirmation(fromUrl);
      }
    } catch {
      const params = new URLSearchParams(window.location.search);
      const pollSlug = params.get("poll");
      const contestantId = params.get("contestant");
      const quantity = Number(params.get("quantity") || 1);
      if (pollSlug && contestantId && Number.isInteger(quantity) && quantity >= 1 && quantity <= 1000) {
        setConfirmation({ pollSlug, contestantId, quantity });
      }
    } finally {
      setIsReadingConfirmation(false);
    }
  }, []);

  const share = async () => {
    const url = `${window.location.origin}/polls/${confirmation?.pollSlug}`;
    try {
      if (navigator.share) await navigator.share({ title: poll?.title ?? "VoteFlow poll", url });
      else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        toast.success("Poll link copied.");
      }
    } catch {
      // The voter closed the native share sheet.
    }
  };

  if (isReadingConfirmation) {
    return <section className="flex min-h-[65vh] items-center justify-center bg-[#f8f9ff]"><Loader2 className="h-8 w-8 animate-spin text-[#004ac6]" /></section>;
  }

  if (!confirmation) {
    return (
      <section className="flex min-h-[65vh] items-center justify-center bg-[#f8f9ff] px-4">
        <div className="max-w-md rounded-2xl border border-[#e5e8f1] bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-semibold">Vote confirmation unavailable</h1>
          <p className="mt-2 text-sm leading-6 text-[#626b7d]">Open a poll and cast your vote to see its confirmation details.</p>
          <Button asChild className="mt-5"><Link href="/polls">Explore polls</Link></Button>
        </div>
      </section>
    );
  }

  if (isLoading) {
    return <section className="flex min-h-[65vh] items-center justify-center bg-[#f8f9ff]"><Loader2 className="h-8 w-8 animate-spin text-[#004ac6]" /></section>;
  }

  if (error || !poll || !contestant) {
    return (
      <section className="flex min-h-[65vh] items-center justify-center bg-[#f8f9ff] px-4">
        <div className="max-w-md text-center">
          <h1 className="text-xl font-semibold">Vote recorded</h1>
          <p className="mt-2 text-sm leading-6 text-[#626b7d]">Your vote was submitted, but the poll details could not be loaded.</p>
          <Button asChild className="mt-5"><Link href="/polls">Explore polls</Link></Button>
        </div>
      </section>
    );
  }

  return (
    <section className="flex min-h-[65vh] items-center justify-center bg-[#f8f9ff] px-4 py-12 text-[#0b1c30]">
      <div className="w-full max-w-xl rounded-3xl border border-[#e5e8f1] bg-white p-7 text-center shadow-[0_24px_70px_-36px_rgba(22,48,105,0.35)] sm:p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#e9f8ef] text-[#16804a]"><Check className="h-8 w-8" /></div>
        <p className="mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#004ac6]"><Vote className="h-4 w-4" /> Vote submitted</p>
        <h1 className="mt-2 font-geist text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Thank you for voting</h1>
        <p className="mt-4 text-base leading-7 text-[#626b7d]">Your {confirmation.quantity === 1 ? "vote" : `${confirmation.quantity} votes`} for <span className="font-semibold text-[#17243b]">{contestant.name}</span> in <span className="font-semibold text-[#17243b]">{poll.title}</span> has been recorded.</p>
        {poll.isPaid && <p className="mt-3 text-sm text-[#626b7d]">Paid total: <span className="font-semibold text-[#17243b]">{new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format((poll.pricePerVote ?? 0) * confirmation.quantity)}</span></p>}
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Button onClick={share} variant="outline" className="min-h-11"><Share2 className="mr-2 h-4 w-4" />Share poll</Button>
          <Button asChild className="min-h-11"><Link href={`/polls/${poll.slug}`}>Return to poll <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
        </div>
        {copied && <p className="mt-4 inline-flex items-center gap-1 text-xs text-[#16804a]"><Copy className="h-3 w-3" /> Link copied</p>}
      </div>
    </section>
  );
}

function isValidConfirmation(value: Partial<Confirmation> | { pollSlug: string | null; contestantId: string | null; quantity: number } | null): value is Confirmation {
  return Boolean(
    value &&
    typeof value.pollSlug === "string" &&
    typeof value.contestantId === "string" &&
    Number.isInteger(value.quantity) &&
    Number(value.quantity) >= 1 &&
    Number(value.quantity) <= 1000,
  );
}
