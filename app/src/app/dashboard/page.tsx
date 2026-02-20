import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("id, full_name, email, role")
    .eq("id", authUser.id)
    .single();

  if (!profile) redirect("/login");

  const currentUser = {
    id: profile.id,
    full_name: profile.full_name,
    email: profile.email,
    role: profile.role as "admin" | "operator",
  };

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);

  // Parallel fetch all dashboard data
  const [
    { data: statsRows },
    { data: ticketsPerDay },
    { data: openTickets },
    { data: leaderboard },
    { data: teamLeaderboard },
    { data: allTickets },
    { data: telegramConnections },
    { data: slaRows },
    { data: operatorPerformance },
  ] = await Promise.all([
    supabase.from("dashboard_stats").select("*"),
    supabase
      .from("tickets_per_day")
      .select("*")
      .gte("date", thirtyDaysAgo.toISOString().split("T")[0])
      .order("date", { ascending: true }),
    supabase
      .from("tickets")
      .select(
        `
        *,
        driver:drivers!tickets_driver_id_fkey(id, first_name, last_name, username, telegram_user_id),
        assigned_operator:users!tickets_assigned_operator_id_fkey(id, full_name, email),
        score_category:score_categories!tickets_score_category_id_fkey(id, name, points),
        held_by:users!tickets_held_by_id_fkey(id, full_name)
      `
      )
      .in("status", ["open", "on_hold"])
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("leaderboard_current_month")
      .select("*")
      .order("rank", { ascending: true }),
    supabase
      .from("team_leaderboard_current_month")
      .select("*")
      .order("rank", { ascending: true }),
    supabase.from("tickets").select("status, source_type, ai_category, business_connection_id, source_chat_id"),
    supabase
      .from("telegram_connections")
      .select("display_name, connection_type, business_connection_id, chat_id")
      .order("created_at"),
    supabase
      .from("settings")
      .select("key, value")
      .in("key", [
        "sla_urgency_threshold_minutes",
        "sla_normal_threshold_minutes",
      ]),
    supabase
      .from("operator_performance")
      .select("*")
      .order("tickets_resolved_month", { ascending: false, nullsFirst: false }),
  ]);

  const stats = statsRows?.[0] ?? null;

  const statusCounts: Record<string, number> = {};
  const sourceCounts: Record<string, number> = {};
  const categoryCounts: Record<string, number> = {};

  for (const t of allTickets ?? []) {
    statusCounts[t.status] = (statusCounts[t.status] ?? 0) + 1;
    const src = t.source_type ?? "unknown";
    sourceCounts[src] = (sourceCounts[src] ?? 0) + 1;
    const cat = t.ai_category || "uncategorized";
    categoryCounts[cat] = (categoryCounts[cat] ?? 0) + 1;
  }

  // Compute source breakdown per connection
  const sourceBreakdown: {
    name: string;
    resolved: number;
    unresolved: number;
    total: number;
    connectionType: string;
  }[] = [];
  for (const conn of telegramConnections ?? []) {
    const matching = (allTickets ?? []).filter((t) => {
      if (conn.connection_type === "business_account") {
        return t.business_connection_id === conn.business_connection_id;
      }
      return t.source_chat_id === conn.chat_id;
    });
    const resolved = matching.filter(
      (t) => t.status === "resolved" || t.status === "dismissed"
    ).length;
    sourceBreakdown.push({
      name: conn.display_name,
      resolved,
      unresolved: matching.length - resolved,
      total: matching.length,
      connectionType: conn.connection_type,
    });
  }

  const slaThresholds = { urgent: 30, normal: 240 };
  for (const row of slaRows ?? []) {
    if (row.key === "sla_urgency_threshold_minutes")
      slaThresholds.urgent = Number(row.value) || 30;
    if (row.key === "sla_normal_threshold_minutes")
      slaThresholds.normal = Number(row.value) || 240;
  }

  let operatorResolvedToday = 0;
  let operatorOpenCount = 0;
  let myPerformance = null;
  if (currentUser.role === "operator") {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [{ count: resolvedCount }, { count: openCount }] =
      await Promise.all([
        supabase
          .from("tickets")
          .select("id", { count: "exact", head: true })
          .eq("assigned_operator_id", currentUser.id)
          .eq("status", "resolved")
          .gte("resolved_at", todayStart.toISOString()),
        supabase
          .from("tickets")
          .select("id", { count: "exact", head: true })
          .eq("assigned_operator_id", currentUser.id)
          .eq("status", "in_progress"),
      ]);

    operatorResolvedToday = resolvedCount ?? 0;
    operatorOpenCount = openCount ?? 0;

    myPerformance =
      (operatorPerformance ?? []).find(
        (p) => p.operator_id === currentUser.id
      ) ?? null;
  }

  return (
    <DashboardClient
      currentUser={currentUser}
      stats={stats}
      ticketsPerDay={ticketsPerDay ?? []}
      openTickets={openTickets ?? []}
      leaderboard={leaderboard ?? []}
      teamLeaderboard={teamLeaderboard ?? []}
      statusCounts={statusCounts}
      sourceCounts={sourceCounts}
      categoryCounts={categoryCounts}
      sourceBreakdown={sourceBreakdown}
      operatorResolvedToday={operatorResolvedToday}
      operatorOpenCount={operatorOpenCount}
      slaThresholds={slaThresholds}
      operatorPerformance={operatorPerformance ?? []}
      myPerformance={myPerformance}
    />
  );
}
