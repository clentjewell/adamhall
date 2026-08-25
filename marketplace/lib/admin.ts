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

/** A JSON error body, which is what the admin API routes answer with. */
export function apiError(status: number, message: string): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export type AdminApiGate =
  | { ok: true; supabase: Awaited<ReturnType<typeof createClient>>; userId: string }
  | { ok: false; response: Response };

/**
 * The same session + allowlist check as requireAdmin, for the admin API
 * routes: a fetch from the console wants a status it can show the dealer, not
 * a redirect to the login page it cannot follow.
 */
export async function requireAdminApi(): Promise<AdminApiGate> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, response: apiError(401, "Not signed in.") };

  const { data: adminRow } = await supabase
    .from("admin_users")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();
  if (!adminRow) return { ok: false, response: apiError(403, "Not authorised.") };

  return { ok: true, supabase, userId: user.id };
}
