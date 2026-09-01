import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// The buy-side sibling of lib/admin.ts. Same shape, different bar: a buyer
// needs a session and nothing more, where an admin needs a session *and* a row
// in admin_users. Keeping the two checks in separate modules stops them being
// mistaken for each other at a call site.

export interface Buyer {
  id: string;
  email: string;
  fullName: string;
  firstName: string;
  phone: string | null;
  suburb: string | null;
  postcode: string | null;
  heardAbout: string | null;
}

/**
 * The signed-in buyer, or null. Never redirects — use where the page renders
 * either way.
 *
 * Reads buyer_profiles, which the signup trigger fills, and falls back to the
 * auth record's metadata. A session can outlive a profile row (an account made
 * before the trigger existed, or a row deleted by hand), and losing your name
 * is not a reason to be treated as signed out.
 */
export async function getBuyer(): Promise<Buyer | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("buyer_profiles")
    .select("full_name, phone, suburb, postcode, heard_about")
    .eq("id", user.id)
    .maybeSingle();

  const meta = user.user_metadata ?? {};
  const metaString = (key: string) =>
    typeof meta[key] === "string" && meta[key] ? (meta[key] as string) : null;

  const fullName = profile?.full_name ?? metaString("full_name") ?? "";

  return {
    id: user.id,
    email: user.email ?? "",
    fullName,
    // First word only, for greetings. Falls back to the email's local part so
    // a profile-less account still gets addressed as something.
    firstName: fullName.trim().split(/\s+/)[0] || (user.email ?? "").split("@")[0],
    phone: profile?.phone ?? metaString("phone"),
    suburb: profile?.suburb ?? metaString("suburb"),
    postcode: profile?.postcode ?? metaString("postcode"),
    heardAbout: profile?.heard_about ?? metaString("heard_about"),
  };
}

/**
 * Requires a signed-in buyer, sending them to sign in if they are not, with
 * `next` so they land back where they were headed.
 */
export async function requireBuyer(next: string): Promise<Buyer> {
  const buyer = await getBuyer();
  if (!buyer) redirect(`/account/sign-in?next=${encodeURIComponent(next)}`);
  return buyer;
}
