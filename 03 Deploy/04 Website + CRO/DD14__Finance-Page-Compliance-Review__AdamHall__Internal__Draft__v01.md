# DD14 — Finance Page Compliance Review

**Client:** Adam Hall Buy My Car · **Artefact:** DD14 · **Phase:** Deploy
**Audience:** Internal (Jewell + Adam) · **Status:** Draft v01 · **Date:** 4 August 2026
**Author:** Rao · **Subject:** `carmarketplace.com.au` → `/finance`

Not legal advice. This is a build-side review of what the page currently claims
and which of those claims depend on a licensing question nobody has answered.
The purpose is to give Adam a short, specific list to respond to before launch.

Live reference: `claude-install-skills-zip-fkibw7-adamhall-marketplace.clent.workers.dev/finance`
Source: `marketplace/app/finance/page.tsx`, `marketplace/components/FinanceCalculator.tsx`,
`marketplace/components/FinanceEnquiryForm.tsx`, `marketplace/lib/content.ts`

---

## 1. The question the page is built on top of

In Australia, helping someone obtain a car loan is **credit assistance** under the
National Consumer Credit Protection Act 2009, regulated by ASIC. Suggesting a
particular loan, or applying for one on a customer's behalf, requires either an
Australian Credit Licence or an appointment as an authorised credit
representative of a licence holder.

Three possibilities, and the page needs to be built differently for each:

| | Situation | What the page may do |
|---|---|---|
| A | Adam holds an Australian Credit Licence | Quote, recommend, take applications. Must display the licence number and a credit guide |
| B | Adam is an authorised credit representative under someone else's licence | Same, and must display the licensee's name and ACL number plus his own credit representative number |
| C | Neither | May not recommend a loan, may not represent that a loan suits the customer, may not take a loan application. May name a licensed broker and hand the customer over |

**Nobody has recorded which one applies.** The evidence that the question was
raised and then left is in the source itself, at `lib/content.ts:225`:

> "We shop it to our lenders" — "[finance model to be confirmed: in-house /
> broker] — either way, we come back with a real rate, not a teaser."

That bracketed text is rendering on the public page today.

## 2. What is actually wrong, in order of consequence

### 2.1 The page describes arranging credit

The three-step explainer tells the customer that we take their figures, shop the
loan to lenders and come back with a rate. Under situation C that is a
description of credit assistance, whether or not it is what happens in practice.

Under A or B the copy is fine. Under C it needs to become a handover: name the
broker, say they are licensed, stop there.

### 2.2 The calculator arrives with a rate already in it

`components/FinanceCalculator.tsx:24`

```ts
const [annualRatePct, setAnnualRatePct] = useState(9.5);
```

The customer lands on a repayment figure calculated at 9.5% p.a. without having
typed anything. That is the site putting a rate in front of a buyer, which is
what creates the comparison rate obligation under the National Credit Code, and
in turn why the warning line below it could not be written.

**Recommendation:** clear the default and relabel the field "your lender's rate
(% p.a.)". The customer supplies the number, the site advertises no rate, and the
comparison rate line can be deleted rather than drafted. This is the smallest fix
available and it holds under all three situations.

### 2.3 A placeholder is visible to customers, twice

`app/finance/page.tsx:74`

> Comparison rate warning: [legal review required for jurisdiction wording].

Rendering twice on the live page. If 2.2 is done, this line is deleted rather
than filled in.

### 2.4 What is already correct

The substantive disclaimer is right and needs no change beyond house style:

> Figures on this page are estimates only. Not an offer or approval of finance.
> Actual rates, fees and approval depend on assessment by the lender.

The enquiry form is also better than the copy around it. It collects name, phone,
email, amount, deposit, term and a message, with explicit consent
(`supabase/migrations/0004_finance_enquiries.sql`). It does not collect income,
employment, assets or liabilities, so it is a lead form, not a credit
application. That keeps the form itself well inside situation C. The exposure is
in the words, not the fields.

## 3. The same problem elsewhere on the site

The finance page is not an isolated case. Nine unfilled placeholders are live and
customer-visible:

| Location | Placeholder | Renders on |
|---|---|---|
| `lib/content.ts:131` | `[sales@ email to be confirmed]` | Contact |
| `lib/content.ts:132` | `[street address to be confirmed]` | Contact |
| `lib/content.ts:161` | `[statutory warranty wording pending legal review]` | FAQ, "Do you offer any kind of warranty?" |
| `lib/content.ts:166` | `[deposit terms pending, confirmed at time of sale]` | FAQ, "Is there a deposit or holding policy?" |
| `lib/content.ts:225` | `[finance model to be confirmed: in-house / broker]` | Finance |
| `lib/content.ts:298` | `[phone / website placeholder]` (NSW Fair Trading) | Complaints |
| `lib/content.ts:299` | `[phone / website placeholder]` (QLD Office of Fair Trading) | Complaints |
| `lib/content.ts:302` | `[licence number pending]` (motor dealer licence) | Complaints |
| `app/finance/page.tsx:74` | `[legal review required for jurisdiction wording]` | Finance |

Two of these carry more weight than the rest. The warranty answer at 161 is a
statutory question in both NSW and QLD, and it is the FAQ entry a buyer is most
likely to open. The motor dealer licence number at 302 is the mechanism the
complaints page relies on for escalation, so the page currently describes a
process it cannot complete.

All five `/legal/*` pages also carry a visible banner reading "DRAFT — requires
review by the dealership's legal adviser for NSW/QLD before launch". That banner
is honest, and it should stay until the review happens, but it cannot still be
there on launch day.

## 4. Recommendation

Leave the finance page as it stands for now, per Ronnie and Rao's call on
4 August, and settle it with Adam before go-live. When it is settled:

1. Build for situation C unless Adam confirms A or B. C is lawful under all
   three, so it cannot be wrong, and it upgrades cheaply later.
2. Clear the calculator's default rate and delete the comparison rate line.
3. Rewrite the "we shop it to our lenders" step as a named handover.
4. Fill or remove all nine placeholders. A placeholder in customer-facing copy
   should fail the build, not ship. Worth adding to the Layer 1 audit in phase 2.
5. Remove the `/legal/*` draft banners only once the adviser has signed off.

## 5. To confirm with Adam

1. Does he hold an Australian Credit Licence? If yes, the number.
2. If not, is he an authorised credit representative under a broker or
   aggregator's licence? If yes, the licensee's name, their ACL number and his
   credit representative number.
3. If neither: which broker do finance enquiries go to, and may we name them on
   the page?
4. Motor dealer licence number, for the complaints page and the site footer.
5. Statutory warranty position for NSW and QLD, so the FAQ answer can be written.
6. Deposit and holding policy.
7. Trading address and a sales@ email, or confirmation that there is no public
   address and the contact block should drop it.

Items 4 to 7 are not licensing questions and can be answered without an adviser.
They should not wait on items 1 to 3.

---

**Next action:** hold for the Adam conversation. No changes made to
`app/finance/page.tsx` in this cycle.
