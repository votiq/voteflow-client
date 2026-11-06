# Architecture

## Stack
| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript 5 (strict) |
| Styles | Tailwind CSS v4 + custom `globals.css` utilities |
| Components | shadcn/ui (Radix UI primitives) |
| Icons | Lucide React + Google Material Symbols |
| Fonts | Geist Sans (headings), Inter (body) via `next/font` |
| State (server) | TanStack Query v5 |
| State (client) | Zustand v5 |
| Forms | React Hook Form + Zod |
| Notifications | Sonner |
| Animations | Framer Motion page transitions and scroll entry/exit reveals |
| Backend | Django REST API, consumed through typed API functions |

---

## Folder Structure

```
voteflow-client/
├── app/
│   ├── layout.tsx                    # Root layout — providers only, NO nav
│   ├── not-found.tsx                 # Global 404 page
│   ├── globals.css                   # Design tokens, utility classes
│   ├── (public)/                     # Public routes — Navbar + Footer
│   │   ├── layout.tsx
│   │   ├── page.tsx                  # Landing page /
│   │   ├── polls/
│   │   │   ├── page.tsx              # Discover Contests /polls
│   │   │   └── [slug]/
│   │   │       └── page.tsx          # Poll Detail /polls/:slug
│   │   ├── become-creator/page.tsx   # Organizer access journey
│   │   ├── results/page.tsx          # Public results index
│   │   ├── results/[slug]/page.tsx   # Poll standings
│   │   └── vote-success/page.tsx     # Post-vote confirmation
│   ├── (auth)/                       # Auth routes — no layout chrome
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── forgot-password/page.tsx
│   └── (dashboard)/                  # Dashboard — Sidebar + top header
│       ├── layout.tsx
│       ├── dashboard/page.tsx
│       ├── create/page.tsx
│       ├── wallet/page.tsx
│       ├── analytics/page.tsx
│       ├── settings/page.tsx
│       ├── admin/page.tsx
│       └── notifications/page.tsx
│
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx                # Public nav with active-link detection
│   │   ├── Footer.tsx
│   │   └── sidebar.tsx               # Dashboard sidebar with all routes
│   ├── providers/
│   │   └── providers.tsx             # ThemeProvider + ReactQueryProvider
│   ├── ui/                           # shadcn/ui primitives
│   ├── poll-card.tsx                 # Typed PollCard linked to /polls/:slug
│   ├── contestant-card.tsx           # Typed ContestantCard with vote modal
│   ├── vote-checkout-modal.tsx       # Free/paid vote checkout dialog
│   └── theme-toggle.tsx
│
├── lib/
│   ├── types.ts                      # Shared domain interfaces
│   ├── utils.ts                      # cn() and helpers
│   ├── data/
│   │   └── polls.ts                  # Mock poll data (replace with API)
│   └── api/
│       ├── client.ts                 # Base fetch wrapper with JWT
│       ├── polls.ts                  # Poll + vote endpoints
│       ├── auth.ts                   # Auth endpoints
│       └── wallet.ts                 # Wallet endpoints
│
└── project-docs/                     # Project documentation
```

---

## Route Group Strategy

| Group | Layout Chrome | Routes |
|---|---|---|
| `(public)` | Navbar + Footer | `/`, `/polls`, `/polls/:slug` |
| `(auth)` | None (just page wrapper) | `/login`, `/register`, `/forgot-password` |
| `(dashboard)` | Sidebar + top header | `/dashboard`, `/create`, `/wallet`, etc. |
| `app/` root | Providers only | Applies to ALL groups |

---

## Data Flow (Current — API-backed)

```
Django REST API
  → lib/api/polls.ts (fetch wrapper)
  → TanStack Query hooks (usePolls, usePoll, useVote)
  → React components via props / hooks
```

---

## Design System

All design tokens live in `globals.css`. Key classes:

| Class | Purpose |
|---|---|
| `.btn-primary` | Blue gradient CTA button |
| `.btn-secondary` | White outlined button |
| `.soft-glow-shadow` | Card shadow |
| `.soft-glow-card` | Card with hover lift |
| `.interactive-card` | Card with translateY hover |
| `.glass-card` | Frosted glass card |
| `.bg-grid-pattern` | Dotted background decoration |

Colors follow a `#004ac6` (primary blue) + `#712ae2` (accent purple) palette.
