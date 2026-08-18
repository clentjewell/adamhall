import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import {
  ArrowSquareOut,
  Bank,
  ChatCircleText,
  Heart,
  Lock,
  Phone,
  Scales,
  UserCircle,
} from "@phosphor-icons/react/dist/ssr";
import { requireBuyer } from "@/lib/buyer";
import { parentUrl } from "@/lib/brand";
import { site } from "@/lib/site-data/site";
import { signOutBuyer } from "@/app/actions/account";

export const metadata: Metadata = {
  title: "Your account",
  robots: { index: false, follow: false },
};

// Signed-in state decides what this page is, so it can never be prerendered.
export const dynamic = "force-dynamic";

/**
 * The account hub: one page that names everything the buyer's account can do
 * and sends them off to it, in the pattern people already know from the big
 * retail sites.
 *
 * It is a directory, not a dashboard. Nothing here is editable in place —
 * each tile owns its own page — because a hub that half-edits things is where
 * you end up with two ways to change a phone number.
 *
 * What is deliberately absent: orders, payments and addresses. This yard
 * takes no money online and holds nothing, so tiles for them would be
 * furniture promising a checkout that does not exist.
 */

interface Tile {
  href: string;
  external?: boolean;
  icon: React.ComponentType<{ size?: number; weight?: "bold" | "fill" | "regular" }>;
  title: string;
  body: string;
}

export default async function AccountPage() {
  const buyer = await requireBuyer("/account");

  const tiles: Tile[] = [
    {
      href: "/saved",
      icon: Heart,
      title: "Your saved cars",
      body: "The shortlist you have kept, on whichever device you signed in from.",
    },
    {
      href: "/compare",
      icon: Scales,
      title: "Compare cars",
      body: "Put up to three side by side and see where they actually differ.",
    },
    {
      href: "/account/enquiries",
      icon: ChatCircleText,
      title: "Your enquiries",
      body: "The cars you have asked about, and where each one got to.",
    },
    {
      href: "/account/details",
      icon: UserCircle,
      title: "Your details",
      body: "Name, phone and where you are, so Adam can get back to you properly.",
    },
    {
      href: "/account/password",
      icon: Lock,
      title: "Password",
      body: "Change the password you use to sign in.",
    },
    {
      href: "/finance",
      icon: Bank,
      title: "Finance calculator",
      body: "Work out what a car costs a week before you ring about it.",
    },
    {
      href: parentUrl("/buy-my-car", "marketplace-account"),
      external: true,
      icon: ArrowSquareOut,
      title: "Sell your car",
      body: "Adam buys as well as sells. Send yours over for a price.",
    },
  ];

  return (
    <div className="page-shell section-y">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="helper">Your account</p>
          <h1 className="type-hero mt-1">Hello, {buyer.firstName}</h1>
          <p className="type-lead mt-3 max-w-[52ch] text-stone-600">
            Everything your account keeps hold of, in one place.
          </p>
        </div>
        {/* A server action, so signing out clears the cookie server-side
            rather than only emptying the browser's copy of the session. */}
        <form action={signOutBuyer}>
          <button type="submit" className="btn-secondary text-sm">
            Sign out
          </button>
        </form>
      </div>

      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 list-none p-0">
        {tiles.map(({ href, external, icon: Icon, title, body }) => {
          const inner = (
            <>
              <Icon size={26} weight="bold" />
              <span className="block">
                <span className="block type-card-title text-ink transition-colors duration-[120ms] group-hover:text-forest-700">
                  {title}
                </span>
                <span className="mt-1.5 block text-sm text-stone-600">{body}</span>
              </span>
            </>
          );
          const className =
            "card flex h-full items-start gap-4 p-5 text-forest-600 no-underline transition-[translate,box-shadow] duration-200 group hover:-translate-y-0.5 hover:shadow-lg hover:shadow-stone-300/50";
          return (
            <li key={href}>
              {external ? (
                <a href={href} className={className}>
                  {inner}
                </a>
              ) : (
                <Link href={href} className={className}>
                  {inner}
                </Link>
              )}
            </li>
          );
        })}
      </ul>

      {/* The point of the whole site is that a person answers the phone, so
          the account page says so rather than leaving a contact form as the
          only way through. */}
      <div className="card mt-6 flex flex-wrap items-center justify-between gap-4 p-5">
        <p className="flex items-center gap-3 text-sm text-stone-600">
          <Phone size={22} weight="bold" className="shrink-0 text-forest-600" />
          Something not right, or a question about a car? Ring Adam direct.
        </p>
        <a href={site.phoneHref} className="btn-cta text-sm">
          {site.phoneDisplay}
        </a>
      </div>
    </div>
  );
}
