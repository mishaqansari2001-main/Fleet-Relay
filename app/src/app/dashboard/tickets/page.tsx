import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TicketsClient } from "./tickets-client";

export default async function TicketsPage() {
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

  // Parallel fetch all ticket page data + SLA settings + drivers
  const [
    { data: tickets },
    { data: operators },
    { data: scoreCategories },
    { data: slaRows },
    { data: drivers },
  ] = await Promise.all([
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
      .order("created_at", { ascending: false }),
    supabase
      .from("users")
      .select("id, full_name")
      .eq("status", "active")
      .in("role", ["operator", "admin"])
      .order("full_name"),
    supabase
      .from("score_categories")
      .select("id, name, points")
      .eq("is_active", true)
      .order("points", { ascending: false }),
    supabase
      .from("settings")
      .select("key, value")
      .in("key", [
        "sla_urgency_threshold_minutes",
        "sla_normal_threshold_minutes",
      ]),
    supabase
      .from("drivers")
      .select("id, first_name, last_name, username, phone_number")
      .order("first_name"),
  ]);

  const slaThresholds = { urgent: 30, normal: 240 };
  for (const row of slaRows ?? []) {
    if (row.key === "sla_urgency_threshold_minutes")
      slaThresholds.urgent = Number(row.value) || 30;
    if (row.key === "sla_normal_threshold_minutes")
      slaThresholds.normal = Number(row.value) || 240;
  }

  return (
    <TicketsClient
      tickets={tickets ?? []}
      operators={operators ?? []}
      scoreCategories={scoreCategories ?? []}
      currentUser={currentUser}
      slaThresholds={slaThresholds}
      drivers={drivers ?? []}
    />
  );
}
