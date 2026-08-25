import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Where every Supabase email link lands: signup confirmations and password
 * recovery both.
 *
 * Supabase hands the result back in one of three shapes, and which one you get
 * depends on the flow, so all three are handled here:
 *
 *   1. ?token_hash=&type=   the recommended server-side confirmation. Needs no
 *                           PKCE verifier, so it survives the link being opened
 *                           on a different device from the one that signed up.
 *   2. ?code=               the PKCE exchange. Needs the verifier cookie, so it
 *                           only works in the browser that started the flow.
 *   3. #access_token=       the implicit flow. The session comes back in the URL
 *                           fragment, which is never sent to a server — no
 *                           amount of reading searchParams will find it.
 *
 * Case 3 is what a signup confirmation actually produced, and reading only
 * case 2 is why confirmed accounts were being sent to the password-reset page:
 * the link had worked, this route just could not see that it had. A fragment
 * can only be read by the browser, so when the query string carries nothing
 * usable the last step is handed to the client rather than called a failure.
 */

/** `next` arrives in a URL, so an absolute or protocol-relative value would
    turn this into an open redirect. Only ever same-site paths. */
function safeNext(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/";
  return raw;
}

/** Where to send someone whose link did not work. A buyer confirming an
    account has no business on the dealer console's reset page — which is
    exactly where this used to send them. */
function failurePath(next: string): string {
  return next.startsWith("/admin")
    ? "/admin/forgot-password?expired=1"
    : "/account/sign-in?expired=1";
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const next = safeNext(searchParams.get("next"));
  const fail = () => NextResponse.redirect(`${origin}${failurePath(next)}`);

  // Supabase reports a spent or expired link in the query string.
  if (searchParams.get("error") || searchParams.get("error_code")) return fail();

  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  if (tokenHash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      type: type as "signup" | "recovery" | "email_change" | "invite" | "magiclink",
      token_hash: tokenHash,
    });
    if (!error) return NextResponse.redirect(`${origin}${next}`);
    return fail();
  }

  const code = searchParams.get("code");
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
    return fail();
  }

  // Nothing usable in the query string. Before calling that a failure, let the
  // browser look at the fragment — it is the one place a server cannot. The
  // hash is copied across explicitly rather than relying on browsers carrying
  // it through a redirect on their own.
  const finish = `${origin}/auth/confirm/finish?next=${encodeURIComponent(next)}`;
  const html = `<!doctype html><html lang="en-AU"><head><meta charset="utf-8">
<meta name="robots" content="noindex"><title>Confirming</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#f7f5f0;
font:400 16px/1.5 system-ui,sans-serif;color:#004438}</style></head>
<body><p>Confirming your account…</p>
<script>location.replace(${JSON.stringify(finish)} + location.hash);</script>
<noscript><p><a href="${finish}">Continue</a></p></noscript>
</body></html>`;

  return new NextResponse(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      // A one-time link's landing page must never be cached.
      "cache-control": "no-store",
    },
  });
}
