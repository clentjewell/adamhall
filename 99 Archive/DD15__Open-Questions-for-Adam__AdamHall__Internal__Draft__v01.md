# DD15 — Open Questions for Adam

**Client:** Adam Hall Buy My Car · **Artefact:** DD15 · **Phase:** Deploy
**Audience:** Internal (Jewell + Adam) · **Status:** Draft v01 · **Date:** 4 August 2026
**Author:** Rao · **Subject:** Car Marketplace, everything blocked on an answer from Adam

One list to take into the Adam conversation. Grouped by who can answer, so the
easy ones do not wait behind the licensing ones. Nothing here is blocking the
build; all of it is blocking launch.

---

## 1. The enquiry form on a car listing

**The question:** to ask a question about a car, a buyer has to give a name and a
phone number. Both are required. There is no email field at all
(`components/EnquiryForm.tsx:57-62`).

That is a deliberate-looking choice and it may be exactly right: every enquiry
becomes a lead Adam can ring back, which suits a business built on a
conversation rather than a form. It also means someone who wants to ask one
question, "has it got a tow bar", has to hand over their phone number to ask it.
Some of them will not, and Adam never hears from them.

**Three options:**

| | Change | Effect |
|---|---|---|
| A | Leave it. Name and phone required | Every enquiry is contactable. Fewer enquiries |
| B | Add an optional email field | Buyers who will not give a phone number can still ask. Some leads become email-only |
| C | Make phone optional, require email instead | Lowest barrier to asking. Weakest for a business that sells on the phone |

**Recommendation:** B. It costs nothing and removes the only hard stop, without
giving up the phone number from anyone willing to leave one.

**Not changed pending his answer.** One field, about ten minutes either way.

## 2. Finance and credit licensing

Covered in full in **DD14**. In short: does Adam hold an Australian Credit
Licence, is he an authorised credit representative under someone else's, or
neither? The `/finance` page currently describes shopping a loan to lenders and
arrives with 9.5% p.a. pre-filled, and the answer decides whether that is
allowed. DD14 carries the detail and a seven-item list.

## 3. The Google rating being published as fact

`lib/config.ts` declares a 4.9 rating from 87 reviews, with the comment "Static
config — swap for live Google Places data post-launch" and a placeholder Maps URL
(`https://www.google.com/maps`, marked "replace with the real listing URL").

That rating is already published in the site's structured data as an
`aggregateRating`, which is the field Google reads for review stars in search
results. If the numbers were typed in rather than counted, this is review markup
that cannot be verified against a real listing. Google treats fabricated review
markup as a manual-action offence, and the penalty lands on the site.

**What is needed:** the real Google Business Profile URL and its actual rating and
review count, or the `aggregateRating` comes out of the schema until there is
one. This is the highest-risk item on the list after the finance question, and it
is quicker to fix.

## 4. Buyer testimonials

Every testimonial and review quote on the site is from a **seller**. "I will only
sell my cars to Adam." "The money was in my account the same day." "He came out
and took care of everything."

They are real and they are good, and they are proof of the wrong thing on a site
for buyers. The identity also lists Adam's personal service promise among the
claims Car Marketplace must never make as its own.

The customer-proof section has been removed from the marketplace homepage rather
than filled with buyer quotes nobody said.

**What is needed:** two or three real quotes from people who **bought** a car.
Ideally naming the car and the suburb.

## 5. The nine placeholders still on the public site

Listed in full in DD14 section 3. Two carry more weight than the rest:

- **Statutory warranty** (`lib/content.ts:161`) — a statutory question in both NSW
  and QLD, sitting in the FAQ entry a buyer is most likely to open.
- **Motor dealer licence number** (`lib/content.ts:302`) — the complaints page
  describes escalating to fair trading using a licence number it does not have.

The rest: trading address, sales@ email, deposit and holding policy, NSW Fair
Trading and QLD Office of Fair Trading contact details.

## 6. The phone number in the admin content editor

The content record holds a stub (`+61400000000`) where the real number should be.
Until today that stub was what the site told Google, and it was behind the call
button on every car listing, so a buyer tapping Call on a phone reached nothing.

The code now ignores an obvious stub and falls back to `0404 290 617`, so the
symptom is fixed. The data is still wrong. Someone should open `/admin`, find the
content editor, and put the real number in the phone field.

## 7. Brand items waiting on Liz, not Adam

- **Vector logo master.** The supplied cart mark is a placeholder, raster only.
  Section 03 of the identity says it must not be issued to a developer until the
  artwork is signed off, so the site currently renders a text lockup. One line in
  `marketplace/lib/brand.ts` when real artwork exists.
- **Sand `#f3dcb3`.** Marked "recommended, needs Adam's approval to become part of
  the system". It is the primary button colour. Built in as a token, so a no costs
  one line.
- **Typeface.** The identity's geometric sans is embedded as artwork in the logo
  files and never named, so there is nothing to licence. The site uses Figtree,
  the identity's own documented stand-in. If a licensed family is chosen later it
  is one line.
- **Photography standard.** Section 07 asks for a one-page standard (fixed
  location, camera height, lens, time of day, shot sequence, frames per vehicle)
  before the listing library is built, and marks it to confirm with Adam. There is
  no car-only photography in the asset set at all: every image is Adam with a
  customer, which is why the marketplace hero is a handover shot rather than the
  stock the identity calls for.

---

## Priority if the meeting is short

1. Finance licensing (section 2) — the only item that can expose Adam personally
2. The Google rating (section 3) — cheap to fix, real penalty risk
3. Statutory warranty and licence number (section 5)
4. Buyer testimonials (section 4)
5. Everything else
