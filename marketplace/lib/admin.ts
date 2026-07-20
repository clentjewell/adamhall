import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface AdminContext {
  supabase: Awaited<ReturnType<typeof createClient>>;
  userId: string;
  email: string;
  name: string;
}

// Every admin page and action goes through this. Auth session + allowlist
// row required; RLS enforces the same thing at the data layer.
export async function requireAdmin(): Promise<AdminContext> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: adminRow } = await supabase
    .from("admin_users")
    .select("email, name")
    .eq("id", user.id)
    .maybeSingle();
  if (!adminRow) redirect("/admin/login?denied=1");

  return {
    supabase,
    userId: user.id,
    email: adminRow.email,
    name: adminRow.name ?? adminRow.email,
  };
}
