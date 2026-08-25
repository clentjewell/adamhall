# DD15 — Open Questions for Adam

**Client:** Adam Hall Buy My Car · **Artefact:** DD15 · **Phase:** Deploy
**Audience:** Internal (Jewell + Adam) · **Status:** Draft v02 · **Date:** 6 August 2026
**Author:** Rao · **Subject:** Car Marketplace, everything blocked on an answer from Adam

One list to take into the Adam conversation. Every item says what we need and
why it matters, so the decision is his to make with the stakes in front of him.
Grouped by who can answer and by risk, so the quick ones do not wait behind the
licensing ones. Nothing here blocks the build. All of it blocks launch, or is a
brand call we have made a start on and need him to confirm.

**Changed since v01 (three items closed):**
- The car-enquiry form now has an optional email field (was §1). Phone stays the
  lead, email is there for anyone who will not leave a number.
- The marketplace contact email is set to `adam@carmarketplace.com.au` (was in
  §5). Confirm it is live and watched — see §B.
- The dead phone number is gone from the saved content record, not just guarded
  in code (was §6). The site now shows and dials `0404 290 617` everywhere.

New this round: the colour and card decisions in §E, and the fuller brand
sign-off list in §D.

---

## A. Legal and compliance — these block a public launch

Each of these is live on the site right now as a bracketed placeholder. They
cannot ship as written, because each one is a claim a buyer or a regulator can
hold us to.

**A1. Motor dealer licence number.** The complaints page tells a buyer they can
escalate to fair trading using our licence number, and then does not give one.
Until Adam supplies it the page describes a right it cannot actually support.

**A2. Statutory warranty wording.** The FAQ entry a buyer is most likely to open,
"do you offer a warranty", is a placeholder pending legal review. Statutory
warranty on used cars is a real obligation in both NSW and QLD, and getting the
wording wrong is the kind of thing a regulator or a buyer reads back to you.

**A3. Deposit and holding policy.** What happens when someone wants to hold a car.
Left blank now, and it is the first question a serious buyer asks.

**A4. Finance model, and the comparison rate.** In-house or broker? The `/finance`
page describes shopping a loan to lenders and arrives with a rate pre-filled. The
answer decides whether that is allowed, and the comparison-rate wording has to be
confirmed against the real lender terms before any number is published. Full
detail and a seven-item list live in **DD14**. This is the one item that can
expose Adam personally, through the credit-licensing question, so it leads the
priority list.

**A5. Complaints escalation contacts.** The phone and website for NSW Fair Trading
and the QLD Office of Fair Trading. The complaints page needs them to be useful.

**A6. Business address.** A street address, or a clear "by appointment, we come to
you" with no public address. The contact page has a placeholder either way.

**A7. Trading hours.** Confirm the current Mon–Fri 8:30–5:30, Sat 8:30–2:00, Sun
closed is right. If a buyer turns up to a closed yard on our word, that is our
mistake to have avoided.

## B. Contact details — confirm, do not assume

**B1. Phone `0404 290 617`.** Confirm this is the one number to publish on both
the Marketplace and Adam's own site. It is now the single number everywhere, on
the call button, in the schema Google reads, and in the admin AI. One number
across both sites is the strongest single proof that they are one business, so it
has to be the right one.

**B2. Email `adam@carmarketplace.com.au`.** Confirm the inbox exists, is live, and
someone reads it. It is on the contact page and it is where a buyer who chooses
email over the phone will land.

## C. Content that has to be real, not placeholder

**C1. The star rating published as fact.** The site declares a 4.9 rating from 87
reviews, and that number is already in the structured data as an
`aggregateRating`, the field Google reads for the review stars in search results.
If the figures were typed in rather than counted from a real listing, this is
review markup Google cannot verify, and it treats fabricated review markup as a
manual-action offence that penalises the whole site. We need the real Google
Business Profile URL and its actual rating and count, or the rating comes out of
the schema until there is one. After the finance question this is the highest-risk
item on the list, and it is quicker to fix.

**C2. Buyer testimonials.** Every quote on the site today is from a seller ("I
would only sell to Adam", "the money was in my account the same day"). They are
real and good, and they are proof of the wrong thing on a page built for buyers.
The identity also lists Adam's personal selling promise among the claims the
Marketplace must not make as its own. The proof section is out of the homepage
rather than filled with buyer quotes nobody said. We need two or three real quotes
from people who bought a car, ideally naming the car and the suburb.

**C3. Photography.** The lifestyle and background images are AI-generated
placeholders. Every real asset in the set is Adam with a customer, which is why
the hero is a handover shot rather than the stock the identity asks for. Section
07 of the identity wants a one-page photography standard (fixed location, camera
height, lens, time of day, frames per car) before the listing library is shot.
Confirm the plan and who takes the photos.

## D. Brand identity sign-offs

The Car Marketplace Brand Identity document is still Edition 1, internal review.
Several values in it are marked "recommended" or "to confirm with Adam", which
means they are our best call, built in so a yes costs nothing and a no costs one
line. His confirmation is what turns them from proposal into standard.

**D1. Sand as the buy-side accent.** Marked "recommended, needs Adam's approval to
become part of the system". This is the big one, because it is the basis of the
colour work in §E. The paired rule is that lilac stays with Adam's parent brand
and does not appear on the Marketplace. A yes locks the buy side apart from the
parent while both keep the shared green.

**D2. The logo.** The cart mark is a placeholder: low-resolution raster, no vector
master. The identity says it must not be issued to a developer until the artwork
is signed off. We need Adam to approve the direction, then Liz to supply a proper
vector master and the full set (reverse, mono, icon, clear space). Separately, the
cart mark breaks the parent's sub-brand rule (swap the first word, keep the "my"
script and the speech bubble). Section 08 flags that as a deliberate departure
Adam should okay, not an accident.

**D3. Typeface.** The identity's primary sans is embedded as artwork in the logo
files and never named, so there is nothing to licence yet. The build uses a
stand-in matched to the parent. Naming and licensing the real family is a later
one-line change, but it is his call which family.

**D4. Brand values.** Honest first, Selected not stocked, A conversation, Local and
answerable. These were read off the existing site's behaviour, not authored with
Adam. Confirm they are the four, in his words, before they anchor copy.

**D5. Positioning, essence and tagline.** "Curated, not classified" as the essence,
and the positioning statement, are recommended. They shape how every page speaks,
so a nod now saves a rewrite later.

**D6. Print colours.** The CMYK and PMS values are screen-to-print conversions
only, and there is no PMS match for Sand yet. Nothing goes to print, signage or a
flyer as final until these are confirmed against a physical proof.

**D7. The name question (CQ11).** Whether the brand permanently carries Adam's
personal name is still open, and it sits underneath the logo and the wordmark
decisions. Worth a direction even if not a final answer.

## E. Colour and card decisions from this build round

We have made these changes on the branch and they are live on the preview. They
follow the identity, but they are visible and worth his eye, and one still needs a
decision.

**E1. Buttons are now sand, lilac is off the buy side.** The header call button and
the one primary action on each screen (see the cars, enquire, sell, get a
valuation) now use sand, which is exactly what the identity calls the buy-side
accent, "the one action that matters on each screen". Green leads structure and
navigation. Every lilac button is gone, because lilac belongs to the parent. This
is the visible half of D1, so approving the sand accent approves this.

**E2. The closing call-to-action band — one decision still open.** The band at the
bottom of the home page ("the good ones don't hang about") still sits on a lilac
background. By the identity the buy side leads green and lilac steps back to the
parent, so this band should be re-grounded to green with a sand button. It is the
last lilac surface touching a call to action. We have left it untouched pending a
yes, because putting a sand button on a lilac ground would look wrong.

**E3. Car cards are now borderless.** The car tiles used to carry a thin grey
outline that read as faint lines around each card. They now sit clean on the
cream, image and text, with a soft shadow lift on hover instead of a drawn line.
A small change, worth a look to confirm he likes the cleaner tile.

Everything else still carrying lilac is decorative only (small eyebrow labels,
icon bullets, testimonial stars, the valuation check badge), not a button. We have
held those pending Adam's yes on the sand direction rather than stripping the
parent's colour out unasked.

---

## Priority if the meeting is short

1. **Finance licensing (A4 / DD14)** — the only item that can expose Adam personally.
2. **The star rating (C1)** — cheap to fix, real penalty risk if it is not real.
3. **Statutory warranty and licence number (A2, A1)** — live legal claims.
4. **Sand accent, yes or no (D1 / E1, E2)** — unlocks the colour system and the last band.
5. **Buyer testimonials (C2)** — needed before the proof section can return.
6. Everything else.
