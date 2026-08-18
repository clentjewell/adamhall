import { requireBuyer } from "@/lib/buyer";
import { parentUrl } from "@/lib/brand";
import { site } from "@/lib/site-data/site";
import { signOutBuyer } from "@/app/actions/account";
import AccountTabs from "@/components/account/AccountTabs";
import { Phone } from "@phosphor-icons/react/dist/ssr";

/**
 * The signed-in account: a rail of vertical tabs on the left, the chosen
 * panel on the right.
 *
 * It sits in a route group so sign-in, register and forgot-password stay
 * outside it — those are for people who are not signed in, and wrapping them
 * in an account rail would be showing tabs to somebody with no account.
 *
 * requireBuyer runs once here rather than in each page, so a new tab cannot
 * be added without the guard.
 */
export default async function AccountHubLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const buyer = await requireBuyer("/account");

  return (
    <div className="page-shell section-y">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="helper">Your account</p>
          <h1 className="type-hero mt-1">Hello, {buyer.firstName}</h1>
        </div>
        {/* A server action, so signing out clears the cookie server-side
            rather than only emptying the browser's copy of the session. */}
        <form action={signOutBuyer}>
          <button type="submit" className="btn-secondary text-sm">
            Sign out
          </button>
        </form>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)]">
        <AccountTabs sellUrl={parentUrl("/buy-my-car", "marketplace-account")} />
        <div className="min-w-0">{children}</div>
      </div>

      {/* The point of the whole site is that a person answers the phone, so
          it stays in view whichever tab you are on. */}
      <div className="card mt-8 flex flex-wrap items-center justify-between gap-4 p-5">
        <p className="flex items-center gap-3 text-sm text-stone-600">
          <Phone size={22} weight="bold" className="shrink-0 text-forest-600" />
          Something not right, or a question about a car? Ring Adam direct.
        </p>
        {/* Not target="_blank": a tel: link hands off to the phone app, and on
            a desktop a new tab would just sit there empty. */}
        <a href={site.phoneHref} className="btn-cta text-sm">
          {site.phoneDisplay}
        </a>
      </div>
    </div>
  );
}
