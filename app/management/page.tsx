import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Dashboard from "./dashboard";

const MANAGEMENT_ROLES = [
  "staff",
  "manager",
  "administrator",
  "super_admin",
];

export default async function ManagementPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/member/login?redirect=/management");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select(`
      id,
      full_name,
      display_name,
      email,
      role,
      status
    `)
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    redirect("/");
  }

  if (profile.status !== "active") {
    redirect("/");
  }

  if (!MANAGEMENT_ROLES.includes(profile.role)) {
    redirect("/");
  }

  return (
    <Dashboard
      userId={user.id}
      profile={{
        full_name: profile.full_name,
        display_name: profile.display_name,
        email: profile.email ?? user.email ?? null,
        role: profile.role,
      }}
    />
  );
}