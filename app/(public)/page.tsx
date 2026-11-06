import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Check,
  CircleDollarSign,
  Clock3,
  ShieldCheck,
  UsersRound,
  Vote,
} from "lucide-react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export const metadata: Metadata = {
  title: "VoteFlow — Create polls. Make every vote count.",
  description:
    "Create a poll, share it with your community, and follow every response in one clear workspace.",
};

const steps = [
  {
    number: "01",
    title: "Set up your poll",
    description: "Add a title, a closing time, and the candidates or choices people can vote for.",
    icon: Vote,
  },
  {
    number: "02",
    title: "Share one link",
    description: "Invite your community to vote from any device, without a complicated setup.",
    icon: UsersRound,
  },
  {
    number: "03",
    title: "Follow the results",
    description: "Keep an eye on participation and results from your organizer dashboard.",
    icon: BarChart3,
  },
];

const features = [
  {
    title: "A clear voting experience",
    description: "Give voters a focused page with the poll details and choices they need to participate.",
    icon: Check,
  },
  {
    title: "Polls that fit your event",
    description: "Choose a category, add contestants, and decide whether voting is free or paid.",
    icon: CircleDollarSign,
  },
  {
    title: "One place to manage it",
    description: "Review your polls, see activity, and manage your organizer profile from one workspace.",
    icon: ShieldCheck,
  },
];

export default function LandingPage() {
  return (
    <div className="overflow-hidden bg-[#f8f9ff] text-[#0b1c30]">
      <section className="relative px-4 pb-20 pt-14 sm:px-8 sm:pb-24 sm:pt-20 lg:px-12 lg:pt-24">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[560px] bg-[radial-gradient(ellipse_at_70%_15%,rgba(180,197,255,0.5),transparent_55%),radial-gradient(ellipse_at_15%_0%,rgba(226,233,255,0.8),transparent_48%)]" />
        <ScrollReveal className="relative mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.02fr_0.98fr] lg:gap-10">
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#c3c6d7] bg-white/80 px-3.5 py-2 text-xs font-semibold text-[#33415c] shadow-sm">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#e5eeff] text-[#004ac6]"><Vote className="h-3.5 w-3.5" /></span>
              A simpler way to run community polls
            </div>
            <h1 className="font-geist text-5xl font-semibold leading-[1.04] tracking-[-0.055em] sm:text-6xl lg:text-[4.35rem]">
              Make every
              <span className="block bg-gradient-to-r from-[#004ac6] via-[#3659d9] to-[#7854d8] bg-clip-text pb-2 text-transparent">vote count.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-[#535c70] sm:text-lg sm:leading-8">
              Bring your poll, your voters, and your results together. VoteFlow makes it easier to run a contest and easier for your community to take part.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/become-creator" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#004ac6] px-6 text-sm font-semibold text-white shadow-lg shadow-[#004ac6]/20 transition hover:-translate-y-0.5 hover:bg-[#003ea8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#004ac6] focus-visible:ring-offset-2">
                Become a creator <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/polls" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#c3c6d7] bg-white/80 px-6 text-sm font-semibold text-[#17243b] transition hover:border-[#8ca7df] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#004ac6] focus-visible:ring-offset-2">
                Explore public polls
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[#535c70]">
              <span className="inline-flex items-center gap-2"><Check className="h-4 w-4 text-[#16804a]" /> Start with a free account</span>
              <span className="inline-flex items-center gap-2"><Clock3 className="h-4 w-4 text-[#004ac6]" /> Set a clear closing time</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[570px]">
            <div aria-hidden="true" className="absolute -inset-5 rounded-[2rem] bg-gradient-to-br from-[#c4d5ff] via-[#eeeaff] to-[#b4c5ff] opacity-70 blur-2xl" />
            <div className="relative rounded-[1.6rem] border border-white/90 bg-white p-3 shadow-[0_28px_90px_-36px_rgba(22,48,105,0.45)] sm:p-5">
              <div className="flex items-center justify-between border-b border-[#e9ebf3] px-2 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e5eeff] text-[#004ac6]"><Vote className="h-5 w-5" /></div>
                  <div><p className="text-sm font-semibold">Poll preview</p><p className="text-xs text-[#737686]">A sample voter view</p></div>
                </div>
                <span className="rounded-full bg-[#e9f8ef] px-2.5 py-1 text-[11px] font-semibold text-[#16804a]">OPEN</span>
              </div>
              <div className="p-2 pt-5 sm:p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#737686]">Community choice</p>
                <h2 className="mt-2 font-geist text-2xl font-semibold tracking-[-0.035em] sm:text-[1.8rem]">Where should we meet next?</h2>
                <p className="mt-2 text-sm leading-6 text-[#737686]">Choose the option that works best for you.</p>
                <div className="mt-6 space-y-3">
                  {[
                    { name: "The waterfront", detail: "Easy to reach · Outdoor space", style: "border-[#8daeff] bg-[#f3f7ff]" },
                    { name: "The art district", detail: "Close to transit · Lots to explore", style: "border-[#e6e8ef] bg-white" },
                    { name: "The garden hall", detail: "Quiet setting · Accessible venue", style: "border-[#e6e8ef] bg-white" },
                  ].map((option, index) => (
                    <div key={option.name} className={`flex items-center gap-3 rounded-xl border p-3.5 transition sm:p-4 ${option.style}`}>
                      <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${index === 0 ? "border-[#004ac6]" : "border-[#c3c6d7] bg-white"}`}>
                        {index === 0 && <span className="h-2.5 w-2.5 rounded-full bg-[#004ac6]" />}
                      </span>
                      <span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{option.name}</span><span className="mt-1 block text-xs text-[#737686]">{option.detail}</span></span>
                    </div>
                  ))}
                </div>
                <button type="button" disabled className="mt-5 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#004ac6] text-sm font-semibold text-white opacity-90">
                  Cast your vote <ArrowRight className="h-4 w-4" />
                </button>
                <p className="mt-3 text-center text-[11px] text-[#85899a]">Example poll preview</p>
              </div>
              <div className="absolute -right-5 top-24 hidden items-center gap-2 rounded-xl border border-[#e9ebf3] bg-white px-3 py-2.5 shadow-lg sm:flex">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e9f8ef] text-[#16804a]"><Check className="h-4 w-4" /></span>
                <span><span className="block text-xs font-semibold">Your choice is clear</span><span className="block text-[10px] text-[#737686]">One simple voter flow</span></span>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      <section id="how-it-works" className="border-y border-[#e5e8f1] bg-white px-4 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#004ac6]">A straightforward flow</p>
            <h2 className="mt-3 font-geist text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">From first question to final result</h2>
            <p className="mt-4 text-base leading-7 text-[#626b7d]">Everything stays organized as your poll moves from setup to participation.</p>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {steps.map(({ number, title, description, icon: Icon }, index) => (
              <ScrollReveal key={number} delay={index * 0.07}>
              <article className="relative h-full rounded-2xl border border-[#e5e8f1] bg-[#fbfcff] p-6 sm:p-7">
                <div className="flex items-center justify-between"><span className="font-geist text-sm font-semibold tracking-[0.12em] text-[#8b91a1]">{number}</span><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e5eeff] text-[#004ac6]"><Icon className="h-5 w-5" /></span></div>
                <h3 className="mt-6 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#626b7d]">{description}</p>
              </article>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="px-4 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#004ac6]">Made for participation</p>
            <h2 className="mt-3 font-geist text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-4xl">Less time managing the process. More time listening to the people.</h2>
            <p className="mt-5 max-w-lg text-base leading-7 text-[#626b7d]">Whether you are gathering opinions or running a public contest, VoteFlow gives organizers and voters a shared, easy-to-follow experience.</p>
            <Link href="/polls" className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-[#004ac6] hover:gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#004ac6] focus-visible:ring-offset-4">
              See polls open to the public <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {features.map(({ title, description, icon: Icon }, index) => (
              <ScrollReveal key={title} className={index === 0 ? "sm:col-span-2" : undefined} delay={index * 0.06}>
              <article className={`h-full rounded-2xl border border-[#e5e8f1] p-6 ${index === 0 ? "bg-[#eef4ff]" : "bg-white"}`}>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#004ac6] shadow-sm"><Icon className="h-5 w-5" /></span>
                <h3 className="mt-5 font-semibold">{title}</h3>
                <p className="mt-2 max-w-lg text-sm leading-6 text-[#626b7d]">{description}</p>
              </article>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-8 lg:px-12">
        <ScrollReveal className="relative mx-auto max-w-7xl overflow-hidden rounded-[1.75rem] bg-[#071b3c] px-6 py-12 text-white sm:px-12 sm:py-16">
          <div aria-hidden="true" className="absolute -right-20 -top-40 h-96 w-96 rounded-full bg-[#315ed5]/35 blur-3xl" />
          <div className="relative flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#b4c5ff]">Ready when you are</p><h2 className="mt-3 font-geist text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Give your next poll a better home.</h2><p className="mt-4 max-w-xl text-sm leading-6 text-[#d4dcf2] sm:text-base">Create an account to set up your poll, or browse public polls and join a vote already in progress.</p></div>
            <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
              <Link href="/become-creator" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-[#0b1c30] transition hover:bg-[#eef2ff]">Become a creator <ArrowRight className="h-4 w-4" /></Link>
              <Link href="/polls" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/25 px-5 text-sm font-semibold text-white transition hover:bg-white/10">Browse polls</Link>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
