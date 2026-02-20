import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SettingsClient } from "./settings-client";

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("id, full_name, email, role")
    .eq("id", authUser.id)
    .single();

  if (!profile || profile.role !== "admin") {
    redirect("/dashboard");
  }

  // Parallel fetch all settings page data
  const [
    { data: settings },
    { data: users },
    { data: teams },
    { data: scoreCategories },
    { data: scoreUsage },
  ] = await Promise.all([
    supabase.from("settings").select("*"),
    supabase
      .from("users")
      .select("*, team:teams(id, name)")
      .order("created_at", { ascending: false }),
    supabase.from("teams").select("*").order("name"),
    supabase
      .from("score_categories")
      .select("*")
      .order("points", { ascending: false }),
    supabase.from("score_entries").select("score_category_id"),
  ]);

  const usageCounts: Record<string, number> = {};
  (scoreUsage ?? []).forEach((entry) => {
    usageCounts[entry.score_category_id] =
      (usageCounts[entry.score_category_id] || 0) + 1;
  });

  const teamMemberCounts: Record<string, number> = {};
  (users ?? []).forEach((user) => {
    if (user.team_id && user.status === "active") {
      teamMemberCounts[user.team_id] =
        (teamMemberCounts[user.team_id] || 0) + 1;
    }
  });

  return (
    <SettingsClient
      settings={settings ?? []}
      users={users ?? []}
      teams={teams ?? []}
      scoreCategories={scoreCategories ?? []}
      scoreCategoryUsage={usageCounts}
      teamMemberCounts={teamMemberCounts}
    />
  );
}
