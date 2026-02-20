"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  MagnifyingGlass,
  NoteBlank,
  CaretLeft,
  CaretRight,
  User as UserIcon,
  Ticket as TicketIcon,
  Clock,
  ArrowUp,
  Trash,
  CircleNotch,
  Funnel,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { type Driver, getDriverFullName, timeAgo } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

// ── Constants ──
const PAGE_SIZE = 20;

// ── Types ──
type EnrichedDriver = Driver & {
  ticket_count: number;
  open_ticket_count: number;
  note_count: number;
};

interface DriverNote {
  id: string;
  content: string;
  created_at: string | null;
  author_id: string;
  author: { full_name: string } | null;
}

interface DriverTicket {
  id: string;
  display_id: string;
  status: string;
  priority: string;
  ai_summary: string | null;
  ai_category: string | null;
  created_at: string;
  resolved_at: string | null;
  assigned_operator: { full_name: string } | null;
  score_category: { name: string; points: number } | null;
}

interface DriversClientProps {
  drivers: EnrichedDriver[];
  currentUser: {
    id: string;
    full_name: string;
    role: "admin" | "operator";
  };
}

export function DriversClient({ drivers, currentUser }: DriversClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedDriver, setSelectedDriver] = useState<EnrichedDriver | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [driverNotes, setDriverNotes] = useState<DriverNote[]>([]);
  const [driverTickets, setDriverTickets] = useState<DriverTicket[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  // ── Filtering ──
  const filteredDrivers = useMemo(() => {
    if (!search.trim()) return drivers;
    const q = search.toLowerCase().trim();
    return drivers.filter(
      (d) =>
        getDriverFullName(d).toLowerCase().includes(q) ||
        (d.username && d.username.toLowerCase().includes(q))
    );
  }, [drivers, search]);

  // ── Pagination ──
  const totalPages = Math.max(1, Math.ceil(filteredDrivers.length / PAGE_SIZE));
  const paginatedDrivers = filteredDrivers.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  // ── Open driver detail sheet ──
  async function openDriverDetail(driver: EnrichedDriver) {
    setSelectedDriver(driver);
    setSheetOpen(true);
    setLoadingDetail(true);
    setNewNote("");

    const supabase = createClient();

    // Fetch notes with author names
    const { data: notes } = await supabase
      .from("driver_notes")
      .select("id, content, created_at, author_id, author:users!driver_notes_author_id_fkey(full_name)")
      .eq("driver_id", driver.id)
      .order("created_at", { ascending: false });

    // Fetch tickets for this driver
    const { data: tickets } = await supabase
      .from("tickets")
      .select(
        `id, display_id, status, priority, ai_summary, ai_category, created_at, resolved_at,
        assigned_operator:users!tickets_assigned_operator_id_fkey(full_name),
        score_category:score_categories!tickets_score_category_id_fkey(name, points)`
      )
      .eq("driver_id", driver.id)
      .order("created_at", { ascending: false })
      .limit(20);

    setDriverNotes((notes as DriverNote[]) ?? []);
    setDriverTickets((tickets as DriverTicket[]) ?? []);
    setLoadingDetail(false);
  }

  // ── Add note ──
  async function handleAddNote() {
    if (!newNote.trim() || !selectedDriver) return;
    setSavingNote(true);

    const supabase = createClient();
    const { data } = await supabase
      .from("driver_notes")
      .insert({
        driver_id: selectedDriver.id,
        author_id: currentUser.id,
        content: newNote.trim(),
      })
      .select("id, content, created_at, author_id")
      .single();

    if (data) {
      setDriverNotes((prev) => [
        { ...data, author: { full_name: currentUser.full_name } },
        ...prev,
      ]);
      setNewNote("");
    }
    setSavingNote(false);
  }

  // ── Delete note ──
  async function handleDeleteNote(noteId: string, authorId: string) {
    if (currentUser.role !== "admin" && authorId !== currentUser.id) return;

    const supabase = createClient();
    await supabase.from("driver_notes").delete().eq("id", noteId);
    setDriverNotes((prev) => prev.filter((n) => n.id !== noteId));
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Drivers
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          View driver profiles, ticket history, and notes.
        </p>
      </div>

      {/* Search & count */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <MagnifyingGlass
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Search by name or username..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9 h-9 bg-background border-border text-sm"
          />
        </div>
        <span className="text-xs text-muted-foreground ml-auto tabular-nums">
          {filteredDrivers.length} driver{filteredDrivers.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Drivers table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border">
              <TableHead className="pl-4 text-xs font-medium text-muted-foreground">
                Driver
              </TableHead>
              <TableHead className="w-[120px] text-xs font-medium text-muted-foreground">
                Username
              </TableHead>
              <TableHead className="w-[100px] text-xs font-medium text-muted-foreground text-center">
                Total Tickets
              </TableHead>
              <TableHead className="w-[100px] text-xs font-medium text-muted-foreground text-center">
                Open
              </TableHead>
              <TableHead className="w-[110px] text-xs font-medium text-muted-foreground">
                Last Active
              </TableHead>
              <TableHead className="w-[60px] text-xs font-medium text-muted-foreground text-center">
                Notes
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedDrivers.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={6} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Funnel size={24} weight="light" />
                    <p className="text-sm">No drivers found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedDrivers.map((driver) => (
                <TableRow
                  key={driver.id}
                  onClick={() => openDriverDetail(driver)}
                  className="cursor-pointer border-border transition-colors duration-100"
                >
                  <TableCell className="pl-4">
                    <div className="flex items-center gap-2.5">
                      <div className="flex size-8 items-center justify-center rounded-full bg-foreground/5 text-foreground shrink-0">
                        <UserIcon size={16} />
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        {getDriverFullName(driver)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {driver.username ? `@${driver.username}` : "--"}
                  </TableCell>
                  <TableCell className="text-sm text-foreground text-center tabular-nums">
                    {driver.ticket_count}
                  </TableCell>
                  <TableCell className="text-center">
                    {driver.open_ticket_count > 0 ? (
                      <span className="text-sm font-medium text-[#C07D10] dark:text-[#F5D90A] tabular-nums">
                        {driver.open_ticket_count}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">0</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {driver.last_seen_at ? timeAgo(driver.last_seen_at) : "--"}
                  </TableCell>
                  <TableCell className="text-center">
                    {driver.note_count > 0 ? (
                      <NoteBlank
                        size={16}
                        weight="fill"
                        className="text-primary inline-block"
                      />
                    ) : (
                      <span className="text-muted-foreground">--</span>
                    )}
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

      {/* Driver detail sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-[500px] sm:max-w-[500px] overflow-y-auto p-0" aria-describedby="driver-sheet-desc">
          {selectedDriver && (
            <div className="flex flex-col">
              {/* Header */}
              <div className="px-6 pt-6 pb-5">
                <SheetHeader className="space-y-0">
                  <div className="flex items-center gap-3.5">
                    <div className="flex size-11 items-center justify-center rounded-full bg-foreground text-background text-sm font-semibold">
                      {getDriverFullName(selectedDriver)
                        .split(" ")
                        .map((w) => w[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </div>
                    <div>
                      <SheetTitle className="text-foreground text-lg">
                        {getDriverFullName(selectedDriver)}
                      </SheetTitle>
                      <p id="driver-sheet-desc" className="text-sm text-foreground/50">
                        {selectedDriver.username ? `@${selectedDriver.username}` : "Driver profile"}
                      </p>
                    </div>
                  </div>
                </SheetHeader>
              </div>

              <Separator />

              {/* Stats row */}
              <div className="px-6 py-5">
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-lg border border-border bg-foreground/[0.02] px-4 py-3 transition-all duration-200 hover:border-foreground/80 hover:shadow-sm">
                    <p className="text-xl font-semibold text-foreground tabular-nums">
                      {selectedDriver.ticket_count}
                    </p>
                    <p className="text-[11px] text-foreground font-medium mt-0.5">Total Tickets</p>
                  </div>
                  <div className="rounded-lg border border-border bg-foreground/[0.02] px-4 py-3 transition-all duration-200 hover:border-foreground/80 hover:shadow-sm">
                    <p className={cn(
                      "text-xl font-semibold tabular-nums",
                      selectedDriver.open_ticket_count > 0
                        ? "text-[#C07D10] dark:text-[#F5D90A]"
                        : "text-foreground"
                    )}>
                      {selectedDriver.open_ticket_count}
                    </p>
                    <p className="text-[11px] text-foreground font-medium mt-0.5">Open</p>
                  </div>
                  <div className="rounded-lg border border-border bg-foreground/[0.02] px-4 py-3 transition-all duration-200 hover:border-foreground/80 hover:shadow-sm">
                    <p className="text-xl font-semibold text-foreground tabular-nums">
                      {selectedDriver.note_count}
                    </p>
                    <p className="text-[11px] text-foreground font-medium mt-0.5">Notes</p>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="px-6 pb-5">
                <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">
                  Details
                </h3>
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-foreground/50">First seen</span>
                    <span className="text-foreground font-medium">
                      {selectedDriver.first_seen_at
                        ? new Date(selectedDriver.first_seen_at).toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric", year: "numeric" }
                          )
                        : "--"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground/50">Last active</span>
                    <span className="text-foreground font-medium">
                      {selectedDriver.last_seen_at ? timeAgo(selectedDriver.last_seen_at) : "--"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground/50">Telegram ID</span>
                    <span className="text-foreground font-mono text-xs font-medium">
                      {selectedDriver.telegram_user_id}
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Notes section */}
              <div className="px-6 py-5 space-y-3">
                <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  Notes
                </h3>

                {/* Add note */}
                <div className="relative rounded-xl border border-foreground/15 focus-within:border-foreground/40 bg-card overflow-hidden transition-colors duration-150">
                  <Textarea
                    placeholder="Add a note about this driver..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    rows={2}
                    className="resize-none border-0 bg-transparent text-sm px-4 pt-3 pb-1 pr-14 focus-visible:ring-0 focus-visible:ring-offset-0"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                        handleAddNote();
                      }
                    }}
                  />
                  <button
                    onClick={handleAddNote}
                    disabled={savingNote || !newNote.trim()}
                    className={cn(
                      "absolute right-3 bottom-3 flex size-7 items-center justify-center rounded-full transition-all duration-150",
                      newNote.trim()
                        ? "bg-foreground text-background cursor-pointer hover:opacity-80"
                        : "bg-muted text-muted-foreground cursor-not-allowed"
                    )}
                  >
                    {savingNote ? (
                      <CircleNotch size={14} className="animate-spin" />
                    ) : (
                      <ArrowUp size={14} weight="bold" />
                    )}
                  </button>
                </div>

                {/* Notes list */}
                {loadingDetail ? (
                  <div className="flex justify-center py-6">
                    <CircleNotch
                      size={20}
                      className="animate-spin text-muted-foreground"
                    />
                  </div>
                ) : driverNotes.length === 0 ? (
                  <p className="text-sm text-foreground/40 py-3">
                    No notes yet. Add one above.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {driverNotes.map((note) => (
                      <div
                        key={note.id}
                        className="group rounded-lg bg-foreground/[0.03] border border-border/50 px-3.5 py-3"
                      >
                        <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                          {note.content}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-foreground/40">
                            {note.author?.full_name ?? "Unknown"} &middot;{" "}
                            {note.created_at ? timeAgo(note.created_at) : ""}
                          </span>
                          {(currentUser.role === "admin" ||
                            note.author_id === currentUser.id) && (
                            <button
                              onClick={() =>
                                handleDeleteNote(note.id, note.author_id)
                              }
                              className="flex items-center gap-1 text-xs text-foreground/30 hover:text-[#CD2B31] dark:hover:text-[#E5484D] opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash size={12} />
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              {/* Ticket history */}
              <div className="px-6 py-5 space-y-3">
                <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  Ticket History
                </h3>

                {loadingDetail ? (
                  <div className="flex justify-center py-6">
                    <CircleNotch
                      size={20}
                      className="animate-spin text-muted-foreground"
                    />
                  </div>
                ) : driverTickets.length === 0 ? (
                  <p className="text-sm text-foreground/40 py-3">
                    No tickets yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {driverTickets.map((ticket) => (
                      <button
                        key={ticket.id}
                        onClick={() => {
                          setSheetOpen(false);
                          router.push(`/dashboard/tickets/${ticket.id}`);
                        }}
                        className="w-full text-left rounded-lg border border-border px-4 py-3 hover:bg-foreground/[0.02] transition-colors duration-100 cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-semibold text-foreground">
                            {ticket.display_id}
                          </span>
                          <StatusDot status={ticket.status} />
                        </div>
                        <p className="text-sm text-foreground mt-1 truncate">
                          {ticket.ai_summary || "No summary"}
                        </p>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-foreground/40">
                          {ticket.ai_category && (
                            <span>{ticket.ai_category}</span>
                          )}
                          <span>{timeAgo(ticket.created_at)}</span>
                          {ticket.score_category && (
                            <span className="text-[#0B8841] dark:text-[#2EAD5E] font-medium">
                              +{ticket.score_category.points}
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    open: "bg-[#C07D10]",
    in_progress: "bg-[#3B7DD8]",
    on_hold: "bg-[#8B5CF6]",
    resolved: "bg-[#0B8841]",
    dismissed: "bg-muted-foreground",
  };

  return (
    <span
      className={cn(
        "inline-block size-2 rounded-full",
        colors[status] ?? "bg-muted-foreground"
      )}
    />
  );
}
