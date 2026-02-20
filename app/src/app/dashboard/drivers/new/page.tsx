import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NewDriverClient } from "./new-driver-client";

export default async function NewDriverPage() {
  const supabase = await createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("id, full_name, role")
    .eq("id", authUser.id)
    .single();

  if (!profile) redirect("/login");

  return <NewDriverClient />;
}
