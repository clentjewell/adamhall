"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface AccountActionState {
  ok: boolean;
  error?: string;
  /** Set when the account is made but the email still needs confirming. */
  checkInbox?: boolean;
}

/** Where Supabase should send confirmation and recovery links back to. Read
    off the request so a preview deployment confirms to itself rather than
    sending the buyer to production. */
async function requestOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  return host ? `${proto}://${host}` : (process.env.NEXT_PUBLIC_SITE_URL ?? "");
}

/** The set the buyer_profiles check constraint allows. Kept in step with
    the migration; anything else is rejected rather than silently dropped. */
const HEARD_ABOUT = [
  "radio",
  "google",
  "social",
  "friend",
  "returning",
  "other",
] as const;

export async function registerBuyer(
  _prev: AccountActionState,
  formData: FormData,
): Promise<AccountActionState> {
  const value = (k: string) => String(formData.get(k) ?? "").trim();

  const fullName = value("full_name");
  const email = value("email");
  const password = String(formData.get("password") ?? "");
  const heardAbout = value("heard_about");

  if (!fullName) return { ok: false, error: "What should we call you?" };
  if (!email) return { ok: false, error: "We need an email address." };
  if (password.length < 10) {
    return { ok: false, error: "Use at least 10 characters for your password." };
  }
  if (heardAbout && !HEARD_ABOUT.includes(heardAbout as (typeof HEARD_ABOUT)[number])) {
    return { ok: false, error: "Pick one of the options for how you found us." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${await requestOrigin()}/auth/confirm?next=/saved`,
      // The trigger on auth.users copies these onto buyer_profiles, so the
      // profile exists from the moment the account does, whatever happens to
      // this request afterwards.
      data: {
        full_name: fullName,
        phone: value("phone"),
        suburb: value("suburb"),
        postcode: value("postcode"),
        heard_about: heardAbout,
      },
    },
  });

  if (error) {
    // Supabase's own wording here is reasonable and specific ("Password is
    // too weak", "Unable to validate email address"), so it is passed
    // through rather than flattened into one message.
    return { ok: false, error: error.message };
  }

  // With email confirmation on, signUp returns a user but no session. Saying
  // so is the honest thing: the account exists, it just is not usable yet.
  if (!data.session) return { ok: true, checkInbox: true };

  redirect("/saved");
}

export async function signInBuyer(
  _prev: AccountActionState,
  formData: FormData,
): Promise<AccountActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) {
    return { ok: false, error: "Email and password, please." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  // Deliberately one message for both a wrong password and an address with
  // no account: saying which would let anyone test whether a given person
  // has an account here.
  if (error) return { ok: false, error: "Wrong email or password." };
  redirect("/saved");
}

export async function signOutBuyer(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
