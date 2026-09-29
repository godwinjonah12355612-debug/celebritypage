import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import MessagesClient from "./messages-client";

const MANAGEMENT_ROLES = [
  "staff",
  "manager",
  "administrator",
  "super_admin",
];

export default async function ManagementMessagesPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("MANAGEMENT MESSAGES USER ERROR:", userError);

    redirect("/member/login?redirect=/management/messages");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, status")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    console.error("MANAGEMENT MESSAGES PROFILE ERROR:", profileError);

    redirect("/");
  }

  if (profile.status !== "active") {
    redirect("/");
  }

  if (!MANAGEMENT_ROLES.includes(profile.role)) {
    redirect("/");
  }

  return (
    <MessagesClient
      userId={user.id}
      profile={{
        role: profile.role,
      }}
    />
  );
}