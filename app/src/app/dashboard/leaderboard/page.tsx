import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LeaderboardClient } from "./leaderboard-client";

export default async function LeaderboardPage() {
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
    role: profile.role as "admin" | "operator",
  };

  // Parallel fetch leaderboards + SLA data
  const [
    { data: individualLeaderboard },
    { data: teamLeaderboard },
    { data: slaRows },
    { data: resolvedTickets },
  ] = await Promise.all([
    supabase
      .from("leaderboard_current_month")
      .select("*")
      .order("rank", { ascending: true }),
    supabase
      .from("team_leaderboard_current_month")
      .select("*")
      .order("rank", { ascending: true }),
    supabase
      .from("settings")
      .select("key, value")
      .in("key", [
        "sla_urgency_threshold_minutes",
        "sla_normal_threshold_minutes",
        "sla_compliance_target",
      ]),
    // Fetch resolved tickets for current month to compute SLA compliance
    supabase
      .from("tickets")
      .select("assigned_operator_id, created_at, resolved_at, priority")
      .eq("status", "resolved")
      .gte(
        "resolved_at",
        new Date(
          new Date().getFullYear(),
          new Date().getMonth(),
          1
        ).toISOString()
      ),
  ]);

  // Parse SLA settings
  const slaThresholds = { urgent: 30, normal: 240 };
  let complianceTarget = 85;
  for (const row of slaRows ?? []) {
    if (row.key === "sla_urgency_threshold_minutes")
      slaThresholds.urgent = Number(row.value) || 30;
    if (row.key === "sla_normal_threshold_minutes")
      slaThresholds.normal = Number(row.value) || 240;
    if (row.key === "sla_compliance_target")
      complianceTarget = Number(row.value) || 85;
  }

  // Compute SLA compliance per operator
  const slaCompliance: Record<
    string,
    { compliant: number; total: number; percentage: number }
  > = {};

  for (const ticket of resolvedTickets ?? []) {
    const opId = ticket.assigned_operator_id;
    if (!opId || !ticket.resolved_at || !ticket.created_at) continue;

    if (!slaCompliance[opId]) {
      slaCompliance[opId] = { compliant: 0, total: 0, percentage: 0 };
    }

    slaCompliance[opId].total++;

    const resolveMs =
      new Date(ticket.resolved_at).getTime() -
      new Date(ticket.created_at).getTime();
    const resolveMin = resolveMs / 60000;
    const threshold =
      ticket.priority === "urgent"
        ? slaThresholds.urgent
        : slaThresholds.normal;

    if (resolveMin <= threshold) {
      slaCompliance[opId].compliant++;
    }
  }

  // Calculate percentages
  for (const entry of Object.values(slaCompliance)) {
    entry.percentage =
      entry.total > 0
        ? Math.round((entry.compliant / entry.total) * 100)
        : 0;
  }

  return (
    <LeaderboardClient
      individualLeaderboard={individualLeaderboard ?? []}
      teamLeaderboard={teamLeaderboard ?? []}
      currentUser={currentUser}
      slaCompliance={slaCompliance}
      complianceTarget={complianceTarget}
    />
  );
}
