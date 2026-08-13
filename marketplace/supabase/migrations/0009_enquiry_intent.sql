-- Buyer intent, and a public availability state for a car.
--
-- Two separate jobs that arrived together:
--
-- 1. Enquiries now carry how the buyer wants to be answered, and whether they
--    are thinking about finance or a trade-in. All three are for Adam's
--    benefit when he picks up the phone; none of them branch any logic.
--
-- 2. Cars get an `availability` column so Adam can say "someone is talking to
--    me about this one" without taking it off the site.

-- ── Cars: availability ──────────────────────────────────────────────
--
-- Deliberately NOT a new value on car_status. That column drives the public
-- RLS policy:
--
--   using (status = 'published' or (status = 'sold' and sold_at > ...))
--
-- so a car moved to a 'reserved' *status* would stop matching and vanish from
-- the site entirely. Availability is a separate axis: status decides whether
-- the car is on the site at all, availability decides what the badge says
-- while it is.
--
-- Sold is NOT modelled here. It stays purely in car_status, so there is one
-- place a sale is recorded and nothing to keep in sync. Display precedence in
-- the app is: sold wins, then availability, then no badge.
create type car_availability as enum ('available', 'enquiry_in_progress', 'reserved');

alter table cars
  add column availability car_availability not null default 'available';

-- No trigger, no timer, no expiry. Availability only ever changes because
-- Adam changed it.

-- ── Enquiries: intent ───────────────────────────────────────────────

-- How the buyer would rather be reached. Informational: the enquiry still
-- lands in the same inbox and still emails Adam either way.
create type enquiry_contact_method as enum ('call', 'text', 'email');

alter table enquiries
  add column preferred_contact_method enquiry_contact_method not null default 'call',
  add column financing_interest boolean not null default false,
  add column trade_in_interest boolean not null default false;

-- RLS needs no changes for either table:
--
--   cars      — "admins manage cars" is `for all using (is_admin())`, a
--               table-level policy, so it already covers availability.
--   enquiries — "anyone can enquire" is `for insert with check (status =
--               'new')`. The check names one column and constrains nothing
--               else, so the three new columns are insertable by the public
--               form as-is. "admins manage enquiries" is table-level too.
