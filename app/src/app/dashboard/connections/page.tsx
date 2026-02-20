import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ConnectionsClient } from "./connections-client";

export default async function ConnectionsPage() {
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

  // Parallel fetch: connections + tickets for counting
  const [{ data: connections }, { data: tickets }] = await Promise.all([
    supabase
      .from("telegram_connections")
      .select("*")
      .order("connection_type")
      .order("created_at", { ascending: true }),
    supabase
      .from("tickets")
      .select("id, source_type, business_connection_id, source_chat_id, created_at"),
  ]);

  // Compute ticket counts and last activity per connection
  const ticketCounts: Record<string, number> = {};
  const lastActivity: Record<string, string> = {};

  (connections ?? []).forEach((conn) => {
    const matchingTickets = (tickets ?? []).filter((t) => {
      if (conn.connection_type === "business_account") {
        return t.business_connection_id === conn.business_connection_id;
      }
      return t.source_chat_id === conn.chat_id;
    });

    ticketCounts[conn.id] = matchingTickets.length;

    if (matchingTickets.length > 0) {
      const sorted = matchingTickets.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      lastActivity[conn.id] = sorted[0].created_at;
    }
  });

  return (
    <ConnectionsClient
      connections={connections ?? []}
      ticketCounts={ticketCounts}
      lastActivity={lastActivity}
    />
  );
}
