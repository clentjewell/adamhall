"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { notifier, emailTemplates } from "@/lib/notify";

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

/**
 * Where to land after signing in. It arrives from a query string, so it is
 * attacker-controlled: only same-site paths are honoured, and anything
 * absolute or protocol-relative ("//evil.example") falls back to the default.
 */
function safeNext(raw: FormDataEntryValue | null, fallback = "/saved"): string {
  const value = typeof raw === "string" ? raw.trim() : "";
  if (!value.startsWith("/") || value.startsWith("//")) return fallback;
  return value;
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

  // Adam hears about every other form on the site; registration used to be
  // the one that landed silently. Sent before the redirect below, because
  // redirect() throws and nothing after it runs.
  //
  // Wrapped so it can never fail the signup: the account already exists by
  // this point, and a mail provider having a bad morning must not show the
  // buyer an error for something that worked.
  const adminEmail = process.env.ADMIN_NOTIFY_EMAIL;
  if (adminEmail) {
    try {
      const origin = await requestOrigin();
      const t = emailTemplates.buyerRegistered({
        adminEmail,
        name: fullName,
        email,
        phone: value("phone") || null,
        suburb: value("suburb") || null,
        postcode: value("postcode") || null,
        heardAbout: heardAbout || null,
        buyersUrl: origin ? `${origin}/admin/buyers` : undefined,
      });
      await notifier.sendEmail({ to: t.to, subject: t.subject, html: t.html });
    } catch (err) {
      console.error("registerBuyer: admin notify failed:", err);
    }
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
  // Back to whatever sent them here — /account when they tried to open the
  // account page signed out — and the shortlist otherwise.
  redirect(safeNext(formData.get("next")));
}

/**
 * Edits the buyer's own profile. RLS restricts the update to their own row,
 * so this cannot be turned into a way to edit anyone else's.
 *
 * Email is deliberately not editable here: changing it means re-confirming
 * the address through Supabase, which is a different flow with its own
 * emails, not a field on a details form.
 */
export async function updateBuyerProfile(
  _prev: AccountActionState,
  formData: FormData,
): Promise<AccountActionState> {
  const value = (k: string) => String(formData.get(k) ?? "").trim();

  const fullName = value("full_name");
  const heardAbout = value("heard_about");
  if (!fullName) return { ok: false, error: "What should we call you?" };
  if (heardAbout && !HEARD_ABOUT.includes(heardAbout as (typeof HEARD_ABOUT)[number])) {
    return { ok: false, error: "Pick one of the options for how you found us." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You're signed out. Sign in and try again." };

  const { error } = await supabase
    .from("buyer_profiles")
    .update({
      full_name: fullName,
      phone: value("phone") || null,
      suburb: value("suburb") || null,
      postcode: value("postcode") || null,
      heard_about: heardAbout || null,
    })
    .eq("id", user.id);
  if (error) {
    console.error("updateBuyerProfile:", error.message);
    return { ok: false, error: "Couldn't save that. Please try again." };
  }

  // The header greets people from the auth record rather than the profile
  // table, so it has to be updated too or the name goes stale up there.
  await supabase.auth.updateUser({ data: { full_name: fullName } });

  revalidatePath("/account");
  return { ok: true };
}

/**
 * Emails a buyer a link to set a new password.
 *
 * The outcome is deliberately not reported: answering differently for an
 * address that has an account would turn this form into a way to test whether
 * a given person is a customer here. Supabase replies the same either way,
 * and so does the page.
 *
 * The link lands on /auth/confirm, which signs them in and forwards them to
 * the ordinary change-password page — the same one a signed-in buyer uses, so
 * there is one form rather than two that drift apart.
 */
export async function requestBuyerPasswordReset(
  _prev: AccountActionState,
  formData: FormData,
): Promise<AccountActionState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { ok: false, error: "Enter your email address." };

  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${await requestOrigin()}/auth/confirm?next=/account/password`,
  });
  return { ok: true };
}

/**
 * Changes the password of the signed-in buyer.
 *
 * There is no "current password" field: Supabase authenticates the change
 * with the session itself, and asking for a password we then cannot verify
 * would be theatre. The account's own sign-in is what protects this.
 */
export async function updateBuyerPassword(
  _prev: AccountActionState,
  formData: FormData,
): Promise<AccountActionState> {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  // The same 10 characters registerBuyer asks for, so the rule does not
  // change depending on which form you are standing in front of.
  if (password.length < 10) {
    return { ok: false, error: "Use at least 10 characters." };
  }
  if (password !== confirm) {
    return { ok: false, error: "The two passwords do not match." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You're signed out. Sign in and try again." };

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function signOutBuyer(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
