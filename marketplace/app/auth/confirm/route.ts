import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Where Supabase's recovery links land.
 *
 * The link carries a one-time code that has to be exchanged for a session
 * before a new password can be set, and that exchange writes auth cookies —
 * which a Server Component cannot do reliably, so it happens here in a Route
 * Handler.
 *
 * It sits outside /admin on purpose. The middleware bounces signed-out
 * requests off /admin, and at the moment this runs the visitor is, by
 * definition, not signed in yet.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/admin";
  // Only ever redirect back into this site: `next` arrives in a URL, so an
  // absolute or protocol-relative value would make this an open redirect.
  const target = next.startsWith("/") && !next.startsWith("//") ? next : "/admin";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${target}`);
  }

  // Expired, already used, or the user landed here without a code.
  return NextResponse.redirect(`${origin}/admin/forgot-password?expired=1`);
}
