"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  MagnifyingGlass,
  Circle,
  CaretLeft,
  CaretRight,
  ChatCircleDots,
  UsersThree,
  Warning,
  Funnel,
  Plus,
  CaretUpDown,
  Check,
  UserPlus,
  CircleNotch,
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
import type { ScoreCategory, User, Driver } from "@/lib/types";
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

// ── Types ──
type DriverOption = Pick<Driver, "id" | "first_name" | "last_name" | "username"> & {
  phone_number?: string | null;
};

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
  drivers: DriverOption[];
}

export function TicketsClient({
  tickets,
  operators,
  scoreCategories,
  currentUser,
  slaThresholds,
  drivers,
}: TicketsClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | "all">("all");
  const [operatorFilter, setOperatorFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [localDrivers, setLocalDrivers] = useState<DriverOption[]>(drivers);

  // Subscribe to realtime changes on tickets + settings tables
  useRealtimeRefresh("tickets");
  useRealtimeRefresh("settings");

  // Sync drivers prop when it changes (e.g. on router.refresh)
  useEffect(() => {
    setLocalDrivers(drivers);
  }, [drivers]);

  // Cross-tab listener for newly added drivers
  useEffect(() => {
    function handleStorage(e: StorageEvent) {
      if (e.key === "fleetrelay_new_driver" && e.newValue) {
        try {
          const newDriver = JSON.parse(e.newValue) as DriverOption;
          setLocalDrivers((prev) => {
            if (prev.some((d) => d.id === newDriver.id)) return prev;
            return [...prev, newDriver];
          });
        } catch {
          // ignore parse errors
        }
      }
    }
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

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
      <div className="flex items-start justify-between">
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
        <Button
          onClick={() => setCreateDialogOpen(true)}
          className="bg-[#0B8841] hover:bg-[#097435] dark:bg-[#2EAD5E] dark:hover:bg-[#38C06B] text-white dark:text-[#0A0B0D] text-sm font-medium"
        >
          <Plus size={16} weight="bold" className="mr-1.5" />
          New Ticket
        </Button>
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

      {/* Create Ticket Dialog */}
      <CreateTicketDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        drivers={localDrivers}
        currentUser={currentUser}
      />
    </div>
  );
}

// ── Create Ticket Dialog ──
function CreateTicketDialog({
  open,
  onOpenChange,
  drivers,
  currentUser,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  drivers: DriverOption[];
  currentUser: { id: string; full_name: string; email: string; role: "admin" | "operator" };
}) {
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState<"normal" | "urgent">("normal");
  const [assignToMe, setAssignToMe] = useState(true);
  const [creating, setCreating] = useState(false);
  const [driverPopoverOpen, setDriverPopoverOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-select newly added driver via cross-tab
  useEffect(() => {
    function handleStorage(e: StorageEvent) {
      if (e.key === "fleetrelay_new_driver" && e.newValue) {
        try {
          const newDriver = JSON.parse(e.newValue) as DriverOption;
          setSelectedDriverId(newDriver.id);
        } catch {
          // ignore
        }
      }
    }
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setDescription("");
      setSelectedDriverId(null);
      setCategory("");
      setPriority("normal");
      setAssignToMe(true);
      setCreating(false);
      setError(null);
    }
  }, [open]);

  const selectedDriver = drivers.find((d) => d.id === selectedDriverId);
  const canCreate = description.trim() && selectedDriverId && !creating;

  async function handleCreate() {
    if (!canCreate || !selectedDriverId) return;
    setCreating(true);
    setError(null);

    const supabase = createClient();
    const now = new Date().toISOString();

    // 1. Insert ticket
    const { data: newTicket, error: ticketError } = await supabase
      .from("tickets")
      .insert({
        driver_id: selectedDriverId,
        source_type: "manual" as const,
        source_name: "Manual",
        ai_summary: description.trim(),
        ai_category: category.trim() || null,
        priority: priority,
        is_urgent: priority === "urgent",
        status: assignToMe ? ("in_progress" as const) : ("open" as const),
        assigned_operator_id: assignToMe ? currentUser.id : null,
        claimed_at: assignToMe ? now : null,
      })
      .select("id")
      .single();

    if (ticketError || !newTicket) {
      setError(ticketError?.message || "Failed to create ticket");
      setCreating(false);
      return;
    }

    // 2. Insert system message
    await supabase.from("ticket_messages").insert({
      ticket_id: newTicket.id,
      direction: "inbound" as const,
      sender_type: "system" as const,
      sender_name: "System",
      content_type: "text" as const,
      content_text: `Ticket created manually by ${currentUser.full_name}`,
      is_internal_note: false,
    });

    // 3. Insert description as operator internal note
    await supabase.from("ticket_messages").insert({
      ticket_id: newTicket.id,
      direction: "outbound" as const,
      sender_type: "operator" as const,
      sender_name: currentUser.full_name,
      sender_user_id: currentUser.id,
      content_type: "text" as const,
      content_text: description.trim(),
      is_internal_note: true,
    });

    onOpenChange(false);
    router.push(`/dashboard/tickets/${newTicket.id}`);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Ticket</DialogTitle>
          <DialogDescription>
            Manually create a support ticket for a driver.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="ticket-desc" className="text-sm font-medium">
              Description <span className="text-[#CD2B31]">*</span>
            </Label>
            <Textarea
              id="ticket-desc"
              placeholder="Describe the issue..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="resize-none text-sm"
            />
          </div>

          {/* Driver combobox */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Driver <span className="text-[#CD2B31]">*</span>
            </Label>
            <Popover open={driverPopoverOpen} onOpenChange={setDriverPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={driverPopoverOpen}
                  className="w-full justify-between h-9 text-sm border-border bg-background font-normal"
                >
                  {selectedDriver ? (
                    <span className="truncate">
                      {getDriverFullName(selectedDriver)}
                      {selectedDriver.username && (
                        <span className="text-muted-foreground ml-1.5">
                          @{selectedDriver.username}
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Select a driver...</span>
                  )}
                  <CaretUpDown size={14} className="ml-2 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search drivers..." />
                  <CommandList>
                    <CommandEmpty>No driver found.</CommandEmpty>
                    <CommandGroup>
                      {drivers.map((driver) => (
                        <CommandItem
                          key={driver.id}
                          value={`${driver.first_name} ${driver.last_name || ""} ${driver.username || ""}`}
                          onSelect={() => {
                            setSelectedDriverId(driver.id);
                            setDriverPopoverOpen(false);
                          }}
                        >
                          <Check
                            size={14}
                            className={cn(
                              "mr-2 shrink-0",
                              selectedDriverId === driver.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <span className="truncate">
                            {getDriverFullName(driver)}
                          </span>
                          {driver.username && (
                            <span className="ml-1.5 text-muted-foreground text-xs">
                              @{driver.username}
                            </span>
                          )}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                    <CommandSeparator />
                    <CommandGroup>
                      <CommandItem
                        onSelect={() => {
                          window.open("/dashboard/drivers/new", "_blank");
                          setDriverPopoverOpen(false);
                        }}
                      >
                        <UserPlus size={14} className="mr-2 text-[#0B8841] dark:text-[#2EAD5E]" />
                        <span className="text-[#0B8841] dark:text-[#2EAD5E] font-medium">
                          Add New Driver
                        </span>
                      </CommandItem>
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="ticket-category" className="text-sm font-medium">
              Category
            </Label>
            <Input
              id="ticket-category"
              placeholder="e.g. Breakdown, ELD Issue, Documentation..."
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="h-9 bg-background border-border text-sm"
            />
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Priority</Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPriority("normal")}
                className={cn(
                  "h-8 text-xs border-border",
                  priority === "normal" && "border-foreground bg-foreground/5"
                )}
              >
                Normal
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPriority("urgent")}
                className={cn(
                  "h-8 text-xs border-border",
                  priority === "urgent" &&
                    "border-[#CD2B31] dark:border-[#E5484D] bg-[#CD2B31]/5 dark:bg-[#E5484D]/5 text-[#CD2B31] dark:text-[#E5484D]"
                )}
              >
                Urgent
              </Button>
            </div>
          </div>

          {/* Assign to me */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="assign-to-me"
              checked={assignToMe}
              onCheckedChange={(checked) => setAssignToMe(checked === true)}
            />
            <Label htmlFor="assign-to-me" className="text-sm font-normal cursor-pointer">
              Assign to me
            </Label>
          </div>

          {error && (
            <p className="text-sm text-[#CD2B31] dark:text-[#E5484D]">{error}</p>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="border-border"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleCreate}
            disabled={!canCreate}
            className="bg-[#0B8841] hover:bg-[#097435] dark:bg-[#2EAD5E] dark:hover:bg-[#38C06B] text-white dark:text-[#0A0B0D]"
          >
            {creating ? (
              <CircleNotch size={14} className="animate-spin mr-1" />
            ) : (
              <Plus size={14} weight="bold" className="mr-1" />
            )}
            Create Ticket
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
