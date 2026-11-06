import { apiClient, normalizePaginatedResponse } from "./client";
import type { Poll, PollFilters, PaginatedResponse, Contestant } from "@/lib/types";
import { POLL_PAGE_SIZE } from "@/lib/constants";

interface InlineVoteCheckoutPayload {
  contestant_id: string;
  quantity: number;
  email: string;
}

interface InlineVoteCheckoutResponse {
  payment_id: string;
  reference: string;
  amount: string;
  amount_minor: number;
  currency: string;
  public_key: string;
}

export interface VoteTrendPoint {
  date: string;
  votes: number;
}

// ─── Polls ────────────────────────────────────────────────────

export const pollsApi = {
  /** GET /polls/?search=&category=&status= */
  list: (filters?: PollFilters) => {
    const params = new URLSearchParams();
    if (filters?.search)   params.set("search",   filters.search);
    if (filters?.category) params.set("category", filters.category);
    if (filters?.status && filters.status !== "all")
      params.set("status", filters.status);
    if (filters?.sortBy)   params.set("ordering", filters.sortBy);
    if (filters?.page) {
      params.set("limit", String(POLL_PAGE_SIZE));
      params.set("offset", String((filters.page - 1) * POLL_PAGE_SIZE));
    }

    const query = params.toString();
    return apiClient
      .get<Partial<PaginatedResponse<Poll>> & { items?: Poll[] }>(`/polls/${query ? `?${query}` : ""}`, { public: true })
      .then(normalizePaginatedResponse);
  },

  /** GET /polls/my-polls/ */
  myPolls: () =>
    apiClient
      .get<Partial<PaginatedResponse<Poll>> & { items?: Poll[] }>("/polls/my-polls/")
      .then(normalizePaginatedResponse),

  myPollVoteTrend: () =>
    apiClient.get<VoteTrendPoint[]>("/polls/my-polls/analytics/"),

  /** GET /polls/:slug/ */
  get: (slug: string) =>
    apiClient.get<Poll>(`/polls/${slug}/`, { public: true }),

  /** POST /polls/:slug/checkout/ — server-priced payment reference for InlineJS. */
  initializeVoteCheckout: (slug: string, payload: InlineVoteCheckoutPayload) =>
    apiClient.post<InlineVoteCheckoutResponse, InlineVoteCheckoutPayload>(
      `/polls/${slug}/checkout/`,
      payload,
      { public: true },
    ),

  /** POST /polls/ */
  create: (data: Partial<Poll> | FormData) =>
    apiClient.post<Poll, Partial<Poll> | FormData>("/polls/", data),

  /** PATCH /polls/:slug/ */
  update: (slug: string, data: Partial<Poll>) => {
    const formData = new FormData();
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && value !== null) {
        formData.append(key, Array.isArray(value) ? JSON.stringify(value) : String(value));
      }
    }
    return apiClient.patch<Poll, FormData>(`/polls/${slug}/`, formData);
  },

  /** POST /polls/:slug/contestants/ */
  addContestant: (slug: string, data: FormData) =>
    apiClient.post<Contestant, FormData>(`/polls/${slug}/contestants/`, data),

  /** DELETE /polls/:slug/ */
  delete: (slug: string) =>
    apiClient.delete<void>(`/polls/${slug}/`),
};

// ─── Votes ────────────────────────────────────────────────────

interface CastVotePayload {
  contestant_id: string;
  quantity: number;
  email?: string;       // for paid votes / receipt
  payment_ref?: string; // Paystack reference
}

interface CastVoteResponse {
  success: boolean;
  message: string;
  transaction_ref?: string;
}

export const votesApi = {
  /** POST /polls/:slug/vote/ */
  cast: (slug: string, payload: CastVotePayload) =>
    apiClient.post<CastVoteResponse, CastVotePayload>(`/polls/${slug}/vote/`, payload, { public: true }),

  /** GET /polls/:slug/results/ */
  results: (slug: string) =>
    apiClient.get<Contestant[]>(`/polls/${slug}/results/`, { public: true }),
};
