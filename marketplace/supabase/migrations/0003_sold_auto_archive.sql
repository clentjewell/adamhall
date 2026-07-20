-- Sold cars show for 30 days as social proof (RLS enforces the window),
-- then flip to archived nightly so the table stays honest.
create extension if not exists pg_cron;

create or replace function archive_stale_sold_cars() returns void
language sql security definer set search_path = public as $$
  update cars set status = 'archived'
  where status = 'sold' and sold_at < now() - interval '30 days';
$$;

select cron.schedule(
  'archive-stale-sold-cars',
  '10 14 * * *',  -- 00:10 AEST daily
  $$select archive_stale_sold_cars()$$
);
