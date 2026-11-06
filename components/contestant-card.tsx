"use client";

import type { Contestant, Poll } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { VoteCheckoutModal } from "@/components/vote-checkout-modal";

interface ContestantCardProps {
  contestant: Contestant;
  poll: Poll;
  rank?: number;
  className?: string;
}

export function ContestantCard({ contestant, poll, rank, className }: ContestantCardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const votingOpen = !["closed", "draft"].includes(poll.status) && (!poll.endsAt || new Date(poll.endsAt).getTime() > Date.now());

  return (
    <>
      <div className={cn("bg-white rounded-xl border border-[#c3c6d7] flex flex-col overflow-hidden hover-lift group soft-glow-shadow", className)}>
        {/* Image */}
        <div className="h-48 relative overflow-hidden bg-[#eff4ff]">
          <img
            src={contestant.image || "/window.svg"}
            alt={contestant.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {rank && rank <= 3 && (
            <div className="absolute top-3 left-3">
              <span className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow",
                rank === 1 ? "bg-[#f5a623] text-white" :
                rank === 2 ? "bg-[#9b9b9b] text-white" :
                "bg-[#c47a3a] text-white"
              )}>
                #{rank}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 flex-grow flex flex-col">
          <div className="mb-3 flex-grow">
            <h3 className="font-geist text-[18px] font-semibold leading-[1.3] text-[#0b1c30] mb-1">{contestant.name}</h3>
            <p className="font-inter text-[13px] text-[#004ac6] font-medium mb-2">by {contestant.author}</p>
            <p className="font-inter text-[13px] leading-[1.5] text-[#434655] line-clamp-3">{contestant.description}</p>
          </div>

          {/* Vote Progress */}
          {contestant.percentage !== undefined && (
            <div className="mb-3">
              <div className="flex justify-between text-xs text-[#737686] mb-1">
                <span>{contestant.votes.toLocaleString()} votes</span>
                <span className="font-semibold text-[#004ac6]">{contestant.percentage}%</span>
              </div>
              <div className="h-1.5 w-full bg-[#e5eeff] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#004ac6] rounded-full transition-all duration-500"
                  style={{ width: `${contestant.percentage}%` }}
                />
              </div>
            </div>
          )}

          {/* Vote Button */}
          <div className="mt-auto pt-3 border-t border-[#c3c6d7]">
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              disabled={!votingOpen}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 btn-primary rounded-lg text-white font-geist text-[13px] font-medium tracking-[0.01em] hover:opacity-90 transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: '"FILL" 1' }}>{votingOpen ? "thumb_up" : "lock"}</span>
              {votingOpen ? "Vote Now" : "Voting closed"}
              {poll.isPaid && poll.pricePerVote && (
                <span className="ml-1 opacity-80">(₦{poll.pricePerVote.toLocaleString("en-NG")})</span>
              )}
            </button>
          </div>
        </div>
      </div>

      <VoteCheckoutModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        contestant={contestant}
        poll={poll}
      />
    </>
  );
}
