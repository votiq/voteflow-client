import { apiClient, normalizePaginatedResponse } from "./client";
import type { PaginatedResponse } from "@/lib/types";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ORGANIZER" | "ADMIN";
  is_active: boolean;
  is_email_verified: boolean;
  created_at: string;
}

export interface AdminAuditLog {
  id: string;
  action_type: string;
  resource_type: string;
  resource_id: string;
  user_id: string | null;
  timestamp: string;
  metadata: Record<string, unknown>;
}

export interface AdminDashboardSummary {
  total_users: number;
  active_users: number;
  voter_accounts: number;
  organizer_accounts: number;
  administrator_accounts: number;
  pending_organizer_requests: number;
  total_polls: number;
  active_polls: number;
  total_contests: number;
  live_contests: number;
  suspended_contests: number;
  total_votes: number;
  confirmed_payments: number;
  pending_payments: number;
  recent_activity: Array<Pick<AdminAuditLog, "id" | "action_type" | "resource_type" | "timestamp">>;
}

type Page<T> = Partial<PaginatedResponse<T>> & { items?: T[] };

export const adminApi = {
  dashboard: () => apiClient.get<AdminDashboardSummary>("/admin/dashboard/"),

  users: (role?: AdminUser["role"]) => {
    const params = new URLSearchParams();
    if (role) params.set("role", role);
    const query = params.toString();
    return apiClient
      .get<Page<AdminUser>>(`/admin/users/${query ? `?${query}` : ""}`)
      .then(normalizePaginatedResponse);
  },

  auditLogs: () =>
    apiClient
      .get<Page<AdminAuditLog>>("/admin/audit-logs/")
      .then(normalizePaginatedResponse),
};
