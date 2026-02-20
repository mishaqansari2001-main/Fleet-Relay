"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  Sector,
  XAxis,
  YAxis,
} from "recharts";
import {
  Ticket as TicketIcon,
  Clock,
  Timer,
  ChartLineUp,
  Trophy,
  Crown,
  ArrowRight,
  Warning,
  Medal,
  CaretUp,
  CaretDown,
  CaretUpDown,
  ChatCircleDots,
  UsersThree,
} from "@phosphor-icons/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { useRealtimeRefresh } from "@/hooks/use-realtime-refresh";
import { cn } from "@/lib/utils";
import {
  type DashboardStats,
  type TicketsPerDay,
  type LeaderboardEntry,
  type TeamLeaderboardEntry,
  type TicketWithRelations,
  type OperatorPerformance,
  ticketStatusConfig,
  getDriverFullName,
  timeAgo,
  formatMinutes,
} from "@/lib/types";

// ── Chart configs (Notion-inspired palette) ──
const volumeChartConfig = {
  ticket_count: {
    label: "Created",
    color: "#4A90D9",
  },
  resolved_count: {
    label: "Resolved",
    color: "#4DAB9A",
  },
} satisfies ChartConfig;

// ── Chart colors (modern, high-contrast) ──
const STATUS_COLORS: Record<string, string> = {
  resolved: "#2EAD5E",
  open: "#E5954B",
  in_progress: "#5B9EF0",
  on_hold: "#8B5CF6",
  dismissed: "#71767F",
};

// ── Active donut shape (hover expand) ──
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderActiveDonutShape(props: any) {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } =
    props;
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius - 2}
        outerRadius={outerRadius + 5}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    </g>
  );
}

// ── Source breakdown item ──
interface SourceBreakdownItem {
  name: string;
  resolved: number;
  unresolved: number;
  total: number;
  connectionType: string;
}

// ── Props ──
interface DashboardClientProps {
  currentUser: {
    id: string;
    full_name: string;
    email: string;
    role: "admin" | "operator";
  };
  stats: DashboardStats | null;
  ticketsPerDay: TicketsPerDay[];
  openTickets: TicketWithRelations[];
  leaderboard: LeaderboardEntry[];
  teamLeaderboard: TeamLeaderboardEntry[];
  statusCounts: Record<string, number>;
  sourceCounts: Record<string, number>;
  categoryCounts: Record<string, number>;
  sourceBreakdown: SourceBreakdownItem[];
  operatorResolvedToday: number;
  operatorOpenCount: number;
  slaThresholds: { urgent: number; normal: number };
  operatorPerformance: OperatorPerformance[];
  myPerformance: OperatorPerformance | null;
}

export function DashboardClient({
  currentUser,
  stats,
  ticketsPerDay,
  openTickets,
  leaderboard,
  teamLeaderboard,
  statusCounts,
  sourceCounts,
  categoryCounts,
  sourceBreakdown,
  operatorResolvedToday,
  operatorOpenCount,
  slaThresholds,
  operatorPerformance,
  myPerformance,
}: DashboardClientProps) {
  useRealtimeRefresh("tickets");

  const isAdmin = currentUser.role === "admin";

  const operatorEntry = leaderboard.find(
    (e) => e.operator_id === currentUser.id
  );

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isAdmin
            ? "Overview of your fleet support operations."
            : `Welcome back, ${currentUser.full_name.split(" ")[0]}.`}
        </p>
      </div>

      {/* KPI Cards */}
      {isAdmin ? (
        <AdminKPIs stats={stats} />
      ) : (
        <OperatorKPIs
          operatorEntry={operatorEntry ?? null}
          operatorResolvedToday={operatorResolvedToday}
          operatorOpenCount={operatorOpenCount}
          myPerformance={myPerformance}
        />
      )}

      {/* Open Tickets Table */}
      <OpenTicketsTable
        tickets={openTickets}
        slaThresholds={slaThresholds}
      />

      {/* Ticket Volume + Status Breakdown */}
      <div className={cn("grid grid-cols-1 gap-6", isAdmin && "lg:grid-cols-5")}>
        <div className={isAdmin ? "lg:col-span-3" : "lg:col-span-5"}>
          <TicketVolumeChart data={ticketsPerDay} />
        </div>
        {isAdmin && (
          <div className="lg:col-span-2">
            <StatusBreakdownChart statusCounts={statusCounts} />
          </div>
        )}
      </div>

      {/* Admin-only: Source Breakdown + Top Operators */}
      {isAdmin && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <SourceBreakdownChart sourceBreakdown={sourceBreakdown} />
          </div>
          <LeaderboardPreview leaderboard={leaderboard} />
        </div>
      )}

      {/* Admin-only: Operator Performance (at bottom) */}
      {isAdmin && (
        <OperatorPerformanceTable data={operatorPerformance} />
      )}
    </div>
  );
}

// ── Admin KPI Cards ──
function AdminKPIs({ stats }: { stats: DashboardStats | null }) {
  const kpis = [
    {
      title: "Total Tickets",
      value: stats?.total_tickets ?? 0,
      icon: TicketIcon,
      description: "This month",
    },
    {
      title: "Unresolved",
      value: stats?.unresolved_tickets ?? 0,
      icon: Warning,
      description: "Open + In Progress + On Hold",
    },
    {
      title: "Avg. Pickup Time",
      value: formatMinutes(stats?.avg_pickup_time_minutes ?? null),
      icon: Clock,
      description: "Time to first claim",
    },
    {
      title: "Avg. Handling Time",
      value: formatMinutes(stats?.avg_handling_time_minutes ?? null),
      icon: Timer,
      description: "Claim to resolution",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => (
        <Card
          key={kpi.title}
          className="bg-card border-border shadow-sm dark:shadow-none transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:hover:border-[#32353C]"
        >
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-foreground">
                {kpi.title}
              </p>
              <kpi.icon
                size={18}
                weight="fill"
                className="text-foreground"
              />
            </div>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
              {kpi.value}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {kpi.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ── Operator KPI Cards ──
function OperatorKPIs({
  operatorEntry,
  operatorResolvedToday,
  operatorOpenCount,
  myPerformance,
}: {
  operatorEntry: LeaderboardEntry | null;
  operatorResolvedToday: number;
  operatorOpenCount: number;
  myPerformance: OperatorPerformance | null;
}) {
  const kpis = [
    {
      title: "My Score",
      value: operatorEntry?.total_score ?? 0,
      icon: Trophy,
      description: "Current month",
    },
    {
      title: "My Rank",
      value: operatorEntry?.rank ? `#${operatorEntry.rank}` : "--",
      icon: Crown,
      description: `${operatorEntry?.tickets_scored ?? 0} tickets scored`,
    },
    {
      title: "Resolved Today",
      value: operatorResolvedToday,
      icon: ChartLineUp,
      description: `${operatorOpenCount} ticket${operatorOpenCount !== 1 ? "s" : ""} in progress`,
    },
    {
      title: "Avg. Handling Time",
      value: formatMinutes(myPerformance?.avg_handling_time_minutes ?? null),
      icon: Timer,
      description: "Claim to resolution",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => (
        <Card
          key={kpi.title}
          className="bg-card border-border shadow-sm dark:shadow-none transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:hover:border-[#32353C]"
        >
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-foreground">
                {kpi.title}
              </p>
              <kpi.icon
                size={18}
                weight="fill"
                className="text-foreground"
              />
            </div>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
              {kpi.value}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {kpi.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ── SLA Helper ──
function getSlaStatus(
  ticket: TicketWithRelations,
  thresholds: { urgent: number; normal: number }
) {
  if (ticket.status === "on_hold") {
    return { breached: false, text: "Paused", className: "text-[#8B5CF6]" };
  }

  const thresholdMinutes =
    ticket.priority === "urgent" ? thresholds.urgent : thresholds.normal;
  const holdSeconds = ticket.total_hold_seconds || 0;
  const createdAt = new Date(ticket.created_at);
  const deadline = new Date(
    createdAt.getTime() + (thresholdMinutes * 60 + holdSeconds) * 1000
  );
  const now = new Date();
  const remainingMs = deadline.getTime() - now.getTime();

  if (remainingMs <= 0) {
    return { breached: true, text: "Breached", className: "text-[#CD2B31] dark:text-[#E5484D]" };
  }

  const remainingMin = Math.floor(remainingMs / 60000);
  if (remainingMin < 60) {
    const isWarning = remainingMin < 15;
    return {
      breached: false,
      text: `${remainingMin}m left`,
      className: isWarning
        ? "text-[#C07D10] dark:text-[#F5D90A]"
        : "text-[#0B8841] dark:text-[#2EAD5E]",
    };
  }

  const hours = Math.floor(remainingMin / 60);
  const mins = remainingMin % 60;
  return {
    breached: false,
    text: mins > 0 ? `${hours}h ${mins}m` : `${hours}h`,
    className: "text-[#0B8841] dark:text-[#2EAD5E]",
  };
}

// ── Open Tickets Table ──
function OpenTicketsTable({
  tickets,
  slaThresholds,
}: {
  tickets: TicketWithRelations[];
  slaThresholds: { urgent: number; normal: number };
}) {
  return (
    <Card className="bg-card border-border shadow-sm dark:shadow-none">
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-medium text-foreground">
              Open & On Hold Tickets
            </CardTitle>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {tickets.length} unclaimed ticket{tickets.length !== 1 ? "s" : ""} waiting to be picked up
            </p>
          </div>
          <Link
            href="/dashboard/tickets"
            className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            View all
            <ArrowRight size={12} weight="bold" />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        {tickets.length === 0 ? (
          <div className="flex h-24 items-center justify-center text-sm text-muted-foreground">
            No open tickets
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border">
                <TableHead className="w-[40px] pl-4 pr-1" />
                <TableHead className="w-[100px] text-xs text-muted-foreground font-medium">
                  Ticket
                </TableHead>
                <TableHead className="text-xs text-muted-foreground font-medium min-w-[200px]">
                  Summary
                </TableHead>
                <TableHead className="w-[140px] text-xs text-muted-foreground font-medium hidden lg:table-cell">
                  Driver
                </TableHead>
                <TableHead className="w-[140px] text-xs text-muted-foreground font-medium hidden md:table-cell">
                  Operator
                </TableHead>
                <TableHead className="w-[100px] text-xs text-muted-foreground font-medium hidden sm:table-cell">
                  Created
                </TableHead>
                <TableHead className="w-[100px] text-xs text-muted-foreground font-medium text-right pr-4">
                  SLA
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map((ticket) => {
                const sla = getSlaStatus(ticket, slaThresholds);

                return (
                  <TableRow
                    key={ticket.id}
                    className="group cursor-pointer border-border"
                  >
                    <TableCell className="py-2.5 pl-4 pr-1">
                      {ticket.priority === "urgent" &&
                      ticket.status !== "resolved" &&
                      ticket.status !== "dismissed" ? (
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
                    <TableCell className="py-2.5">
                      <Link
                        href={`/dashboard/tickets/${ticket.id}`}
                        className="font-mono text-xs font-medium text-foreground group-hover:text-primary transition-colors"
                      >
                        {ticket.display_id}
                      </Link>
                    </TableCell>
                    <TableCell className="py-2.5">
                      <Link
                        href={`/dashboard/tickets/${ticket.id}`}
                        className="block truncate text-sm text-foreground group-hover:text-primary transition-colors max-w-[300px]"
                      >
                        {ticket.ai_summary || "No summary"}
                      </Link>
                    </TableCell>
                    <TableCell className="py-2.5 hidden lg:table-cell">
                      <span className="text-sm text-foreground truncate block">
                        {ticket.driver
                          ? getDriverFullName(ticket.driver)
                          : "Unknown"}
                      </span>
                    </TableCell>
                    <TableCell className="py-2.5 hidden md:table-cell">
                      <span className="text-sm text-foreground">
                        {ticket.assigned_operator?.full_name ?? (
                          <span className="text-xs text-muted-foreground italic">Unassigned</span>
                        )}
                      </span>
                    </TableCell>
                    <TableCell className="py-2.5 hidden sm:table-cell">
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {timeAgo(ticket.created_at)}
                      </span>
                    </TableCell>
                    <TableCell className="py-2.5 text-right pr-4">
                      <span
                        className={cn(
                          "text-xs font-medium tabular-nums",
                          sla.className
                        )}
                      >
                        {sla.text}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

// ── Operator Performance Table ──
type SortField =
  | "full_name"
  | "team_name"
  | "tickets_resolved_today"
  | "tickets_resolved_month"
  | "avg_pickup_time_minutes"
  | "avg_handling_time_minutes";

type SortDir = "asc" | "desc";

function OperatorPerformanceTable({
  data,
}: {
  data: OperatorPerformance[];
}) {
  const [sortField, setSortField] = useState<SortField>("tickets_resolved_month");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const sorted = [...data].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];
    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return 1;
    if (bVal == null) return -1;
    const cmp = typeof aVal === "string" && typeof bVal === "string"
      ? aVal.localeCompare(bVal)
      : Number(aVal) - Number(bVal);
    return sortDir === "asc" ? cmp : -cmp;
  });

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field)
      return <CaretUpDown size={12} className="text-muted-foreground/50" />;
    return sortDir === "asc" ? (
      <CaretUp size={12} weight="bold" className="text-foreground" />
    ) : (
      <CaretDown size={12} weight="bold" className="text-foreground" />
    );
  };

  const columns: { field: SortField; label: string; className?: string }[] = [
    { field: "full_name", label: "Operator" },
    { field: "team_name", label: "Team", className: "hidden md:table-cell" },
    { field: "tickets_resolved_today", label: "Today" },
    { field: "tickets_resolved_month", label: "Month" },
    { field: "avg_pickup_time_minutes", label: "Avg. Pickup" },
    { field: "avg_handling_time_minutes", label: "Avg. Handling" },
  ];

  return (
    <Card className="bg-card border-border shadow-sm dark:shadow-none">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-medium text-foreground">
              Operator Performance
            </CardTitle>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {data.length} operator{data.length !== 1 ? "s" : ""} this month
            </p>
          </div>
          <Link
            href="/dashboard/operators"
            className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            Manage
            <ArrowRight size={12} weight="bold" />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {sorted.length === 0 ? (
          <div className="flex h-24 items-center justify-center text-sm text-muted-foreground">
            No operator data
          </div>
        ) : (
          <div className="max-h-[320px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                {columns.map((col) => (
                  <TableHead
                    key={col.field}
                    className={cn(
                      "text-xs text-muted-foreground font-medium cursor-pointer select-none",
                      col.className
                    )}
                    onClick={() => handleSort(col.field)}
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.label}
                      <SortIcon field={col.field} />
                    </span>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((op) => (
                <TableRow key={op.operator_id}>
                  <TableCell className="py-2.5">
                    <span className="text-sm font-medium text-foreground">
                      {op.full_name ?? "--"}
                    </span>
                  </TableCell>
                  <TableCell className="py-2.5 hidden md:table-cell">
                    <span className="text-xs text-muted-foreground">
                      {op.team_name ?? (
                        <span className="italic">No team</span>
                      )}
                    </span>
                  </TableCell>
                  <TableCell className="py-2.5">
                    <span className="text-sm font-medium text-foreground tabular-nums">
                      {op.tickets_resolved_today ?? 0}
                    </span>
                  </TableCell>
                  <TableCell className="py-2.5">
                    <span className="text-sm font-medium text-foreground tabular-nums">
                      {op.tickets_resolved_month ?? 0}
                    </span>
                  </TableCell>
                  <TableCell className="py-2.5">
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {formatMinutes(op.avg_pickup_time_minutes)}
                    </span>
                  </TableCell>
                  <TableCell className="py-2.5">
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {formatMinutes(op.avg_handling_time_minutes)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Ticket Volume Chart (Area) ──
type VolumeRange = "7d" | "15d" | "30d";
const VOLUME_RANGES: { value: VolumeRange; label: string; days: number }[] = [
  { value: "7d", label: "7 days", days: 7 },
  { value: "15d", label: "15 days", days: 15 },
  { value: "30d", label: "1 month", days: 30 },
];

function TicketVolumeChart({ data }: { data: TicketsPerDay[] }) {
  const [range, setRange] = useState<VolumeRange>("15d");

  const allData = useMemo(
    () =>
      data.map((d) => ({
        date: d.date ?? "",
        ticket_count: d.ticket_count ?? 0,
        resolved_count: d.resolved_count ?? 0,
      })),
    [data]
  );

  const chartData = useMemo(() => {
    const days = VOLUME_RANGES.find((r) => r.value === range)?.days ?? 15;
    return allData.slice(-days);
  }, [allData, range]);

  const rangeLabel = VOLUME_RANGES.find((r) => r.value === range)?.label ?? "";

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <Card className="bg-card border-border shadow-sm dark:shadow-none">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-medium text-foreground">
              Ticket Volume
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Daily tickets over the last {rangeLabel}
            </p>
          </div>
          <div className="flex items-center gap-0.5 rounded-lg border border-border bg-muted/50 p-0.5">
            {VOLUME_RANGES.map((r) => (
              <button
                key={r.value}
                onClick={() => setRange(r.value)}
                className={cn(
                  "relative px-2.5 py-1 text-[11px] font-medium rounded-md transition-all duration-200 select-none",
                  range === r.value
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {range === r.value && (
                  <span className="absolute inset-0 rounded-md bg-background shadow-sm border border-border/60" />
                )}
                <span className="relative">{r.label}</span>
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
            No ticket data yet
          </div>
        ) : (
          <div
            key={range}
            className="animate-[fadeSlideIn_400ms_ease-out]"
          >
            <ChartContainer config={volumeChartConfig} className="h-[220px] w-full">
              <AreaChart
                data={chartData}
                margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="fillCreated" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-ticket_count)" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="var(--color-ticket_count)" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="fillResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-resolved_count)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="var(--color-resolved_count)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  vertical={false}
                  strokeDasharray="3 3"
                  className="stroke-border"
                />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatDate}
                  fontSize={11}
                  tickMargin={8}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  tickMargin={4}
                  allowDecimals={false}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      labelFormatter={(value) => formatDate(value as string)}
                    />
                  }
                />
                <Area
                  dataKey="resolved_count"
                  type="monotone"
                  fill="url(#fillResolved)"
                  stroke="var(--color-resolved_count)"
                  strokeWidth={2}
                  dot={false}
                  animationDuration={625}
                  animationEasing="ease-out"
                />
                <Area
                  dataKey="ticket_count"
                  type="monotone"
                  fill="url(#fillCreated)"
                  stroke="var(--color-ticket_count)"
                  strokeWidth={2}
                  dot={false}
                  animationDuration={625}
                  animationEasing="ease-out"
                />
              </AreaChart>
            </ChartContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Status Breakdown Donut ──
function StatusBreakdownChart({
  statusCounts,
}: {
  statusCounts: Record<string, number>;
}) {
  const [mounted, setMounted] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  useEffect(() => setMounted(true), []);

  const data = Object.entries(statusCounts).map(([status, count]) => ({
    name:
      ticketStatusConfig[status as keyof typeof ticketStatusConfig]?.label ??
      status,
    value: count,
    fill: STATUS_COLORS[status] ?? "#6B7280",
  }));

  const total = data.reduce((sum, d) => sum + d.value, 0);
  const hovered = activeIndex >= 0 ? data[activeIndex] : null;

  return (
    <Card className="bg-card border-border shadow-sm dark:shadow-none h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-foreground">
          Status Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6">
          <div
            className="relative h-[160px] w-[160px] shrink-0"
            onMouseLeave={() => setActiveIndex(-1)}
          >
            {mounted && (
              <PieChart width={160} height={160}>
                <Pie
                  data={data}
                  cx={75}
                  cy={75}
                  innerRadius={46}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                  activeIndex={activeIndex}
                  activeShape={renderActiveDonutShape}
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                  animationBegin={0}
                  animationDuration={600}
                  animationEasing="ease-out"
                >
                  {data.map((entry, idx) => (
                    <Cell
                      key={idx}
                      fill={entry.fill}
                      opacity={
                        activeIndex === -1 || activeIndex === idx ? 1 : 0.4
                      }
                      style={{ transition: "opacity 200ms ease" }}
                    />
                  ))}
                </Pie>
              </PieChart>
            )}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-semibold text-foreground tabular-nums transition-all duration-150">
                {hovered ? hovered.value : total}
              </span>
              <span className="text-[10px] text-muted-foreground transition-all duration-150">
                {hovered ? hovered.name : "Total"}
              </span>
            </div>
          </div>
          <div className="space-y-2.5 flex-1">
            {data.map((d, idx) => {
              const pct = total > 0 ? Math.round((d.value / total) * 100) : 0;
              return (
                <div
                  key={d.name}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-1.5 py-0.5 -mx-1.5 transition-colors duration-150 cursor-default",
                    activeIndex === idx && "bg-foreground/[0.04]"
                  )}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onMouseLeave={() => setActiveIndex(-1)}
                >
                  <div
                    className="h-2.5 w-2.5 rounded-full shrink-0 transition-transform duration-150"
                    style={{
                      backgroundColor: d.fill,
                      transform:
                        activeIndex === idx ? "scale(1.3)" : "scale(1)",
                    }}
                  />
                  <span className="text-xs text-muted-foreground flex-1">
                    {d.name}
                  </span>
                  <span className="text-xs font-medium text-foreground tabular-nums">
                    {d.value}
                  </span>
                  <span className="text-[10px] text-muted-foreground tabular-nums w-8 text-right">
                    {pct}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Source Breakdown Chart (replaces Category + Source charts) ──
type SourceView = "dm" | "group";

function SourceBreakdownChart({
  sourceBreakdown,
}: {
  sourceBreakdown: SourceBreakdownItem[];
}) {
  const [view, setView] = useState<SourceView>("dm");
  const [hoveredIndex, setHoveredIndex] = useState(-1);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const data = useMemo(
    () =>
      sourceBreakdown
        .filter((d) =>
          view === "dm"
            ? d.connectionType === "business_account"
            : d.connectionType === "group"
        )
        .sort((a, b) => b.total - a.total),
    [sourceBreakdown, view]
  );

  const maxTotal = Math.max(...data.map((d) => d.total), 1);

  const totalResolved = data.reduce((s, d) => s + d.resolved, 0);
  const totalUnresolved = data.reduce((s, d) => s + d.unresolved, 0);

  return (
    <Card className="bg-card border-border shadow-sm dark:shadow-none h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-medium text-foreground">
              Tickets by Source
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              {totalResolved} resolved · {totalUnresolved} unresolved
            </p>
          </div>
          <div className="flex items-center gap-0.5 rounded-lg border border-border bg-muted/50 p-0.5">
            {(
              [
                { value: "dm", label: "Personal DMs", icon: ChatCircleDots },
                { value: "group", label: "Group Chats", icon: UsersThree },
              ] as const
            ).map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  setView(opt.value);
                  setHoveredIndex(-1);
                }}
                className={cn(
                  "relative flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-md transition-all duration-200 select-none",
                  view === opt.value
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {view === opt.value && (
                  <span className="absolute inset-0 rounded-md bg-background shadow-sm border border-border/60" />
                )}
                <opt.icon size={12} className="relative" />
                <span className="relative">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-[180px] items-center justify-center text-sm text-muted-foreground">
            No connections configured
          </div>
        ) : (
          <div key={view} className="animate-[fadeSlideIn_300ms_ease-out]">
            <div className="space-y-4">
              {data.map((item, idx) => {
                const isHovered = hoveredIndex === idx;
                const resolvedPct = (item.resolved / maxTotal) * 100;
                const unresolvedPct = (item.unresolved / maxTotal) * 100;

                return (
                  <div
                    key={item.name}
                    className={cn(
                      "rounded-lg px-3 py-2.5 -mx-3 transition-colors duration-150 cursor-default",
                      isHovered && "bg-foreground/[0.025]"
                    )}
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(-1)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={cn(
                          "text-sm font-medium transition-colors duration-150",
                          isHovered ? "text-foreground" : "text-foreground/80"
                        )}
                      >
                        {item.name}
                      </span>
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {isHovered ? (
                          <>
                            <span className="text-[#0B8841] dark:text-[#2EAD5E] font-medium">
                              {item.resolved}
                            </span>
                            {" resolved · "}
                            <span className="font-medium text-foreground/60">
                              {item.unresolved}
                            </span>
                            {" unresolved"}
                          </>
                        ) : (
                          <>
                            {item.resolved}{" "}
                            <span className="text-muted-foreground/50">/</span>{" "}
                            {item.total}
                          </>
                        )}
                      </span>
                    </div>
                    <div className="relative h-2.5 rounded-full bg-foreground/[0.04] overflow-hidden">
                      {/* Unresolved (behind) */}
                      <div
                        className="absolute inset-y-0 left-0 rounded-full bg-foreground/[0.08] dark:bg-foreground/[0.12] transition-all duration-500 ease-out"
                        style={{
                          width: mounted
                            ? `${resolvedPct + unresolvedPct}%`
                            : "0%",
                          transitionDelay: `${idx * 60}ms`,
                        }}
                      />
                      {/* Resolved (front) */}
                      <div
                        className={cn(
                          "absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out",
                          isHovered
                            ? "bg-[#0B8841] dark:bg-[#2EAD5E]"
                            : "bg-[#0B8841]/80 dark:bg-[#2EAD5E]/80"
                        )}
                        style={{
                          width: mounted ? `${resolvedPct}%` : "0%",
                          transitionDelay: `${idx * 60 + 80}ms`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-5 mt-4 pt-3 border-t border-border">
              <div className="flex items-center gap-1.5">
                <div className="size-2 rounded-full bg-[#0B8841] dark:bg-[#2EAD5E]" />
                <span className="text-[11px] text-muted-foreground">
                  Resolved
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="size-2 rounded-full bg-foreground/[0.12]" />
                <span className="text-[11px] text-muted-foreground">
                  Unresolved
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Leaderboard Preview ──
function LeaderboardPreview({
  leaderboard,
}: {
  leaderboard: LeaderboardEntry[];
}) {
  const top5 = leaderboard.slice(0, 5);
  const maxScore = Math.max(...top5.map((e) => e.total_score ?? 0), 1);

  const medalColors: Record<number, string> = {
    1: "text-[#C07D10]",
    2: "text-[#8B8F96]",
    3: "text-[#B87333]",
  };

  return (
    <Card className="bg-card border-border shadow-sm dark:shadow-none">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-foreground">
            Top Operators
          </CardTitle>
          <Link
            href="/dashboard/leaderboard"
            className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            Full leaderboard
            <ArrowRight size={12} weight="bold" />
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {top5.length === 0 ? (
          <div className="flex h-[180px] items-center justify-center text-sm text-muted-foreground">
            No scores yet
          </div>
        ) : (
          <div className="space-y-1.5">
            {top5.map((entry) => {
              const rank = entry.rank ?? 0;
              const score = entry.total_score ?? 0;
              return (
                <Link
                  key={entry.operator_id}
                  href="/dashboard/leaderboard"
                  className="flex items-center gap-3 rounded-lg px-2.5 py-2 -mx-2.5 transition-all duration-150 hover:bg-foreground/[0.04] group cursor-pointer"
                >
                  <div className="w-6 shrink-0 text-center">
                    {rank <= 3 ? (
                      <Medal
                        size={18}
                        weight="fill"
                        className={cn(medalColors[rank], "transition-transform duration-150 group-hover:scale-110")}
                      />
                    ) : (
                      <span className="text-xs font-semibold text-muted-foreground tabular-nums">
                        {rank}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors duration-150">
                        {entry.full_name}
                      </span>
                      <span className="text-xs font-semibold text-foreground tabular-nums ml-2">
                        {score} pts
                      </span>
                    </div>
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
                        style={{ width: `${(score / maxScore) * 100}%` }}
                      />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
