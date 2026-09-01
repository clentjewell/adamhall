import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// The only /admin pages a signed-out visitor may see. /admin/reset-password
// is not among them by design: the recovery link signs the visitor in before
// sending them there, so arriving without a session means the link was spent
// or faked, and the bounce to login is the right answer.
const PUBLIC_ADMIN_PATHS = new Set(["/admin/login", "/admin/forgot-password"]);

// The only paths that read a Supabase session. The matcher below now covers
// the whole site so the preview lock can sit in front of it, and refreshing a
// token on the FAQ page would put a network round-trip on every request.
const SESSION_PATHS = ["/admin", "/admin-old", "/account"];

// ---------------------------------------------------------------------------
// Preview lock
//
// The real domain is connected but the site is not being announced yet, so the
// whole origin sits behind HTTP Basic auth.
//
// Basic auth rather than a login page, deliberately: it costs one header, it
// covers every route including the API, robots.txt and the sitemap, and it
// keeps crawlers out with a 401 instead of trusting them to honour a
// directive. A Next.js page would leave the API and the feeds open.
//
// Keyed off an environment variable, not a constant, so going live is
// `wrangler secret delete SITE_LOCK_PASSWORD` plus a redeploy — no diff to
// review and nothing anyone has to remember to revert. No password set means
// the site is open, which is the correct end state.
// ---------------------------------------------------------------------------
const LOCK_USER = process.env.SITE_LOCK_USER || "preview";

// Length-independent comparison. Overkill for a staging gate, but it is four
// lines and it means the password cannot be recovered a character at a time
// by timing the response.
function equal(a: string, b: string): boolean {
  const enc = new TextEncoder();
  const x = enc.encode(a);
  const y = enc.encode(b);
  let diff = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) {
    diff |= (x[i] ?? 0) ^ (y[i] ?? 0);
  }
  return diff === 0;
}

function isUnlocked(request: NextRequest): boolean {
  const password = process.env.SITE_LOCK_PASSWORD;
  if (!password) return true;

  const header = request.headers.get("authorization");
  if (!header?.startsWith("Basic ")) return false;

  let decoded: string;
  try {
    decoded = atob(header.slice(6).trim());
  } catch {
    return false;
  }

  // Split on the FIRST colon only: a password may legitimately contain one.
  const split = decoded.indexOf(":");
  if (split < 0) return false;

  return (
    equal(decoded.slice(0, split), LOCK_USER) &&
    equal(decoded.slice(split + 1), password)
  );
}

function challenge(): NextResponse {
  return new NextResponse("Not open to the public yet.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Car Marketplace", charset="UTF-8"',
      // Never let an edge or a browser hold on to the challenge, or removing
      // the password later would leave people locked out of a live site.
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}

export async function middleware(request: NextRequest) {
  if (!isUnlocked(request)) return challenge();

  const { pathname } = request.nextUrl;

  const needsSession = SESSION_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
  if (!needsSession) return NextResponse.next();

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: { name: string; value: string; options: CookieOptions }[],
        ) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // `startsWith("/admin")` covers /admin-old too, which is intended: the old
  // console is kept for comparison and should not be readable signed out.
  if (pathname.startsWith("/admin") && !PUBLIC_ADMIN_PATHS.has(pathname) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }
  if (pathname === "/admin/login" && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  return response;
}

// Everything, so the lock is genuinely in front of the whole site — pages,
// API routes, robots.txt, the sitemap and the files in /public alike. The two
// exclusions are Next's own immutable build output: those URLs carry a content
// hash, they are useless without the HTML that references them, and running a
// check on each one would tax every page load. The session work above is
// narrowed by SESSION_PATHS, so widening this costs nothing on the pages that
// never touch Supabase.
export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
