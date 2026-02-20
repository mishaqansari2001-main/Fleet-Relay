import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DriversClient } from "./drivers-client";

export default async function DriversPage() {
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

  // Parallel fetch all driver page data
  const [{ data: drivers }, { data: ticketCounts }, { data: noteCounts }] =
    await Promise.all([
      supabase
        .from("drivers")
        .select("*")
        .order("last_seen_at", { ascending: false }),
      supabase.from("tickets").select("driver_id, status"),
      supabase.from("driver_notes").select("driver_id"),
    ]);

  const driverMap = new Map<string, { total: number; open: number }>();
  for (const t of ticketCounts ?? []) {
    if (!t.driver_id) continue;
    const existing = driverMap.get(t.driver_id) ?? { total: 0, open: 0 };
    existing.total++;
    if (t.status === "open" || t.status === "in_progress") {
      existing.open++;
    }
    driverMap.set(t.driver_id, existing);
  }

  const noteMap = new Map<string, number>();
  for (const n of noteCounts ?? []) {
    noteMap.set(n.driver_id, (noteMap.get(n.driver_id) ?? 0) + 1);
  }

  const enrichedDrivers = (drivers ?? []).map((d) => ({
    ...d,
    ticket_count: driverMap.get(d.id)?.total ?? 0,
    open_ticket_count: driverMap.get(d.id)?.open ?? 0,
    note_count: noteMap.get(d.id) ?? 0,
  }));

  return <DriversClient drivers={enrichedDrivers} currentUser={currentUser} />;
}
