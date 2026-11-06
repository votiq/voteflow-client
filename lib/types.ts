// ============================================================
// VoteFlow — Shared TypeScript Interfaces
// Single source of truth for all domain types.
// ============================================================

// ─── Poll ────────────────────────────────────────────────────

export type PollStatus = 'active' | 'ending_soon' | 'closed' | 'draft' | 'new';

export interface Contestant {
  id: string;
  name: string;
  author: string;
  description: string;
  image: string;
  votes: number;
  percentage?: number;
}

export interface Poll {
  id: string;
  slug: string;
  title: string;
  organizer: string;
  category: string;
  description: string;
  image: string;
  status: PollStatus;
  votes: string;          // formatted display string e.g. "12.4K"
  votesCount: number;     // raw number for calculations
  endsIn: string;         // human-readable e.g. "14d" or "2h 14m"
  endsAt: string;         // ISO date string for real countdown
  isPaid: boolean;
  pricePerVote?: number;
  contestants: Contestant[];
  tags?: string[];
}

// ─── Auth / User ─────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: 'user' | 'creator' | 'admin';
  createdAt: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

// ─── Wallet / Transactions ───────────────────────────────────

export type TransactionStatus = 'completed' | 'pending' | 'failed';
export type TransactionType = 'earning' | 'withdrawal' | 'refund';

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;         // positive = credit, negative = debit
  status: TransactionStatus;
  type: TransactionType;
}

export interface WalletData {
  availableBalance: number;
  pendingEarnings: number;
  lifetimeEarnings: number;
  transactions: Transaction[];
}

// ─── Dashboard Stats ─────────────────────────────────────────

export interface StatCard {
  label: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: string;
}

// ─── API Response Wrappers ───────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  results: T[];
  count: number;
  next: string | null;
  previous: string | null;
}

// ─── Filter & Search ─────────────────────────────────────────

export interface PollFilters {
  search?: string;
  category?: string;
  status?: PollStatus | 'all';
  isPaid?: boolean;
  sortBy?: 'votes' | 'newest' | 'ending_soon' | 'alphabetical';
  page?: number;
}
