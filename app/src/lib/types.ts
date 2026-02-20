import type { Tables } from "@/lib/supabase/types";

// ── Row types ──
// Use `users` table type for User
export type User = Tables<"users">;
export type Team = Tables<"teams">;
export type Driver = Tables<"drivers">;
export type DriverNote = Tables<"driver_notes">;
export type Ticket = Tables<"tickets">;
export type TicketMessage = Tables<"ticket_messages">;
export type ScoreCategory = Tables<"score_categories">;
export type ScoreEntry = Tables<"score_entries">;
export type TelegramConnection = Tables<"telegram_connections">;
export type RawMessage = Tables<"raw_messages">;
export type Setting = Tables<"settings">;

// ── View types (non-null overrides for view columns we know are always present) ──
type NonNullableFields<T> = { [K in keyof T]: NonNullable<T[K]> };
type ViewRow<V extends keyof import("@/lib/supabase/types").Database["public"]["Views"]> =
  Tables<V>;

export type DashboardStats = ViewRow<"dashboard_stats"> & {
  unresolved_tickets?: number | null;
  avg_pickup_time_minutes?: number | null;
  avg_handling_time_minutes?: number | null;
};
export type LeaderboardEntry = ViewRow<"leaderboard_current_month">;
export type TeamLeaderboardEntry = ViewRow<"team_leaderboard_current_month">;
export type TicketsPerDay = ViewRow<"tickets_per_day"> & { date?: string | null };
export type OperatorPerformance = ViewRow<"operator_performance">;

// ── Enums ──
export type UserRole = "admin" | "operator";
export type UserStatus = "pending_approval" | "active" | "rejected" | "deactivated";
export type TicketStatus = "open" | "in_progress" | "on_hold" | "resolved" | "dismissed";
export type TicketPriority = "normal" | "urgent";
export type TicketSource = "business_dm" | "group" | "manual";
export type MessageDirection = "inbound" | "outbound";
export type MessageSenderType = "driver" | "operator" | "system";
export type MessageContentType = "text" | "photo" | "voice" | "video" | "document" | "location";
export type MessageDeliveryStatus = "pending" | "sent" | "delivered" | "failed";

// ── Joined types ──
export type TicketWithRelations = Ticket & {
  driver: Pick<Driver, "id" | "first_name" | "last_name" | "username" | "telegram_user_id"> | null;
  assigned_operator: Pick<User, "id" | "full_name" | "email"> | null;
  score_category: Pick<ScoreCategory, "id" | "name" | "points"> | null;
  held_by: Pick<User, "id" | "full_name"> | null;
};

// ── Status config for UI ──
export const ticketStatusConfig: Record<TicketStatus, { label: string; className: string }> = {
  open: { label: "Open", className: "bg-[#C07D10]/10 text-[#C07D10] border-transparent" },
  in_progress: { label: "In Progress", className: "bg-[#3B7DD8]/10 text-[#3B7DD8] border-transparent" },
  on_hold: { label: "On Hold", className: "bg-[#8B5CF6]/10 text-[#8B5CF6] border-transparent" },
  resolved: { label: "Resolved", className: "bg-[#0B8841]/10 text-[#0B8841] border-transparent" },
  dismissed: { label: "Dismissed", className: "bg-muted text-muted-foreground border-transparent" },
};

export const ticketPriorityConfig: Record<TicketPriority, { label: string; dotColor: string; textColor: string }> = {
  normal: { label: "Normal", dotColor: "bg-[#8B8F96]", textColor: "text-[#8B8F96]" },
  urgent: { label: "Urgent", dotColor: "bg-[#CD2B31]", textColor: "text-[#CD2B31]" },
};

export const userStatusConfig: Record<UserStatus, { label: string; className: string }> = {
  active: { label: "Active", className: "bg-[#0B8841]/10 text-[#0B8841]" },
  pending_approval: { label: "Pending", className: "bg-[#C07D10]/10 text-[#C07D10]" },
  rejected: { label: "Rejected", className: "bg-[#CD2B31]/10 text-[#CD2B31]" },
  deactivated: { label: "Deactivated", className: "bg-muted text-muted-foreground" },
};

// ── Helpers ──
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function getDriverFullName(driver: Pick<Driver, "first_name" | "last_name">): string {
  return [driver.first_name, driver.last_name].filter(Boolean).join(" ");
}

export function timeAgo(date: string | Date): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "1d ago";
  return `${diffDays}d ago`;
}

export function formatMinutes(minutes: number | null): string {
  if (minutes === null || minutes === undefined) return "--";
  if (minutes < 1) return "<1m";
  if (minutes < 60) return `${Math.round(minutes)}m`;
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}
