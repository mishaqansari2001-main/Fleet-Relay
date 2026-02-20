import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TicketDetailClient } from "./ticket-detail-client";

interface TicketDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function TicketDetailPage({ params }: TicketDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) redirect("/login");

  // Fetch profile and ticket in parallel (both needed before continuing)
  const [{ data: profile }, { data: ticket }] = await Promise.all([
    supabase
      .from("users")
      .select("id, full_name, email, role")
      .eq("id", authUser.id)
      .single(),
    supabase
      .from("tickets")
      .select(
        `
        *,
        driver:drivers!tickets_driver_id_fkey(id, first_name, last_name, username, telegram_user_id, first_seen_at, last_seen_at),
        assigned_operator:users!tickets_assigned_operator_id_fkey(id, full_name, email),
        score_category:score_categories!tickets_score_category_id_fkey(id, name, points),
        held_by:users!tickets_held_by_id_fkey(id, full_name)
      `
      )
      .eq("id", id)
      .single(),
  ]);

  if (!profile) redirect("/login");
  if (!ticket) notFound();

  const currentUser = {
    id: profile.id,
    full_name: profile.full_name,
    email: profile.email,
    role: profile.role as "admin" | "operator",
  };

  // Fetch remaining data in parallel (all depend on ticket.driver_id)
  const [
    { data: messages },
    { data: scoreCategories },
    { data: driverNotes },
    { count: driverTicketCount },
  ] = await Promise.all([
    supabase
      .from("ticket_messages")
      .select("*")
      .eq("ticket_id", id)
      .order("created_at", { ascending: true }),
    supabase
      .from("score_categories")
      .select("id, name, points")
      .eq("is_active", true)
      .order("points", { ascending: false }),
    supabase
      .from("driver_notes")
      .select("id, content, created_at, author_id")
      .eq("driver_id", ticket.driver_id!)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("tickets")
      .select("id", { count: "exact", head: true })
      .eq("driver_id", ticket.driver_id!),
  ]);

  return (
    <TicketDetailClient
      ticket={ticket as unknown as Parameters<typeof TicketDetailClient>[0]["ticket"]}
      messages={messages ?? []}
      scoreCategories={scoreCategories ?? []}
      driverNotes={(driverNotes ?? []) as Parameters<typeof TicketDetailClient>[0]["driverNotes"]}
      driverTicketCount={driverTicketCount ?? 0}
      currentUser={currentUser}
    />
  );
}
