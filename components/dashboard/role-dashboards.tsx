"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Clock3,
  CreditCard,
  Loader2,
  ShieldCheck,
  Users,
} from "lucide-react";
import { adminApi } from "@/lib/api/admin";
import { authApi } from "@/lib/api/auth";
import { useMyPolls, useMyPollVoteTrend, usePolls } from "@/lib/hooks/usePolls";
import { useNotifications } from "@/lib/hooks/useNotifications";
import { useWallet } from "@/lib/hooks/useWallet";
import { PollCard } from "@/components/poll-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Poll, User } from "@/lib/types";

const money = (amount: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(amount || 0);

export function VoterDashboard({ user }: { user: User }) {
  const [businessName, setBusinessName] = useState("");
  const [bio, setBio] = useState("");
  const queryClient = useQueryClient();
  const pollsQuery = usePolls();
  const requestQuery = useQuery({
    queryKey: ["organizer-request-status", user.id],
    queryFn: authApi.organizerRequestStatus,
  });
  const requestMutation = useMutation({
    mutationFn: () => authApi.requestOrganizerAccess({ business_name: businessName.trim(), bio: bio.trim() }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["organizer-request-status", user.id] }),
        queryClient.invalidateQueries({ queryKey: ["auth", "me"] }),
      ]);
    },
  });

  const activePolls = (pollsQuery.data?.results ?? [])
    .filter((poll) => ["active", "ending_soon", "new"].includes(poll.status));
  const request = requestQuery.data && "is_approved" in requestQuery.data ? requestQuery.data : null;
  const requestPending = Boolean(request && !request.is_approved);

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Voter account</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Welcome, {user.name.split(" ")[0]}</h1>
          <p className="mt-1 text-muted-foreground">Find a contest, choose a candidate, and cast your vote.</p>
        </div>
        <Button asChild><Link href="/polls">Explore all polls <ArrowUpRight className="ml-2 h-4 w-4" /></Link></Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard title="Public campaigns" value={pollsQuery.isLoading ? "—" : (pollsQuery.data?.count ?? 0).toLocaleString()} description="Campaigns listed for voters" icon={<Activity className="h-4 w-4 text-muted-foreground" />} />
        <SummaryCard title="Your role" value="Voter" description="You can participate in public contests" icon={<CheckCircle2 className="h-4 w-4 text-muted-foreground" />} />
        <SummaryCard title="Organizer access" value={requestPending ? "In review" : "Optional"} description={requestPending ? "Your application is with our team" : "Apply to create and manage polls"} icon={<ShieldCheck className="h-4 w-4 text-muted-foreground" />} />
      </div>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-3">
          <div><h2 className="text-xl font-semibold">Polls open for voting</h2><p className="text-sm text-muted-foreground">Recently available campaigns from VoteFlow organizers.</p></div>
          <Link href="/polls" className="text-sm font-medium text-primary hover:underline">Browse all</Link>
        </div>
        {pollsQuery.isLoading ? <LoadingBlock /> : pollsQuery.error ? (
          <p className="rounded-lg border border-destructive/30 p-5 text-sm text-destructive">Unable to load polls right now. Please try again.</p>
        ) : activePolls.length ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{activePolls.slice(0, 3).map((poll) => <PollCard key={poll.id} poll={poll} />)}</div>
        ) : <EmptyCard title="No open polls yet" description="Check back soon or browse all campaigns to see what is coming up." action={<Button variant="outline" asChild><Link href="/polls">Browse polls</Link></Button>} />}
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Become an organizer</CardTitle>
          <CardDescription>Request approval to publish polls and manage your own campaigns.</CardDescription>
        </CardHeader>
        <CardContent>
          {requestQuery.isLoading ? <LoadingBlock compact /> : requestQuery.error ? (
            <p className="text-sm text-destructive">Could not check your organizer request. Please refresh and try again.</p>
          ) : request && !request.is_approved ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Badge variant="outline" className="w-fit"><Clock3 className="mr-1.5 h-3.5 w-3.5" /> Pending review</Badge>
              <p className="text-sm text-muted-foreground">Your request for {request.business_name || "organizer access"} was sent on {new Date(request.requested_at).toLocaleDateString()}.</p>
            </div>
          ) : (
            <form className="grid gap-4 md:grid-cols-[1fr_1.5fr_auto] md:items-end" onSubmit={(event) => { event.preventDefault(); requestMutation.mutate(); }}>
              <div className="space-y-2">
                <Label htmlFor="organizer-business">Organization or campaign</Label>
                <Input id="organizer-business" value={businessName} onChange={(event) => setBusinessName(event.target.value)} placeholder="Your organization name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="organizer-bio">What do you plan to organize? <span className="font-normal text-muted-foreground">(optional)</span></Label>
                <Input id="organizer-bio" value={bio} onChange={(event) => setBio(event.target.value)} placeholder="A short note for the review team" />
              </div>
              <Button type="submit" disabled={!businessName.trim() || requestMutation.isPending}>
                {requestMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Request access
              </Button>
              {requestMutation.error && <p className="text-sm text-destructive md:col-span-3">{requestMutation.error instanceof Error ? requestMutation.error.message : "Unable to send your request."}</p>}
              {requestMutation.isSuccess && <p className="text-sm text-green-700 md:col-span-3">Request submitted. You will see its review status here.</p>}
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function OrganizerDashboard({ user }: { user: User }) {
  const pollsQuery = useMyPolls();
  const voteTrendQuery = useMyPollVoteTrend();
  const walletQuery = useWallet();
  const notificationsQuery = useNotifications();
  const polls = pollsQuery.data?.results ?? [];
  const loading = pollsQuery.isLoading;
  const activeCount = polls.filter((poll) => ["active", "ending_soon", "new"].includes(poll.status)).length;
  const voteCount = polls.reduce((total, poll) => total + poll.votesCount, 0);
  const topPolls = [...polls].sort((a, b) => b.votesCount - a.votesCount).slice(0, 5);
  const recentActivity = notificationsQuery.data?.slice(0, 5) ?? [];
  const voteTrend = voteTrendQuery.data ?? [];
  const weeklyVotes = voteTrend.reduce((total, day) => total + day.votes, 0);
  const maxDailyVotes = Math.max(1, ...voteTrend.map((day) => day.votes));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-sm font-medium text-primary">Organizer workspace</p><h1 className="mt-1 text-3xl font-bold tracking-tight">Welcome, {user.name.split(" ")[0]}</h1><p className="mt-1 text-muted-foreground">Track your campaigns, votes, and earnings.</p></div>
        <Button asChild><Link href="/create">Create a poll</Link></Button>
      </div>

      {(pollsQuery.error || voteTrendQuery.error || walletQuery.error || notificationsQuery.error) && <p className="text-sm text-destructive">Some organizer data could not be loaded. Refresh the page to try again.</p>}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SummaryCard title="Lifetime earnings" value={walletQuery.isLoading ? "—" : money(walletQuery.data?.lifetimeEarnings ?? 0)} icon={<CreditCard className="h-4 w-4 text-muted-foreground" />} />
        <SummaryCard title="Active polls" value={loading ? "—" : activeCount.toLocaleString()} icon={<Activity className="h-4 w-4 text-muted-foreground" />} />
        <SummaryCard title="Total votes" value={loading ? "—" : voteCount.toLocaleString()} icon={<BarChart3 className="h-4 w-4 text-muted-foreground" />} />
        <SummaryCard title="Available balance" value={walletQuery.isLoading ? "—" : money(walletQuery.data?.availableBalance ?? 0)} icon={<ArrowUpRight className="h-4 w-4 text-muted-foreground" />} />
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div><CardTitle>Vote activity</CardTitle><CardDescription>Votes recorded across your polls over the last seven days.</CardDescription></div>
          <Button variant="outline" size="sm" asChild><Link href="/analytics">Full analytics <ArrowUpRight className="ml-2 h-4 w-4" /></Link></Button>
        </CardHeader>
        <CardContent>
          {voteTrendQuery.isLoading ? <LoadingBlock compact /> : voteTrendQuery.error ? (
            <p className="py-6 text-center text-sm text-destructive">Unable to load your vote activity.</p>
          ) : voteTrend.length ? (
            <>
              <div className="mb-5 flex items-end justify-between gap-4">
                <div><p className="text-sm text-muted-foreground">Votes this week</p><p className="text-3xl font-bold">{weeklyVotes.toLocaleString()}</p></div>
                {!weeklyVotes && <p className="text-sm text-muted-foreground">Your daily totals will appear here when votes are cast.</p>}
              </div>
              <div className="grid h-36 grid-cols-7 gap-2 sm:gap-4" role="img" aria-label={`Daily votes for the last seven days, ${weeklyVotes} total`}>
                {voteTrend.map((day) => {
                  const label = new Date(`${day.date}T00:00:00`).toLocaleDateString(undefined, { weekday: "short" });
                  const height = day.votes ? Math.max(8, (day.votes / maxDailyVotes) * 100) : 4;
                  return <div key={day.date} className="flex min-w-0 flex-col items-center justify-end gap-2" title={`${label}: ${day.votes.toLocaleString()} votes`}>
                    <div className="flex w-full flex-1 items-end"><div className={`w-full rounded-t-md ${day.votes ? "bg-primary" : "bg-muted"}`} style={{ height: `${height}%` }} /></div>
                    <span className="text-[11px] text-muted-foreground">{label}</span>
                    <span className="sr-only">{day.votes.toLocaleString()} votes</span>
                  </div>;
                })}
              </div>
            </>
          ) : <p className="py-8 text-center text-sm text-muted-foreground">No vote activity is available yet.</p>}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader><CardTitle>Recent activity</CardTitle><CardDescription>Recent notifications for your account.</CardDescription></CardHeader>
          <CardContent>
            {notificationsQuery.isLoading ? <LoadingBlock /> : recentActivity.length ? <div className="space-y-5">{recentActivity.map((notification) => <div key={notification.id} className="flex items-start gap-4"><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{notification.title}</p><p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{notification.description}</p></div>{!notification.read && <Badge variant="secondary">New</Badge>}</div>)}</div> : <p className="py-8 text-center text-sm text-muted-foreground">No recent activity.</p>}
            <Button variant="link" asChild className="mt-4 px-0"><Link href="/notifications">View notifications</Link></Button>
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader><CardTitle>Top performing polls</CardTitle><CardDescription>Your campaigns with the most votes.</CardDescription></CardHeader>
          <CardContent>
            {loading ? <LoadingBlock /> : pollsQuery.error ? <p className="py-8 text-center text-sm text-destructive">Unable to load your polls.</p> : topPolls.length ? <div className="space-y-5">{topPolls.map((poll) => <PollSummary key={poll.id} poll={poll} />)}</div> : <EmptyCard title="No polls created" description="Launch a campaign to start tracking votes and earnings." action={<Button size="sm" asChild><Link href="/create">Create poll</Link></Button>} />}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function AdminDashboard({ user }: { user: User }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-dashboard", user.id],
    queryFn: async () => {
      const [summary, requests] = await Promise.all([
        adminApi.dashboard(),
        authApi.organizerRequests(),
      ]);
      return { ...summary, requests };
    },
  });

  const metrics = [
    { title: "Registered accounts", value: data?.total_users, description: `${data?.voter_accounts ?? 0} voters · ${data?.administrator_accounts ?? 0} administrators`, icon: <Users className="h-4 w-4 text-muted-foreground" /> },
    { title: "Active accounts", value: data?.active_users, description: "Accounts able to sign in", icon: <CheckCircle2 className="h-4 w-4 text-muted-foreground" /> },
    { title: "Creator accounts", value: data?.organizer_accounts, description: "Approved organizers", icon: <ShieldCheck className="h-4 w-4 text-muted-foreground" /> },
    { title: "Pending requests", value: data?.pending_organizer_requests, description: "Organizer applications awaiting review", icon: <Clock3 className="h-4 w-4 text-muted-foreground" /> },
    { title: "Polls accepting votes", value: data?.active_polls, description: `Across ${data?.total_polls ?? 0} total polls`, icon: <Activity className="h-4 w-4 text-muted-foreground" /> },
    { title: "Contests", value: data?.total_contests, description: `${data?.live_contests ?? 0} live · ${data?.suspended_contests ?? 0} suspended`, icon: <Activity className="h-4 w-4 text-muted-foreground" /> },
    { title: "Votes cast", value: data?.total_votes, description: "Recorded vote quantity", icon: <BarChart3 className="h-4 w-4 text-muted-foreground" /> },
    { title: "Confirmed payments", value: data?.confirmed_payments, description: "Completed payment records", icon: <CreditCard className="h-4 w-4 text-muted-foreground" /> },
    { title: "Payments pending", value: data?.pending_payments, description: "Awaiting confirmation", icon: <Clock3 className="h-4 w-4 text-muted-foreground" /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-sm font-medium text-primary">Platform administration</p><h1 className="mt-1 text-3xl font-bold tracking-tight">Welcome, {user.name.split(" ")[0]}</h1><p className="mt-1 text-muted-foreground">Review access requests and monitor platform activity.</p></div>
        <Button asChild><Link href="/admin">Open admin console</Link></Button>
      </div>

      {error && <p className="text-sm text-destructive">Unable to load all administration data. Refresh the page to try again.</p>}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => <SummaryCard key={metric.title} title={metric.title} value={isLoading ? "—" : (metric.value ?? 0).toLocaleString()} description={metric.description} icon={metric.icon} />)}
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between gap-3"><div><CardTitle>Organizer requests</CardTitle><CardDescription>Applications waiting for an approval decision.</CardDescription></div><Button variant="outline" size="sm" asChild><Link href="/admin">Review all</Link></Button></CardHeader>
          <CardContent>
            {isLoading ? <LoadingBlock /> : data?.requests.length ? <div className="space-y-4">{data.requests.slice(0, 5).map((request) => <div key={request.id} className="flex flex-col gap-2 border-b pb-4 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><p className="truncate text-sm font-semibold">{request.business_name || "Organizer application"}</p><p className="truncate text-sm text-muted-foreground">{request.name} · {request.email}</p></div><Badge variant="outline" className="w-fit">Pending</Badge></div>)}</div> : <p className="py-8 text-center text-sm text-muted-foreground">No organizer requests need review.</p>}
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Recent audit activity</CardTitle><CardDescription>Latest security and platform events.</CardDescription></CardHeader>
          <CardContent>
            {isLoading ? <LoadingBlock /> : data?.recent_activity.length ? <div className="space-y-4">{data.recent_activity.map((log) => <div key={log.id} className="flex items-start gap-3"><div className="mt-0.5 rounded-full bg-muted p-2"><Activity className="h-3.5 w-3.5 text-muted-foreground" /></div><div className="min-w-0 flex-1"><p className="text-sm font-medium">{humanize(log.action_type)}</p><p className="text-xs text-muted-foreground">{log.resource_type || "Platform"} · {new Date(log.timestamp).toLocaleString()}</p></div></div>)}</div> : <p className="py-8 text-center text-sm text-muted-foreground">No audit activity is available.</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SummaryCard({ title, value, description, icon }: { title: string; value: string; description?: string; icon: React.ReactNode }) {
  return <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">{title}</CardTitle>{icon}</CardHeader><CardContent><div className="text-2xl font-bold">{value}</div>{description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}</CardContent></Card>;
}

function LoadingBlock({ compact = false }: { compact?: boolean }) {
  return <div className={`flex justify-center ${compact ? "py-3" : "py-8"}`}><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
}

function EmptyCard({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return <div className="rounded-lg border border-dashed p-8 text-center"><p className="font-medium">{title}</p><p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">{description}</p>{action && <div className="mt-4">{action}</div>}</div>;
}

function PollSummary({ poll }: { poll: Poll }) {
  return <Link href={`/polls/${poll.slug}`} className="flex items-center gap-4 hover:text-primary"><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{poll.title}</p><p className="text-sm text-muted-foreground">{poll.votesCount.toLocaleString()} votes</p></div><span className="text-sm font-semibold">{poll.isPaid ? `${money(Number(poll.pricePerVote ?? 0))}/vote` : "Free"}</span></Link>;
}

function humanize(value: string) {
  return value.toLowerCase().split("_").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
}
