"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Trophy,
  Medal,
  User as UserIcon,
  UsersThree,
  Clock,
  Timer,
  Ticket as TicketIcon,
  ChartLineUp,
  CircleNotch,
  ShieldCheck,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import type {
  LeaderboardEntry,
  TeamLeaderboardEntry,
  OperatorPerformance,
} from "@/lib/types";
import { formatMinutes, timeAgo, getInitials } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { useRealtimeRefresh } from "@/hooks/use-realtime-refresh";

type Tab = "individual" | "team";

// ── Sheet data types ──
interface OperatorScorePerDay {
  scored_date: string;
  total_points: number;
}

interface OperatorResolvedTicket {
  id: string;
  display_id: string;
  ai_summary: string | null;
  ai_category: string | null;
  resolved_at: string | null;
  score_category: { name: string; points: number } | null;
}

interface OperatorSheetData {
  scoresPerDay: OperatorScorePerDay[];
  resolvedTickets: OperatorResolvedTicket[];
  performance: OperatorPerformance | null;
}

interface SlaComplianceEntry {
  compliant: number;
  total: number;
  percentage: number;
}

interface LeaderboardClientProps {
  individualLeaderboard: LeaderboardEntry[];
  teamLeaderboard: TeamLeaderboardEntry[];
  currentUser: {
    id: string;
    full_name: string;
    role: "admin" | "operator";
  };
  slaCompliance: Record<string, SlaComplianceEntry>;
  complianceTarget: number;
}

const monthName = new Date().toLocaleString("en-US", {
  month: "long",
  year: "numeric",
});

const scoreChartConfig = {
  total_points: { label: "Score", color: "#8B7FD7" },
} satisfies ChartConfig;

export function LeaderboardClient({
  individualLeaderboard,
  teamLeaderboard,
  currentUser,
  slaCompliance,
  complianceTarget,
}: LeaderboardClientProps) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("individual");
  const isAdmin = currentUser.role === "admin";

  // Sheet state
  const [selectedOperator, setSelectedOperator] =
    useState<LeaderboardEntry | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetData, setSheetData] = useState<OperatorSheetData | null>(null);
  const [loadingSheet, setLoadingSheet] = useState(false);

  useRealtimeRefresh("score_entries");
  useRealtimeRefresh("settings");

  // Find max values for progress bars
  const maxIndividualScore = Math.max(
    ...(individualLeaderboard.map((e) => e.total_score ?? 0)),
    1
  );
  const maxTeamScore = Math.max(
    ...(teamLeaderboard.map((e) => e.total_score ?? 0)),
    1
  );

  // ── Open operator analytics sheet ──
  async function openOperatorSheet(entry: LeaderboardEntry) {
    setSelectedOperator(entry);
    setSheetOpen(true);
    setLoadingSheet(true);
    setSheetData(null);

    const supabase = createClient();
    const operatorId = entry.operator_id!;

    // 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sinceDate = thirtyDaysAgo.toISOString().split("T")[0];

    // Fetch all 3 queries in parallel
    const [scoresRes, ticketsRes, perfRes] = await Promise.all([
      // 1. Score entries grouped by day (last 30 days)
      supabase
        .from("score_entries")
        .select("scored_date, points")
        .eq("operator_id", operatorId)
        .gte("scored_date", sinceDate)
        .order("scored_date", { ascending: true }),

      // 2. Resolved tickets with score category (last 20)
      supabase
        .from("tickets")
        .select(
          `id, display_id, ai_summary, ai_category, resolved_at,
          score_category:score_categories!tickets_score_category_id_fkey(name, points)`
        )
        .eq("assigned_operator_id", operatorId)
        .eq("status", "resolved")
        .order("resolved_at", { ascending: false })
        .limit(20),

      // 3. Operator performance view
      supabase
        .from("operator_performance")
        .select("*")
        .eq("operator_id", operatorId)
        .single(),
    ]);

    // Group score entries by day
    const scoresByDay = new Map<string, number>();
    for (const row of scoresRes.data ?? []) {
      const date = row.scored_date ?? "";
      if (!date) continue;
      scoresByDay.set(date, (scoresByDay.get(date) ?? 0) + row.points);
    }
    const scoresPerDay: OperatorScorePerDay[] = Array.from(
      scoresByDay.entries()
    ).map(([scored_date, total_points]) => ({ scored_date, total_points }));

    setSheetData({
      scoresPerDay,
      resolvedTickets: (ticketsRes.data as OperatorResolvedTicket[]) ?? [],
      performance: perfRes.data ?? null,
    });
    setLoadingSheet(false);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Leaderboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {monthName} rankings
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border">
        <button
          onClick={() => setTab("individual")}
          className={cn(
            "relative flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors duration-150",
            tab === "individual"
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <UserIcon size={16} />
          Individual
          {tab === "individual" && (
            <span className="absolute inset-x-0 -bottom-px h-0.5 bg-foreground" />
          )}
        </button>
        <button
          onClick={() => setTab("team")}
          className={cn(
            "relative flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors duration-150",
            tab === "team"
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <UsersThree size={16} />
          Team
          {tab === "team" && (
            <span className="absolute inset-x-0 -bottom-px h-0.5 bg-foreground" />
          )}
        </button>
      </div>

      {/* Individual Leaderboard */}
      {tab === "individual" && (
        <div className="space-y-2">
          {individualLeaderboard.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-muted-foreground">
              <Trophy size={32} weight="light" />
              <p className="mt-2 text-sm">No scores yet this month</p>
            </div>
          ) : (
            individualLeaderboard.map((entry) => {
              const isMe = entry.operator_id === currentUser.id;
              const rank = entry.rank ?? 0;
              const score = entry.total_score ?? 0;
              const tickets = entry.tickets_scored ?? 0;
              const opCompliance = entry.operator_id
                ? slaCompliance[entry.operator_id]
                : undefined;

              return (
                <div
                  key={entry.operator_id}
                  onClick={
                    isAdmin ? () => openOperatorSheet(entry) : undefined
                  }
                  className={cn(
                    "flex items-center gap-4 rounded-lg border px-4 py-3 transition-colors duration-100",
                    isMe
                      ? "border-primary/30 bg-primary/[0.02]"
                      : "border-border",
                    isAdmin &&
                      "cursor-pointer hover:bg-foreground/[0.02]"
                  )}
                >
                  {/* Rank */}
                  <div className="w-8 shrink-0 text-center">
                    {rank <= 3 ? (
                      <RankMedal rank={rank} />
                    ) : (
                      <span className="text-sm font-semibold text-muted-foreground tabular-nums">
                        {rank}
                      </span>
                    )}
                  </div>

                  {/* Name + team */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "text-sm font-medium truncate",
                          isMe ? "text-primary" : "text-foreground"
                        )}
                      >
                        {entry.full_name}
                      </span>
                      {isMe && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] px-1.5 py-0 bg-primary/10 text-primary border-transparent"
                        >
                          You
                        </Badge>
                      )}
                    </div>
                    {entry.team_name && (
                      <span className="text-xs text-muted-foreground">
                        {entry.team_name}
                      </span>
                    )}
                  </div>

                  {/* Tickets count (admin only) */}
                  {isAdmin && (
                    <div className="w-14 shrink-0 text-center hidden sm:block">
                      <span className="text-sm font-semibold text-foreground tabular-nums">
                        {tickets}
                      </span>
                      <p className="text-[10px] font-medium text-foreground">tickets</p>
                    </div>
                  )}

                  {/* SLA Compliance (admin only) */}
                  {isAdmin && (
                    <div className="shrink-0 hidden sm:block">
                      <SlaComplianceBadge
                        compliance={opCompliance}
                        target={complianceTarget}
                      />
                    </div>
                  )}

                  {/* Progress bar */}
                  <div className="w-32 shrink-0 hidden sm:block">
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-300",
                          rank === 1
                            ? "bg-[#C07D10]"
                            : rank === 2
                              ? "bg-[#8B8F96]"
                              : rank === 3
                                ? "bg-[#B87333]"
                                : "bg-primary/60"
                        )}
                        style={{
                          width: `${(score / maxIndividualScore) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Score */}
                  <div className="w-16 shrink-0 text-right">
                    {isAdmin || isMe ? (
                      <div>
                        <span className="text-sm font-semibold text-foreground tabular-nums">
                          {score}
                        </span>
                        <span className="text-xs text-muted-foreground ml-1">
                          pts
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">--</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Team Leaderboard */}
      {tab === "team" && (
        <div className="space-y-2">
          {teamLeaderboard.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-muted-foreground">
              <UsersThree size={32} weight="light" />
              <p className="mt-2 text-sm">No team scores yet</p>
            </div>
          ) : (
            teamLeaderboard.map((entry) => {
              const rank = entry.rank ?? 0;
              const score = entry.total_score ?? 0;
              const members = entry.member_count ?? 0;

              return (
                <div
                  key={entry.team_id}
                  className="flex items-center gap-4 rounded-lg border border-border px-4 py-3"
                >
                  {/* Rank */}
                  <div className="w-8 shrink-0 text-center">
                    {rank <= 3 ? (
                      <RankMedal rank={rank} />
                    ) : (
                      <span className="text-sm font-semibold text-muted-foreground tabular-nums">
                        {rank}
                      </span>
                    )}
                  </div>

                  {/* Team name + members */}
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-foreground truncate block">
                      {entry.team_name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {members} member{members !== 1 ? "s" : ""}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-32 shrink-0 hidden sm:block">
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-300",
                          rank === 1
                            ? "bg-[#C07D10]"
                            : rank === 2
                              ? "bg-[#8B8F96]"
                              : rank === 3
                                ? "bg-[#B87333]"
                                : "bg-primary/60"
                        )}
                        style={{
                          width: `${(score / maxTeamScore) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Score */}
                  <div className="w-16 shrink-0 text-right">
                    <div>
                      <span className="text-sm font-semibold text-foreground tabular-nums">
                        {score}
                      </span>
                      <span className="text-xs text-muted-foreground ml-1">
                        pts
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Operator Analytics Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          className="w-[640px] sm:max-w-[640px] overflow-y-auto p-0"
          aria-describedby="operator-sheet-desc"
        >
          {selectedOperator && (
            <div className="flex flex-col">
              {/* Header */}
              <div className="px-6 pt-6 pb-5">
                <SheetHeader className="space-y-0">
                  <div className="flex items-center gap-3.5">
                    <div className="flex size-11 items-center justify-center rounded-full bg-foreground text-background text-sm font-semibold">
                      {getInitials(selectedOperator.full_name ?? "")}
                    </div>
                    <div>
                      <SheetTitle className="text-foreground text-lg">
                        {selectedOperator.full_name}
                      </SheetTitle>
                      <p
                        id="operator-sheet-desc"
                        className="text-sm text-foreground/50"
                      >
                        {selectedOperator.team_name ?? "No team"} &middot; Rank
                        #{selectedOperator.rank}
                      </p>
                    </div>
                  </div>
                </SheetHeader>
              </div>

              <Separator />

              {loadingSheet ? (
                <div className="flex justify-center py-20">
                  <CircleNotch
                    size={24}
                    className="animate-spin text-muted-foreground"
                  />
                </div>
              ) : sheetData ? (
                <>
                  {/* KPI Cards */}
                  <div className="px-6 py-5">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <KpiCard
                        icon={<ChartLineUp size={14} />}
                        value={String(selectedOperator.total_score ?? 0)}
                        label="Total Score"
                      />
                      <KpiCard
                        icon={<TicketIcon size={14} />}
                        value={String(
                          selectedOperator.tickets_scored ?? 0
                        )}
                        label="Tickets"
                      />
                      <KpiCard
                        icon={<Clock size={14} />}
                        value={formatMinutes(
                          sheetData.performance
                            ?.avg_handling_time_minutes ?? null
                        )}
                        label="Avg Handle"
                      />
                      <KpiCard
                        icon={<Timer size={14} />}
                        value={formatMinutes(
                          sheetData.performance
                            ?.avg_pickup_time_minutes ?? null
                        )}
                        label="Avg Pickup"
                      />
                    </div>
                  </div>

                  {/* SLA Compliance Detail */}
                  {selectedOperator.operator_id &&
                    slaCompliance[selectedOperator.operator_id] && (
                    <>
                      <Separator />
                      <div className="px-6 py-5 space-y-3">
                        <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                          SLA Compliance
                        </h3>
                        <SlaComplianceDetail
                          compliance={
                            slaCompliance[selectedOperator.operator_id]
                          }
                          target={complianceTarget}
                        />
                      </div>
                    </>
                  )}

                  <Separator />

                  {/* Score Chart */}
                  <div className="px-6 py-5 space-y-3">
                    <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                      Daily Scores (Last 30 Days)
                    </h3>
                    {sheetData.scoresPerDay.length === 0 ? (
                      <p className="text-sm text-foreground/40 py-6 text-center">
                        No score data yet
                      </p>
                    ) : (
                      <ChartContainer
                        config={scoreChartConfig}
                        className="h-[180px] w-full"
                      >
                        <AreaChart data={sheetData.scoresPerDay}>
                          <defs>
                            <linearGradient
                              id="operatorScoreFill"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor="#8B7FD7"
                                stopOpacity={0.3}
                              />
                              <stop
                                offset="95%"
                                stopColor="#8B7FD7"
                                stopOpacity={0}
                              />
                            </linearGradient>
                          </defs>
                          <CartesianGrid
                            vertical={false}
                            strokeDasharray="3 3"
                            className="stroke-border"
                          />
                          <XAxis
                            dataKey="scored_date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            className="text-muted-foreground"
                            fontSize={10}
                            tickFormatter={(val: string) => {
                              const d = new Date(val + "T00:00:00");
                              return d.toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              });
                            }}
                          />
                          <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            className="text-muted-foreground"
                            fontSize={10}
                            width={30}
                          />
                          <ChartTooltip
                            cursor={false}
                            content={
                              <ChartTooltipContent
                                labelFormatter={(value) => {
                                  const d = new Date(value + "T00:00:00");
                                  return d.toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  });
                                }}
                              />
                            }
                          />
                          <Area
                            dataKey="total_points"
                            type="monotone"
                            fill="url(#operatorScoreFill)"
                            stroke="#8B7FD7"
                            strokeWidth={2}
                          />
                        </AreaChart>
                      </ChartContainer>
                    )}
                  </div>

                  <Separator />

                  {/* Resolved Tickets */}
                  <div className="px-6 py-5 space-y-3">
                    <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                      Resolved Tickets
                    </h3>
                    {sheetData.resolvedTickets.length === 0 ? (
                      <p className="text-sm text-foreground/40 py-6 text-center">
                        No resolved tickets yet
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {sheetData.resolvedTickets.map((ticket) => (
                          <button
                            key={ticket.id}
                            onClick={() => {
                              setSheetOpen(false);
                              router.push(
                                `/dashboard/tickets/${ticket.id}`
                              );
                            }}
                            className="w-full text-left rounded-lg border border-border px-4 py-3 hover:bg-foreground/[0.02] transition-colors duration-100 cursor-pointer"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-xs font-semibold text-foreground">
                                {ticket.display_id}
                              </span>
                              {ticket.score_category && (
                                <span className="text-xs font-medium text-[#0B8841] dark:text-[#2EAD5E]">
                                  +{ticket.score_category.points}{" "}
                                  {ticket.score_category.name}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-foreground mt-1 truncate">
                              {ticket.ai_summary || "No summary"}
                            </p>
                            <div className="flex items-center gap-3 mt-1.5 text-xs text-foreground/40">
                              {ticket.ai_category && (
                                <span>{ticket.ai_category}</span>
                              )}
                              {ticket.resolved_at && (
                                <span className="tabular-nums">
                                  {new Date(ticket.resolved_at).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                  {" · "}
                                  {new Date(ticket.resolved_at).toLocaleTimeString("en-US", {
                                    hour: "numeric",
                                    minute: "2-digit",
                                    hour12: true,
                                  })}
                                </span>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : null}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

// ── KPI Card ──
function KpiCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-foreground/[0.02] px-4 py-3 transition-all duration-200 hover:border-foreground/80 hover:shadow-sm">
      <div className="flex items-center gap-1.5 text-foreground mb-1">
        {icon}
        <span className="text-[10px] font-medium uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p className="text-lg font-semibold text-foreground tabular-nums">
        {value}
      </p>
    </div>
  );
}

// ── SLA Compliance Badge (inline in leaderboard row) ──
function SlaComplianceBadge({
  compliance,
  target,
}: {
  compliance: SlaComplianceEntry | undefined;
  target: number;
}) {
  if (!compliance || compliance.total === 0) {
    return (
      <div className="w-16 text-center">
        <span className="text-xs text-muted-foreground">N/A</span>
      </div>
    );
  }

  const pct = compliance.percentage;
  const color =
    pct >= target
      ? "text-[#0B8841] dark:text-[#2EAD5E]"
      : pct >= target - 15
        ? "text-[#C07D10] dark:text-[#F5D90A]"
        : "text-[#CD2B31] dark:text-[#E5484D]";
  const barColor =
    pct >= target
      ? "bg-[#0B8841] dark:bg-[#2EAD5E]"
      : pct >= target - 15
        ? "bg-[#C07D10] dark:bg-[#F5D90A]"
        : "bg-[#CD2B31] dark:bg-[#E5484D]";

  return (
    <div className="w-16 flex flex-col items-center gap-1">
      <span className={cn("text-xs font-semibold tabular-nums", color)}>
        {pct}%
      </span>
      <div className="w-full h-1 rounded-full bg-muted overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-300", barColor)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[9px] text-muted-foreground">SLA</span>
    </div>
  );
}

// ── SLA Compliance Detail (in operator sheet) ──
function SlaComplianceDetail({
  compliance,
  target,
}: {
  compliance: SlaComplianceEntry;
  target: number;
}) {
  const pct = compliance.percentage;
  const meetsTarget = pct >= target;
  const color = meetsTarget
    ? "text-[#0B8841] dark:text-[#2EAD5E]"
    : pct >= target - 15
      ? "text-[#C07D10] dark:text-[#F5D90A]"
      : "text-[#CD2B31] dark:text-[#E5484D]";
  const barColor = meetsTarget
    ? "bg-[#0B8841] dark:bg-[#2EAD5E]"
    : pct >= target - 15
      ? "bg-[#C07D10] dark:bg-[#F5D90A]"
      : "bg-[#CD2B31] dark:bg-[#E5484D]";

  return (
    <div className="rounded-lg border border-border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className={color} />
          <span className={cn("text-2xl font-semibold tabular-nums", color)}>
            {pct}%
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          Target: {target}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="relative h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-300", barColor)}
          style={{ width: `${pct}%` }}
        />
        {/* Target line */}
        <div
          className="absolute top-0 h-full w-px bg-foreground/30"
          style={{ left: `${target}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {compliance.compliant} of {compliance.total} tickets within SLA
        </span>
        <span className={cn("font-medium", meetsTarget ? "text-[#0B8841] dark:text-[#2EAD5E]" : "text-[#CD2B31] dark:text-[#E5484D]")}>
          {meetsTarget ? "On target" : `${target - pct}% below target`}
        </span>
      </div>
    </div>
  );
}

function RankMedal({ rank }: { rank: number }) {
  const colors: Record<number, string> = {
    1: "text-[#C07D10]",
    2: "text-[#8B8F96]",
    3: "text-[#B87333]",
  };

  return (
    <Medal
      size={22}
      weight="fill"
      className={colors[rank] ?? "text-muted-foreground"}
    />
  );
}
