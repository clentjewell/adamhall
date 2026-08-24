-- Sold cars stay visible for 90 days instead of 30.
--
-- Why: the "Recently sold" section on /cars is the buy side's only piece of
-- social proof, and at 30 days it was empty most of the time. Adam runs a
-- six-car lot and sells occasionally rather than weekly, so a month-long
-- window routinely showed nothing at all — which reads as "nothing sells
-- here" rather than as an honest record.
--
-- The window is enforced in TWO places and both have to move together, or
-- the change does nothing:
--
--   1. the RLS policy, which is what anon is allowed to read; and
--   2. archive_stale_sold_cars(), the nightly pg_cron job, which flips sold
--      to archived and so takes the row out of reach of the policy anyway.
--
-- Changing only the policy would leave the cron archiving at 30 days;
-- changing only the cron would leave RLS hiding rows the job had kept.
--
-- The cron SCHEDULE is untouched — it still runs nightly at 00:10 AEST, it
-- just archives a later cohort. Anything already archived stays archived:
-- this widens the window for cars sold from here on, and does not resurrect
-- rows the old job has already moved.

-- 1. RLS: published cars, plus sold cars inside the window.
drop policy if exists "public reads live cars" on cars;
create policy "public reads live cars" on cars
  for select using (
    status = 'published'
    or (status = 'sold' and sold_at > now() - interval '90 days')
  );

-- 2. The nightly archive job, matched to the same window.
create or replace function archive_stale_sold_cars() returns void
language sql security definer set search_path = public as $$
  update cars set status = 'archived'
  where status = 'sold' and sold_at < now() - interval '90 days';
$$;
