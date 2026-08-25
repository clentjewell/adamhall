# DD16 — Instant Valuation Assumptions

**Client:** Adam Hall Buy My Car · **Artefact:** DD16 · **Phase:** Deploy
**Audience:** Internal (Jewell + Adam) · **Status:** Draft v01 · **Date:** 5 August 2026
**Author:** Rao · **Subject:** What the instant valuation tool assumes, and what Adam needs to correct

The tool at `/car-valuations` gives a seller an indicative range on their car
before they hand over any contact details. This document lists every number
behind that range. None of them has been signed off. They are Jewell's
starting estimates, gathered in one block in `marketplace/lib/valuation.ts` so
Adam can correct them in a single sitting.

Nothing here blocks the build. All of it affects whether the ranges the tool
quotes are any good.

---

## 1. Where the number comes from

No valuation data has been bought. The tool works from Adam's own book, in two
kinds, and the distinction drives the maths.

| Source | What it is | Used as |
|---|---|---|
| `submissions.offer_amount` | Offers Adam has made on cars sellers brought him, where status is offer made, accepted or settled | The target. Literally "what will Adam pay me" |
| `cars.price` | Cars on the lot, live or sold | Retail. Marked down to a buy price before use |

The retail-to-paid spread is measured from those two sets rather than assumed:
the median of what Adam paid over the median of what he asks. It only falls
back to a fixed **0.82** when there are no paid comparables to measure
against, and it rejects any measured ratio at or above retail or below 0.40 as
a symptom of a thin set.

**The consequence Adam should understand.** Coverage today is narrow. A
comparable has to be the same make and model within three years, and there are
eight cars live. Most sellers will get "we have not had one of these through
recently" rather than a number. That is the intended behaviour, and it
improves on its own as cars pass through the books at around twenty-five a
month. It is not a bug to be papered over with a wider net.

## 2. The constants, and what each one does

| Constant | Value | What it means | Confidence |
|---|---|---|---|
| Expected annual travel | 12,500 km | What a car "should" have done per year. Odometer is judged against this, not against the comparable directly, so age and mileage stay separable | Reasonable. ABS puts the passenger-car average near 12,100 km |
| Odometer adjustment | 0.35% of value per 1,000 km | Applied both ways, so a low-km car is credited on the same curve | Jewell estimate. Needs Adam's view |
| Odometer cap | 25% | Stops one extreme reading dominating the result | Arbitrary guard rail |
| Annual retention | 88% | Used to age-align a comparable to the subject year | Broad used-market figure. Varies hard by model |
| Fallback retail-to-paid | 0.82 | Covers reconditioning, holding cost and margin. Only used when the spread cannot be measured | **This is the one Adam should check first** |
| Condition | Excellent 1.06 · Very good 1.00 · Good 0.94 · Fair 0.84 | Seller's own assessment of the car | Jewell estimate |
| Service history | Full 1.03 · Partial 1.00 · Unknown 0.98 · None 0.96 | Baseline is partial, because the comparables' own history is not known to the maths | Jewell estimate |
| Declared accident | 0.92 | Repaired damage the seller tells us about | Jewell estimate. Likely too generous on a late-model car |
| Range half-width | High 6% · Medium 9% · Low 14% | How wide the quoted range sits around the midpoint | Set by judgement |
| Year window | 3 years | How far either side of the subject a comparable may sit | Set by judgement |

The condition and service-history factors are **relative to a neutral car**,
not absolute. The comparable prices already carry their own condition, and the
maths has no condition data for them, so the baseline is "very good, partial
history" and the factors move the estimate off that.

## 3. What the tool will not do

- **It will not invent a figure.** No comparable inside the window means no
  number, a plain-English reason, and a route to Adam.
- **It will not present an estimate as an offer.** The range is labelled
  indicative on screen, with the reason it can move stated next to it.
- **It will not take a browser's word for the number.** Estimates are computed
  and logged server-side under the service role, so nothing can post a
  fabricated figure into the record Adam later calibrates against.
- **It will not require contact details to show the number.** This is also the
  answer to DD15 section 1: a seller sees the range first and decides
  afterwards.

## 4. The compliance question, and why it is smaller than DD14's

An indicative range carries a misleading-representation risk under the
Australian Consumer Law if a seller could reasonably read it as a firm offer.
Three things are in place: the range is labelled indicative, the copy states
plainly that the real number follows an inspection and can move either way,
and the page says nothing commits either side.

Unlike the finance page in DD14, no licensing question arises. Valuing a car
you intend to buy is ordinary dealing, not a credit activity. **This does not
need a lawyer before launch.** It does need Adam to agree the wording, because
he is the one who will be held to it.

## 5. What is needed from Adam

In order of consequence.

1. **The retail-to-paid spread.** What does Adam actually pay against what he
   asks, as a rule of thumb? The fallback of 0.82 is Jewell's guess and it
   sets the whole level of every quote made before there is measured data.
2. **The condition ladder.** Is Fair really 84% of Very good in his book, or
   is the real penalty steeper?
3. **The accident factor.** 0.92 for declared repaired damage feels generous
   for a late-model car and probably ought to vary with age.
4. **Range width.** Is a 12% spread at high confidence tight enough to be
   useful, and wide enough to be safe?
5. **The wording of the disclaimer**, since he is the one bound by it.
6. **Whether to buy data at all.** AutoGrab is the realistic option for an
   independent dealer and would give a genuine market number plus rego lookup
   from day one, instead of waiting for the book to fill. The tool is built
   behind a provider seam, so the estimator can be swapped without touching
   the page.

## 6. Calibrating it later

`quote_requests` stores every quote beside the eventual submission, so once
there is volume the estimate can be compared against what Adam actually paid
and the constants above corrected against evidence rather than judgement. The
unpriceable quotes are worth as much as the priced ones: they show what Adam
is being asked about and has no data on.
