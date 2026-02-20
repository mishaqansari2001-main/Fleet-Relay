"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft,
  ArrowUp,
  HandGrabbing,
  CheckCircle,
  XCircle,
  Pause,
  CaretDown,
  Warning,
  ChatCircleDots,
  UsersThree,
  PencilSimple,
  User as UserIcon,
  Clock,
  Ticket as TicketIcon,
  NoteBlank,
  CircleNotch,
  LockSimple,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import {
  type TicketStatus,
  type ScoreCategory,
  type TicketMessage,
  ticketStatusConfig,
  getDriverFullName,
  timeAgo,
} from "@/lib/types";
import { useRealtimeRefresh } from "@/hooks/use-realtime-refresh";

// ── Types ──
interface TicketDetail {
  id: string;
  display_id: string;
  status: string;
  priority: string;
  source_type: string | null;
  source_name: string | null;
  ai_summary: string | null;
  ai_category: string | null;
  ai_location?: string | null;
  ai_urgency?: number | null;
  is_urgent: boolean;
  created_at: string;
  claimed_at: string | null;
  resolved_at: string | null;
  dismissed_at: string | null;
  assigned_operator_id: string | null;
  held_at: string | null;
  held_by_id: string | null;
  hold_note: string | null;
  total_hold_seconds: number;
  driver_id: string | null;
  score_category_id: string | null;
  held_by: {
    id: string;
    full_name: string;
  } | null;
  driver: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    username: string | null;
    telegram_user_id: number | null;
    first_seen_at: string | null;
    last_seen_at: string | null;
  } | null;
  assigned_operator: {
    id: string;
    full_name: string;
    email: string;
  } | null;
  score_category: {
    id: string;
    name: string;
    points: number;
  } | null;
}

interface DriverNote {
  id: string;
  content: string;
  created_at: string;
  author_id: string;
}

interface TicketDetailClientProps {
  ticket: TicketDetail;
  messages: TicketMessage[];
  scoreCategories: Pick<ScoreCategory, "id" | "name" | "points">[];
  driverNotes: DriverNote[];
  driverTicketCount: number;
  currentUser: {
    id: string;
    full_name: string;
    email: string;
    role: "admin" | "operator";
  };
}

export function TicketDetailClient({
  ticket,
  messages,
  scoreCategories,
  driverNotes,
  driverTicketCount,
  currentUser,
}: TicketDetailClientProps) {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [replyText, setReplyText] = useState("");
  const [isInternalNote, setIsInternalNote] = useState(ticket.source_type === "manual");
  const [sending, setSending] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [releasing, setReleasing] = useState(false);
  const [showResolveDialog, setShowResolveDialog] = useState(false);
  const [showDismissDialog, setShowDismissDialog] = useState(false);
  const [showHoldDialog, setShowHoldDialog] = useState(false);
  const [holdNote, setHoldNote] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [resolving, setResolving] = useState(false);
  const [dismissing, setDismissing] = useState(false);
  const [holding, setHolding] = useState(false);

  // Subscribe to realtime for messages and ticket changes
  useRealtimeRefresh("ticket_messages");
  useRealtimeRefresh("tickets");

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const isAssignedToMe = ticket.assigned_operator_id === currentUser.id;
  const isAdmin = currentUser.role === "admin";
  const canClaim =
    (ticket.status === "open" || ticket.status === "on_hold") &&
    !ticket.assigned_operator_id;
  const canRelease = isAssignedToMe && ticket.status === "in_progress";
  const canResolve =
    (isAssignedToMe || isAdmin) &&
    (ticket.status === "in_progress" || ticket.status === "open");
  const canDismiss =
    (isAssignedToMe || isAdmin) &&
    (ticket.status === "open" || ticket.status === "in_progress");
  const canHold =
    (isAssignedToMe || isAdmin) && ticket.status === "in_progress";
  const canReply =
    (isAssignedToMe || isAdmin) &&
    ticket.status !== "resolved" &&
    ticket.status !== "dismissed" &&
    ticket.status !== "on_hold";
  const showActionsDropdown = canResolve || canHold || canDismiss;

  // ── Actions ──
  async function handleClaim() {
    setClaiming(true);
    const supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {
      assigned_operator_id: currentUser.id,
      status: "in_progress" as const,
      claimed_at: new Date().toISOString(),
    };

    if (ticket.status === "on_hold" && ticket.held_at) {
      const holdDuration = Math.floor(
        (Date.now() - new Date(ticket.held_at).getTime()) / 1000
      );
      updateData.total_hold_seconds =
        (ticket.total_hold_seconds || 0) + holdDuration;
      updateData.held_at = null;
      updateData.held_by_id = null;
      updateData.hold_note = null;
    }

    await supabase.from("tickets").update(updateData).eq("id", ticket.id);
    setClaiming(false);
    router.refresh();
  }

  async function handleRelease() {
    setReleasing(true);
    const supabase = createClient();
    await supabase
      .from("tickets")
      .update({
        assigned_operator_id: null,
        status: "open" as const,
        claimed_at: null,
      })
      .eq("id", ticket.id);
    setReleasing(false);
    router.refresh();
  }

  async function handleResolve() {
    if (!selectedCategory) return;
    setResolving(true);
    const supabase = createClient();

    const category = scoreCategories.find((c) => c.id === selectedCategory);
    if (!category) return;

    // Update ticket
    await supabase
      .from("tickets")
      .update({
        status: "resolved" as const,
        resolved_at: new Date().toISOString(),
        score_category_id: selectedCategory,
      })
      .eq("id", ticket.id);

    // Create score entry
    await supabase.from("score_entries").insert({
      operator_id: ticket.assigned_operator_id || currentUser.id,
      score_category_id: selectedCategory,
      ticket_id: ticket.id,
      points: category.points,
      scored_date: new Date().toISOString().split("T")[0],
    });

    setResolving(false);
    setShowResolveDialog(false);
    router.refresh();
  }

  async function handleDismiss() {
    setDismissing(true);
    const supabase = createClient();
    await supabase
      .from("tickets")
      .update({
        status: "dismissed" as const,
        dismissed_at: new Date().toISOString(),
      })
      .eq("id", ticket.id);
    setDismissing(false);
    setShowDismissDialog(false);
    router.refresh();
  }

  async function handleHold() {
    if (!holdNote.trim()) return;
    setHolding(true);
    const supabase = createClient();
    await supabase
      .from("tickets")
      .update({
        status: "on_hold" as const,
        assigned_operator_id: null,
        claimed_at: null,
        held_at: new Date().toISOString(),
        held_by_id: currentUser.id,
        hold_note: holdNote.trim(),
      })
      .eq("id", ticket.id);
    setHolding(false);
    setShowHoldDialog(false);
    setHoldNote("");
    router.refresh();
  }

  async function handleSendMessage() {
    if (!replyText.trim()) return;
    setSending(true);
    const supabase = createClient();

    await supabase.from("ticket_messages").insert({
      ticket_id: ticket.id,
      direction: "outbound" as const,
      sender_type: "operator" as const,
      sender_name: currentUser.full_name,
      sender_user_id: currentUser.id,
      content_type: "text" as const,
      content_text: replyText.trim(),
      is_internal_note: isInternalNote,
    });

    setReplyText("");
    setIsInternalNote(false);
    setSending(false);
    router.refresh();
  }

  function formatTimestamp(date: string) {
    const d = new Date(date);
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Header */}
      <div className="shrink-0 pb-4 space-y-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard/tickets")}
            className="h-8 w-8 p-0 text-foreground hover:bg-muted"
          >
            <ArrowLeft size={18} />
          </Button>

          <div className="flex items-center gap-3 flex-1">
            <span className="font-mono text-sm font-semibold text-foreground">
              {ticket.display_id}
            </span>
            <Badge
              variant="secondary"
              className={cn(
                "text-[11px] font-medium px-2 py-0.5",
                ticketStatusConfig[ticket.status as TicketStatus]?.className
              )}
            >
              {ticketStatusConfig[ticket.status as TicketStatus]?.label}
            </Badge>
            {ticket.priority === "urgent" && (
              <Badge
                variant="secondary"
                className="text-[11px] font-medium px-2 py-0.5 bg-[#CD2B31]/10 text-[#CD2B31] dark:bg-[#E5484D]/10 dark:text-[#E5484D] border-transparent"
              >
                Urgent
              </Badge>
            )}
          </div>

          {/* Score tag (when resolved) */}
          {ticket.score_category && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0B8841] dark:bg-[#2EAD5E] text-white dark:text-[#0A0B0D] text-xs font-semibold px-3 py-1.5">
              {ticket.score_category.name}
              <span className="font-bold">+{ticket.score_category.points}</span>
            </span>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {canClaim && (
              <Button
                size="sm"
                onClick={handleClaim}
                disabled={claiming}
                className="h-8 bg-foreground hover:bg-foreground/90 text-background text-xs font-medium"
              >
                {claiming ? (
                  <CircleNotch size={14} className="animate-spin mr-1" />
                ) : (
                  <HandGrabbing size={14} weight="bold" className="mr-1" />
                )}
                Claim
              </Button>
            )}
            {canRelease && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRelease}
                disabled={releasing}
                className="h-8 text-xs border-border"
              >
                {releasing ? (
                  <CircleNotch size={14} className="animate-spin mr-1" />
                ) : null}
                Release
              </Button>
            )}
            {showActionsDropdown && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    className="h-8 bg-[#0B8841] hover:bg-[#097435] dark:bg-[#2EAD5E] dark:hover:bg-[#38C06B] text-white dark:text-[#0A0B0D] text-xs font-medium"
                  >
                    Actions
                    <CaretDown size={12} weight="bold" className="ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  {canResolve && (
                    <DropdownMenuItem onClick={() => setShowResolveDialog(true)}>
                      <CheckCircle size={16} className="text-[#0B8841] dark:text-[#2EAD5E]" />
                      Resolve
                    </DropdownMenuItem>
                  )}
                  {canHold && (
                    <DropdownMenuItem onClick={() => setShowHoldDialog(true)}>
                      <Pause size={16} className="text-[#8B5CF6]" />
                      Put On Hold
                    </DropdownMenuItem>
                  )}
                  {canDismiss && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => setShowDismissDialog(true)}
                      >
                        <XCircle size={16} />
                        Dismiss
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Summary & meta */}
        <div className="flex items-start gap-6 pl-11">
          <div className="flex-1 space-y-1">
            <p className="text-sm text-foreground leading-relaxed">
              {ticket.ai_summary || "No summary available"}
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              {ticket.ai_category && <span>{ticket.ai_category}</span>}
              {ticket.ai_location && <span>{ticket.ai_location}</span>}
              <span className="flex items-center gap-1">
                {ticket.source_type === "manual" ? (
                  <PencilSimple size={12} />
                ) : ticket.source_type === "business_dm" ? (
                  <ChatCircleDots size={12} />
                ) : (
                  <UsersThree size={12} />
                )}
                {ticket.source_name ||
                  (ticket.source_type === "manual"
                    ? "Manual"
                    : ticket.source_type === "business_dm"
                      ? "DM"
                      : "Group")}
              </span>
              <span>{formatTimestamp(ticket.created_at)}</span>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Main content area: messages + sidebar */}
      <div className="flex flex-1 min-h-0 pt-4">
        {/* Conversation thread */}
        <div className="flex flex-1 flex-col min-w-0 pr-6">
          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 pr-2">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} currentUserId={currentUser.id} />
            ))}
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <ChatCircleDots size={32} weight="light" />
                <p className="mt-2 text-sm">No messages yet</p>
              </div>
            )}
          </div>

          {/* Reply input — Notion-style */}
          {canReply && (
            <div className="shrink-0 pt-4 pb-2">
              {ticket.source_type === "manual" && (
                <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                  <PencilSimple size={12} />
                  This is a manually created ticket. Messages are saved as internal notes.
                </p>
              )}
              <div
                className={cn(
                  "rounded-xl border bg-card transition-all duration-150",
                  isInternalNote
                    ? "border-[#C07D10]/30 dark:border-[#F5D90A]/20 bg-[#C07D10]/[0.02] dark:bg-[#F5D90A]/[0.02] focus-within:border-[#C07D10]/60 dark:focus-within:border-[#F5D90A]/40"
                    : "border-border focus-within:border-foreground/70 focus-within:shadow-[0_0_0_1px_hsl(var(--foreground)/0.15)]"
                )}
              >
                <Textarea
                  placeholder={
                    isInternalNote
                      ? "Write an internal note..."
                      : "Type a reply..."
                  }
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                      handleSendMessage();
                    }
                  }}
                  rows={2}
                  className="resize-none border-0 bg-transparent text-sm px-4 pt-3 pb-1 focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[44px] placeholder:text-muted-foreground/50"
                />
                {/* Toolbar */}
                <div className="flex items-center justify-between px-3 pb-2.5 pt-0.5">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={isInternalNote}
                      onCheckedChange={setIsInternalNote}
                      className="h-4 w-7 data-[state=checked]:bg-[#C07D10] dark:data-[state=checked]:bg-[#F5D90A]"
                    />
                    <label className="text-[11px] font-medium text-foreground flex items-center gap-1 select-none">
                      <LockSimple size={11} />
                      Internal note
                    </label>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-[11px] font-medium text-foreground/70 select-none">
                      {typeof navigator !== "undefined" && navigator.platform?.includes("Mac") ? "Cmd" : "Ctrl"}+Enter
                    </span>
                    <button
                      onClick={handleSendMessage}
                      disabled={sending || !replyText.trim()}
                      className={cn(
                        "flex size-7 items-center justify-center rounded-full transition-all duration-150",
                        replyText.trim()
                          ? "bg-foreground text-background cursor-pointer hover:opacity-80"
                          : "bg-muted text-muted-foreground cursor-not-allowed"
                      )}
                    >
                      {sending ? (
                        <CircleNotch size={14} className="animate-spin" />
                      ) : (
                        <ArrowUp size={14} weight="bold" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px bg-border shrink-0" />

        {/* Sidebar */}
        <div className="w-[260px] shrink-0 space-y-5 overflow-y-auto pb-4 pl-6">
          {/* Operator */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Operator
            </h3>
            {ticket.assigned_operator ? (
              <div className="flex items-center gap-2.5">
                <div className="flex size-7 items-center justify-center rounded-full bg-foreground/5 text-foreground text-xs font-semibold">
                  {ticket.assigned_operator.full_name
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </div>
                <span className="text-sm font-medium text-foreground">
                  {ticket.assigned_operator.full_name}
                </span>
              </div>
            ) : (
              <span className="text-sm text-foreground/40 italic">Unassigned</span>
            )}
          </div>

          {/* Timing */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Timeline
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-foreground/50">Created</span>
                <span className="text-foreground font-medium">{timeAgo(ticket.created_at)}</span>
              </div>
              {ticket.claimed_at && (
                <div className="flex items-center justify-between">
                  <span className="text-foreground/50">Claimed</span>
                  <span className="text-foreground font-medium">{timeAgo(ticket.claimed_at)}</span>
                </div>
              )}
              {ticket.resolved_at && (
                <div className="flex items-center justify-between">
                  <span className="text-foreground/50">Resolved</span>
                  <span className="text-foreground font-medium">{timeAgo(ticket.resolved_at)}</span>
                </div>
              )}
              {ticket.dismissed_at && (
                <div className="flex items-center justify-between">
                  <span className="text-foreground/50">Dismissed</span>
                  <span className="text-foreground font-medium">{timeAgo(ticket.dismissed_at)}</span>
                </div>
              )}
              {ticket.total_hold_seconds > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-foreground/50">Total hold time</span>
                  <span className="text-[#8B5CF6] font-medium">
                    {ticket.total_hold_seconds < 60
                      ? `${ticket.total_hold_seconds}s`
                      : ticket.total_hold_seconds < 3600
                        ? `${Math.floor(ticket.total_hold_seconds / 60)}m`
                        : `${Math.floor(ticket.total_hold_seconds / 3600)}h ${Math.floor((ticket.total_hold_seconds % 3600) / 60)}m`}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Hold info */}
          {ticket.status === "on_hold" && (
            <div className="space-y-2.5">
              <h3 className="text-xs font-semibold text-[#8B5CF6] uppercase tracking-wider">
                On Hold
              </h3>
              {ticket.held_by && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-foreground/50">Held by</span>
                  <span className="text-foreground font-medium">{ticket.held_by.full_name}</span>
                </div>
              )}
              {ticket.held_at && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-foreground/50">Since</span>
                  <span className="text-foreground font-medium">{timeAgo(ticket.held_at)}</span>
                </div>
              )}
              {ticket.hold_note && (
                <div className="rounded-lg bg-[#8B5CF6]/5 border border-[#8B5CF6]/15 px-3 py-2.5 text-xs">
                  <p className="text-foreground leading-relaxed">{ticket.hold_note}</p>
                </div>
              )}
            </div>
          )}

          <Separator />

          {/* Driver info */}
          {ticket.driver && (
            <div className="space-y-2.5">
              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Driver
              </h3>
              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-8 items-center justify-center rounded-full bg-foreground/5 text-foreground">
                    <UserIcon size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {getDriverFullName({ first_name: ticket.driver.first_name ?? "", last_name: ticket.driver.last_name })}
                    </p>
                    {ticket.driver.username && (
                      <p className="text-xs text-foreground/40">
                        @{ticket.driver.username}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-foreground/50 flex items-center gap-1">
                      <TicketIcon size={12} />
                      Total tickets
                    </span>
                    <span className="text-foreground font-medium">{driverTicketCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-foreground/50 flex items-center gap-1">
                      <Clock size={12} />
                      First seen
                    </span>
                    <span className="text-foreground font-medium">
                      {ticket.driver.first_seen_at ? timeAgo(ticket.driver.first_seen_at) : "--"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-foreground/50 flex items-center gap-1">
                      <Clock size={12} />
                      Last seen
                    </span>
                    <span className="text-foreground font-medium">
                      {ticket.driver.last_seen_at ? timeAgo(ticket.driver.last_seen_at) : "--"}
                    </span>
                  </div>
                </div>

                <Link
                  href={`/dashboard/drivers?id=${ticket.driver.id}`}
                  className="text-xs text-foreground font-medium hover:underline"
                >
                  View full profile
                </Link>
              </div>
            </div>
          )}

          {/* Driver notes */}
          {driverNotes.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2.5">
                <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1">
                  <NoteBlank size={12} />
                  Recent Notes
                </h3>
                <div className="space-y-2">
                  {driverNotes.slice(0, 3).map((note) => (
                    <div
                      key={note.id}
                      className="rounded-lg bg-foreground/[0.03] border border-border/50 px-3 py-2.5 text-xs"
                    >
                      <p className="text-foreground leading-relaxed">
                        {note.content}
                      </p>
                      <p className="mt-1.5 text-foreground/40">
                        {timeAgo(note.created_at)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Resolve dialog */}
      <Dialog open={showResolveDialog} onOpenChange={setShowResolveDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Resolve Ticket</DialogTitle>
            <DialogDescription>
              Select a score category for this ticket.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            {scoreCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  "w-full flex items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors duration-100 cursor-pointer",
                  selectedCategory === cat.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-[#C0C6CE] dark:hover:border-[#32353C]"
                )}
              >
                <span className="text-sm font-medium text-foreground">
                  {cat.name}
                </span>
                <span
                  className={cn(
                    "text-sm font-semibold tabular-nums",
                    selectedCategory === cat.id
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  +{cat.points}
                </span>
              </button>
            ))}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowResolveDialog(false)}
              className="border-border"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleResolve}
              disabled={!selectedCategory || resolving}
              className="bg-[#0B8841] hover:bg-[#097435] dark:bg-[#2EAD5E] dark:hover:bg-[#38C06B] text-white dark:text-[#0A0B0D]"
            >
              {resolving ? (
                <CircleNotch size={14} className="animate-spin mr-1" />
              ) : (
                <CheckCircle size={14} weight="bold" className="mr-1" />
              )}
              Resolve
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Hold dialog */}
      <Dialog open={showHoldDialog} onOpenChange={(open) => { setShowHoldDialog(open); if (!open) setHoldNote(""); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Put Ticket On Hold</DialogTitle>
            <DialogDescription>
              This will unassign the ticket and place it in the On Hold queue. Any operator can later claim it.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Textarea
              placeholder="Why is this ticket being put on hold?"
              value={holdNote}
              onChange={(e) => setHoldNote(e.target.value)}
              rows={3}
              className="resize-none text-sm"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setShowHoldDialog(false); setHoldNote(""); }}
              className="border-border"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleHold}
              disabled={!holdNote.trim() || holding}
              className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white"
            >
              {holding ? (
                <CircleNotch size={14} className="animate-spin mr-1" />
              ) : (
                <Pause size={14} weight="bold" className="mr-1" />
              )}
              Put On Hold
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dismiss confirmation */}
      <AlertDialog open={showDismissDialog} onOpenChange={setShowDismissDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Dismiss Ticket</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to dismiss{" "}
              <span className="font-mono font-medium text-foreground">
                {ticket.display_id}
              </span>
              ? This marks the ticket as a false positive. No points will be
              awarded.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDismiss}
              disabled={dismissing}
              className="bg-[#CD2B31] hover:bg-[#CD2B31]/90 dark:bg-[#E5484D] dark:hover:bg-[#E5484D]/90 text-white"
            >
              {dismissing ? (
                <CircleNotch size={14} className="animate-spin mr-1" />
              ) : null}
              Dismiss Ticket
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ── Message Bubble Component ──
function MessageBubble({
  message,
  currentUserId,
}: {
  message: TicketMessage;
  currentUserId: string;
}) {
  const isOutbound = message.direction === "outbound";
  const isInternalNote = message.is_internal_note;
  const isSystem = message.sender_type === "system";

  if (isSystem) {
    return (
      <div className="flex justify-center py-1">
        <span className="text-xs text-muted-foreground bg-muted/50 rounded-full px-3 py-1">
          {message.content_text}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex gap-2 max-w-[85%]",
        isOutbound ? "ml-auto flex-row-reverse" : "mr-auto"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-medium",
          isOutbound
            ? "bg-foreground text-background"
            : "bg-muted text-muted-foreground"
        )}
      >
        {message.sender_name
          .split(" ")
          .map((w) => w[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)}
      </div>

      {/* Content */}
      <div
        className={cn(
          "rounded-lg px-3 py-2 text-sm",
          isInternalNote
            ? "bg-[#C07D10]/5 dark:bg-[#F5D90A]/5 border border-[#C07D10]/15 dark:border-[#F5D90A]/10"
            : isOutbound
              ? "bg-foreground/[0.04] border border-foreground/[0.08]"
              : "bg-muted/80 border border-border"
        )}
      >
        <div className="flex items-center gap-2 mb-0.5">
          <span
            className={cn(
              "text-xs font-medium",
              isOutbound ? "text-foreground" : "text-foreground"
            )}
          >
            {message.sender_name}
          </span>
          {isInternalNote && (
            <span className="text-[10px] font-medium text-[#C07D10] dark:text-[#F5D90A] flex items-center gap-0.5">
              <LockSimple size={10} />
              Internal
            </span>
          )}
        </div>
        <p className="text-foreground leading-relaxed whitespace-pre-wrap">
          {message.content_text}
        </p>
        <span className="text-[10px] text-muted-foreground mt-1 block">
          {message.created_at
            ? new Date(message.created_at).toLocaleString("en-US", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              })
            : ""}
        </span>
      </div>
    </div>
  );
}
