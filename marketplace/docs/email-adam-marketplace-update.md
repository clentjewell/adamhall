# Email draft: Car Marketplace update for Adam

Send from: clent@jewellprojects.com
To: Adam Hall

---

**Subject:** Car Marketplace update, and three things I need from you

Hi Adam,

The Car Marketplace site has moved a fair way this week. Have a click through
when you get ten minutes:

https://claude-carmarketplace-link-update-ccc0p2-adamhall-marketplace.clent.workers.dev

**Cars for Sale is now The Marketplace.** The name runs across the nav, the
page and the home section. It reads like a place rather than a list, and it
gives the buying side its own identity next to Buy My Car.

**Your stock drifts across the home page.** Every published car rolls right to
left, and it stops when someone hovers or tabs into it. A visitor sees six or
seven cars before they scroll, instead of three.

**Sold cars have their own section.** They used to sit in the same grid as the
cars people can buy, so every third card was a dead end. They now sit under
"Recently sold" below the live stock, and they stay for a month. Buyers still
see what moves and what it went for.

**Buyers can make an account.** Someone can save a few cars on their phone at
your yard and open the same shortlist on the laptop that night. We ask for a
name, an email and a password. Phone, suburb, postcode and how they found you
are optional, and the form says so.

Two things I left out on purpose. There is no date of birth, because nothing
on the buying side uses one and finance asks for it at the point it matters.
There is no street address, because a person browsing cars has no reason to
hand one over. Suburb and postcode tell us how far someone sits from a car
without holding an address for nothing.

One bit worth watching: "how did you find us" is a fixed list rather than a
text box, so you can count it. Within a month or two you will see how much of
the buying side comes off your 4CRB segment.

**We rebuilt the valuation page.** The photo used to fill the whole screen, so
the tool sat under the fold and people had to scroll before they could start.
It is a band now and the form is the first thing you see. Condition is one
slider rather than four boxes, and it starts blank so the page never guesses
at the car for the seller. Once a range appears, the odometer slider sits next
to the number and the range follows as they wind the kilometres up and down.

**Your own site.** The Cars for Sale page has come off the Buy My Car preview,
which is right: one site buys cars and the other sells them, and two lists of
cars on two sites confuses both jobs.

Two things about that are still open, and I have put them in the list below.

---

**Three things I need from you**

**1. The shared password.** You, Ronnie and I all sign in to the dealer console
with the same one. That was fine to get us moving and it is not fine to keep,
because the console records who changed a price and a shared password makes
that record worthless. Pick your own and I will set it, or I can send you a
reset link.

**2. The domain.** carmarketplace.com.au does not resolve yet. Everything you
are looking at sits on a preview address, and Google will not index it while
it does. Once you point the domain at us I need about half an hour to switch
the settings over.

**3. Where "Cars for Sale" should send people on your site.** Taking the page
off was right, but nothing on the Buy My Car preview links through to the
Marketplace at the moment, so a seller who wants to look at cars has nowhere to
go. My suggestion is a "Cars for sale" item in your nav pointing straight at
the Marketplace home page. Say the word and I will put it in.

One more note on your site while you are looking. The live version still has
the old Cars for Sale page and links out to a stale test address that will stop
working. I will tidy that when we ship the change above.

Give me a ring if any of it needs talking through.

Clent

---

## Notes for Clent, not for sending

Checked before drafting:

- The Buy My Car preview at `ef49eb70-adamhall-buymycar.clent.workers.dev` has
  no `/cars-for-sale` route and no link to the Marketplace anywhere in its
  bundle. The page removal is done; the replacement link is not.
- The live site at `adamhall-buymycar.clent.workers.dev` still carries the
  "Cars for Sale" nav item and points at
  `carmarketplace-domain-split-vgokd1-...workers.dev`, a branch preview that
  will disappear.
- `carmarketplace.com.au` does not resolve.
- All three console accounts share `bmc2026`.
