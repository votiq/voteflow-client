"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { usePoll } from "@/lib/hooks/usePoll";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, BarChart2, Crown, Loader2, Share2, Trophy } from "lucide-react";
import { toast } from "sonner";

const money = (amount: number) => new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(amount || 0);

export default function ResultsPage() {
  const { slug } = useParams() as { slug: string };
  const { data: poll, isLoading, error } = usePoll(slug);

  if (isLoading) return <div className="flex min-h-[65vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (error || !poll) return <div className="flex min-h-[65vh] flex-col items-center justify-center gap-4"><p>Unable to load results for this poll.</p><Link href="/polls"><Button variant="outline">Browse polls</Button></Link></div>;

  const contestants = [...poll.contestants].sort((a, b) => b.votes - a.votes);
  const totalVotes = contestants.reduce((sum, contestant) => sum + contestant.votes, 0);
  const winner = contestants[0];
  const isLive = poll.status === "active" || poll.status === "ending_soon" || poll.status === "new";

  const shareResults = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: `${poll.title} results`, url });
      else {
        await navigator.clipboard.writeText(url);
        toast.success("Results link copied.");
      }
    } catch {
      // User may close the native share sheet.
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-background">
      <section className="container mx-auto min-h-[65vh] max-w-4xl px-4 py-8 md:px-6">
        <Link href={`/polls/${slug}`}><Button variant="ghost" className="mb-6 -ml-4 text-muted-foreground"><ArrowLeft className="mr-2 h-4 w-4" />Back to Poll</Button></Link>

        <div className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Badge className={isLive ? "bg-success text-success-foreground" : ""} variant={isLive ? "default" : "secondary"}>
                {isLive ? "Live Results" : "Final Results"}
              </Badge>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">{poll.title}</h1>
            <p className="mt-1 text-muted-foreground">Total Votes: <span className="font-bold text-foreground">{totalVotes.toLocaleString()}</span></p>
          </div>
          <Button variant="outline" onClick={shareResults}><Share2 className="mr-2 h-4 w-4" />Share Results</Button>
        </div>

        {winner && totalVotes > 0 ? (
          <Card className="relative mb-12 overflow-hidden border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-background shadow-lg">
            <div className="absolute right-0 top-0 p-6 opacity-10"><Trophy className="h-32 w-32" /></div>
            <CardContent className="relative z-10 flex flex-col items-center gap-8 p-8 md:flex-row md:p-10">
              <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-full border-4 border-background bg-primary/20 shadow-xl"><Crown className="h-16 w-16 text-primary" /></div>
              <div className="flex-1 text-center md:text-left">
                <Badge className="mb-3 bg-primary px-3 py-1 text-sm text-primary-foreground">Current Leader</Badge>
                <h2 className="mb-2 text-4xl font-black">{winner.name}</h2>
                <div className="text-xl text-muted-foreground"><span className="font-bold text-foreground">{winner.votes.toLocaleString()}</span> votes <span className="mx-2 opacity-50">•</span>{((winner.votes / totalVotes) * 100).toFixed(1)}%</div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-12"><CardContent className="py-10 text-center text-muted-foreground">No votes have been recorded yet.</CardContent></Card>
        )}

        <h3 className="mb-6 flex items-center text-xl font-bold"><BarChart2 className="mr-2 h-5 w-5 text-primary" />Full Leaderboard</h3>
        <div className="space-y-4">
          {contestants.map((contestant, index) => {
            const percentage = totalVotes ? (contestant.votes / totalVotes) * 100 : 0;
            return (
              <Card key={contestant.id} className="overflow-hidden border-border/50 shadow-sm transition-shadow hover:shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-8 text-center font-bold text-muted-foreground">#{index + 1}</div>
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-muted">{contestant.name.charAt(0)}</div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1.5 flex items-end justify-between gap-2">
                        <h4 className="truncate font-bold">{contestant.name}</h4>
                        <div className="shrink-0 text-sm font-medium">{contestant.votes.toLocaleString()} <span className="font-normal text-muted-foreground">({percentage.toFixed(1)}%)</span></div>
                      </div>
                      <Progress value={percentage} className="h-2.5" indicatorColor={index === 0 ? "bg-primary" : index === 1 ? "bg-accent" : "bg-muted-foreground"} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        {poll.isPaid && <p className="mt-8 text-center text-sm text-muted-foreground">Vote price: {money(Number(poll.pricePerVote || 0))}</p>}
      </section>
    </div>
  );
}
