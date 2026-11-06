"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, BarChart3, CheckCircle2, Clock3, ShieldCheck, Vote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/lib/stores/auth";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import { authApi } from "@/lib/api/auth";

const steps = [
  { icon: Vote, title: "Create your account", description: "Start with a free VoteFlow account. You can vote in public polls while your application is reviewed." },
  { icon: ShieldCheck, title: "Request organizer access", description: "Share your organization or campaign name. Our admins review each request before publishing is enabled." },
  { icon: BarChart3, title: "Publish and manage polls", description: "Once approved, create contests, follow results, and manage your organizer wallet from one dashboard." },
];

export default function BecomeCreatorPage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const currentUser = useCurrentUser();
  const user = currentUser.data;
  const requestQuery = useQuery({
    queryKey: ["organizer-request-status", user?.id],
    queryFn: authApi.organizerRequestStatus,
    enabled: Boolean(user && user.role === "user"),
  });
  const request = requestQuery.data && "is_approved" in requestQuery.data ? requestQuery.data : null;
  const hasAccess = user?.role === "creator" || user?.role === "admin";
  const requestPending = Boolean(request && !request.is_approved);

  return (
    <div className="bg-[#f8f9ff] px-4 py-14 text-[#0b1c30] sm:px-8 sm:py-20">
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto max-w-3xl text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e5eeff] text-[#004ac6]"><Vote className="h-6 w-6" /></span>
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-[#004ac6]">For organizers</p>
          <h1 className="mt-3 font-geist text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">Become a VoteFlow creator</h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#626b7d] sm:text-lg">Run a contest, bring your community together, and track participation from one organizer workspace. Organizer access is reviewed before you can publish.</p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            {hasAccess ? (
              <Button asChild className="min-h-12"><Link href="/create">Create a poll <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
            ) : requestPending ? (
              <div className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-5 text-sm font-semibold text-amber-800"><Clock3 className="h-4 w-4" /> Request under review</div>
            ) : isAuthenticated ? (
              <Button asChild className="min-h-12"><Link href="/create">Request organizer access <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
            ) : (
              <>
                <Button asChild className="min-h-12"><Link href="/register">Create an account <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
                <Button asChild variant="outline" className="min-h-12"><Link href="/login?redirect=%2Fcreate">I already have an account</Link></Button>
              </>
            )}
          </div>
          {requestPending && <p className="mt-3 text-sm text-[#626b7d]">Your request for {request.business_name || "organizer access"} is waiting for an admin decision.</p>}
          {isAuthenticated && !user && currentUser.isLoading && <p className="mt-3 text-sm text-[#626b7d]">Loading your account status…</p>}
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {steps.map(({ icon: Icon, title, description }, index) => (
            <Card key={title} className="border-[#e5e8f1] bg-white shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between"><span className="text-sm font-bold tracking-[0.12em] text-[#8b91a1]">0{index + 1}</span><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e5eeff] text-[#004ac6]"><Icon className="h-5 w-5" /></span></div>
                <CardTitle className="pt-2 text-lg">{title}</CardTitle>
                <CardDescription className="leading-6">{description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        <Card className="mt-6 border-[#dbe5fb] bg-[#eff4ff]">
          <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
            <CheckCircle2 className="h-6 w-6 shrink-0 text-[#16804a]" />
            <p className="flex-1 text-sm leading-6 text-[#434655]">Every new account can explore public polls. You only need organizer approval when you are ready to publish and manage your own.</p>
            <Button asChild variant="outline"><Link href="/polls">Explore polls</Link></Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
