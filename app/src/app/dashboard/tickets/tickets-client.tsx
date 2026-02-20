"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MagnifyingGlass,
  Circle,
  CaretLeft,
  CaretRight,
  ChatCircleDots,
  UsersThree,
  Warning,
  Funnel,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import {
  type TicketWithRelations,
  type TicketStatus,
  type TicketPriority,
  ticketStatusConfig,
  getDriverFullName,
  timeAgo,
} from "@/lib/types";
import type { ScoreCategory, User } from "@/lib/types";
import { useRealtimeRefresh } from "@/hooks/use-realtime-refresh";

// ── Constants ──
const PAGE_SIZE = 20;

const statusTabs: { value: TicketStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "on_hold", label: "On Hold" },
  { value: "resolved", label: "Resolved" },
  { value: "dismissed", label: "Dismissed" },
];

// ── Props ──
interface TicketsClientProps {
  tickets: TicketWithRelations[];
  operators: Pick<User, "id" | "full_name">[];
  scoreCategories: Pick<ScoreCategory, "id" | "name" | "points">[];
  currentUser: {
    id: string;
    full_name: string;
    email: string;
    role: "admin" | "operator";
  };
  slaThresholds: { urgent: number; normal: number };
}

export function TicketsClient({
  tickets,
  operators,
  scoreCategories,
  currentUser,
  slaThresholds,
}: TicketsClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | "all">("all");
  const [operatorFilter, setOperatorFilter] = useState<string>("all");
  const [page, setPage] = useState(1);

  // Subscribe to realtime changes on tickets + settings tables
  useRealtimeRefresh("tickets");
  useRealtimeRefresh("settings");

  // ── Filtering ──
  const filteredTickets = useMemo(() => {
    let result = tickets;

    // For operators: show open queue + own tickets
    if (currentUser.role === "operator") {
      result = result.filter(
        (t) =>
          t.status === "open" ||
          t.status === "on_hold" ||
          t.assigned_operator_id === currentUser.id
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((t) => t.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== "all") {
      result = result.filter((t) => t.priority === priorityFilter);
    }

    // Operator filter
    if (operatorFilter !== "all") {
      if (operatorFilter === "unassigned") {
        result = result.filter((t) => !t.assigned_operator_id);
      } else {
        result = result.filter((t) => t.assigned_operator_id === operatorFilter);
      }
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.display_id.toLowerCase().includes(q) ||
          (t.ai_summary && t.ai_summary.toLowerCase().includes(q)) ||
          (t.ai_category && t.ai_category.toLowerCase().includes(q)) ||
          (t.driver && getDriverFullName(t.driver).toLowerCase().includes(q))
      );
    }

    return result;
  }, [tickets, statusFilter, priorityFilter, operatorFilter, search, currentUser]);

  // ── Pagination ──
  const totalPages = Math.max(1, Math.ceil(filteredTickets.length / PAGE_SIZE));
  const paginatedTickets = filteredTickets.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  // Reset page when filters change
  const handleStatusFilter = useCallback((value: string) => {
    setStatusFilter(value as TicketStatus | "all");
    setPage(1);
  }, []);

  const handlePriorityFilter = useCallback((value: string) => {
    setPriorityFilter(value as TicketPriority | "all");
    setPage(1);
  }, []);

  const handleOperatorFilter = useCallback((value: string) => {
    setOperatorFilter(value);
    setPage(1);
  }, []);

  // ── Status counts ──
  const statusCounts = useMemo(() => {
    const base = currentUser.role === "operator"
      ? tickets.filter(
          (t) => t.status === "open" || t.status === "on_hold" || t.assigned_operator_id === currentUser.id
        )
      : tickets;

    return {
      all: base.length,
      open: base.filter((t) => t.status === "open").length,
      in_progress: base.filter((t) => t.status === "in_progress").length,
      on_hold: base.filter((t) => t.status === "on_hold").length,
      resolved: base.filter((t) => t.status === "resolved").length,
      dismissed: base.filter((t) => t.status === "dismissed").length,
    };
  }, [tickets, currentUser]);

  // ── Top 5 most overdue tickets (for exclamation icon) ──
  const top5OverdueIds = useMemo(() => {
    const now = new Date();
    const overdue = tickets
      .filter((t) => t.status !== "resolved" && t.status !== "dismissed" && t.status !== "on_hold")
      .map((t) => {
        const created = new Date(t.created_at);
        const diffMin = (now.getTime() - created.getTime()) / 60000;
        const threshold =
          t.priority === "urgent"
            ? slaThresholds.urgent
            : slaThresholds.normal;
        return { id: t.id, overdueBy: diffMin - threshold };
      })
      .filter((t) => t.overdueBy > 0)
      .sort((a, b) => b.overdueBy - a.overdueBy)
      .slice(0, 5);

    return new Set(overdue.map((t) => t.id));
  }, [tickets, slaThresholds]);

  // ── SLA helper ──
  function getSlaDisplay(ticket: TicketWithRelations) {
    if (ticket.status === "resolved" || ticket.status === "dismissed") {
      return <span className="text-muted-foreground">--</span>;
    }
    if (ticket.status === "on_hold") {
      return <span className="text-[#8B5CF6] font-medium text-xs">Paused</span>;
    }
    const created = new Date(ticket.created_at);
    const now = new Date();
    const holdSeconds = ticket.total_hold_seconds || 0;
    const effectiveElapsedMin = Math.floor(
      (now.getTime() - created.getTime()) / 60000 - holdSeconds / 60
    );
    const threshold =
      ticket.priority === "urgent"
        ? slaThresholds.urgent
        : slaThresholds.normal;

    if (effectiveElapsedMin >= threshold) {
      const overdueMin = effectiveElapsedMin - threshold;
      return (
        <span className="text-[#CD2B31] dark:text-[#E5484D] font-medium text-xs">
          {formatDuration(overdueMin)} overdue
        </span>
      );
    }

    const remaining = threshold - effectiveElapsedMin;
    return (
      <span className="text-muted-foreground text-xs">
        {formatDuration(remaining)} left
      </span>
    );
  }

  function formatDuration(minutes: number): string {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours < 24) return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Tickets
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {currentUser.role === "admin"
            ? "Manage and monitor all support tickets."
            : "View open tickets and manage your assigned work."}
        </p>
      </div>

      {/* Status tabs */}
      <div className="flex items-center gap-1 border-b border-border">
        {statusTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleStatusFilter(tab.value)}
            className={cn(
              "relative px-3 py-2 text-sm font-medium transition-colors duration-150",
              statusFilter === tab.value
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
            <span
              className={cn(
                "ml-1.5 text-xs tabular-nums",
                statusFilter === tab.value
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {statusCounts[tab.value]}
            </span>
            {statusFilter === tab.value && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 bg-foreground" />
            )}
          </button>
        ))}
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <MagnifyingGlass
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Search by ticket #, summary, driver..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9 h-9 bg-background border-border text-sm"
          />
        </div>

        {/* Priority filter */}
        <Select value={priorityFilter} onValueChange={handlePriorityFilter}>
          <SelectTrigger className="w-[130px] h-9 text-sm bg-background border-border">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>

        {/* Operator filter (admin only) */}
        {currentUser.role === "admin" && (
          <Select value={operatorFilter} onValueChange={handleOperatorFilter}>
            <SelectTrigger className="w-[160px] h-9 text-sm bg-background border-border">
              <SelectValue placeholder="Operator" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All operators</SelectItem>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              {operators.map((op) => (
                <SelectItem key={op.id} value={op.id}>
                  {op.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Result count */}
        <span className="text-xs text-muted-foreground ml-auto tabular-nums">
          {filteredTickets.length} ticket{filteredTickets.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Tickets table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border">
              <TableHead className="w-[40px] pl-4 pr-1" />
              <TableHead className="w-[100px] text-xs font-medium text-muted-foreground">
                Ticket
              </TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground min-w-[200px]">
                Summary
              </TableHead>
              <TableHead className="w-[140px] text-xs font-medium text-muted-foreground">
                Driver
              </TableHead>
              <TableHead className="w-[140px] text-xs font-medium text-muted-foreground">
                Operator
              </TableHead>
              <TableHead className="w-[100px] text-xs font-medium text-muted-foreground">
                Created
              </TableHead>
              <TableHead className="w-[100px] text-xs font-medium text-muted-foreground pr-4">
                SLA
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTickets.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={7} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Funnel size={24} weight="light" />
                    <p className="text-sm">No tickets found</p>
                    <p className="text-xs">
                      {search || statusFilter !== "all" || priorityFilter !== "all"
                        ? "Try adjusting your filters"
                        : "Tickets will appear here when created"}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedTickets.map((ticket) => (
                <TableRow
                  key={ticket.id}
                  onClick={() =>
                    router.push(`/dashboard/tickets/${ticket.id}`)
                  }
                  className={cn(
                    "cursor-pointer border-border transition-colors duration-100",
                    top5OverdueIds.has(ticket.id) &&
                      "bg-[#CD2B31]/[0.02] dark:bg-[#E5484D]/[0.02]"
                  )}
                >
                  {/* Status indicator — top 5 most SLA-overdue get exclamation */}
                  <TableCell className="pl-4 pr-1">
                    {top5OverdueIds.has(ticket.id) ? (
                      <Warning
                        size={16}
                        weight="fill"
                        className="text-[#CD2B31] dark:text-[#E5484D]"
                      />
                    ) : (
                      <span
                        className={cn(
                          "inline-block size-[11px] rounded-full",
                          ticket.status === "open" && "bg-[#D4726A]",
                          ticket.status === "in_progress" && "bg-[#9B7EC8]",
                          ticket.status === "on_hold" && "bg-[#8B5CF6]",
                          ticket.status === "resolved" && "bg-[#4DAB9A]",
                          ticket.status === "dismissed" && "bg-[#9B9B9B]"
                        )}
                      />
                    )}
                  </TableCell>

                  {/* Ticket # */}
                  <TableCell className="font-mono text-xs font-medium text-foreground">
                    {ticket.display_id}
                  </TableCell>

                  {/* Summary */}
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm text-foreground truncate max-w-[300px]">
                        {ticket.ai_summary || "No summary"}
                      </span>
                      {ticket.ai_category && (
                        <span className="text-xs text-muted-foreground">
                          {ticket.ai_category}
                        </span>
                      )}
                    </div>
                  </TableCell>

                  {/* Driver */}
                  <TableCell>
                    <span className="text-sm text-foreground truncate block">
                      {ticket.driver
                        ? getDriverFullName(ticket.driver)
                        : "Unknown"}
                    </span>
                  </TableCell>

                  {/* Operator */}
                  <TableCell>
                    {ticket.assigned_operator ? (
                      <span className="text-sm text-foreground truncate block">
                        {ticket.assigned_operator.full_name}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        Unassigned
                      </span>
                    )}
                  </TableCell>

                  {/* Created */}
                  <TableCell className="text-xs text-muted-foreground">
                    {timeAgo(ticket.created_at)}
                  </TableCell>

                  {/* SLA */}
                  <TableCell className="pr-4">
                    {getSlaDisplay(ticket)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground tabular-nums">
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="h-8 w-8 p-0 border-border"
            >
              <CaretLeft size={14} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="h-8 w-8 p-0 border-border"
            >
              <CaretRight size={14} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
