-- Instant valuation tool: a log of every quote the public tool has given.
--
-- Deliberately NOT the existing `valuations` table. That one is Adam's
-- internal deal worksheet, keyed one-to-one to a submission, holding the
-- offer he made and the retail and reconditioning he expects. This one
-- records what the automated tool told a member of the public before any
-- human looked at the car. Keeping them apart means the internal margin
-- record is never confused with a machine estimate.
--
-- Two jobs:
--   1. Every quote is a lead, whether or not the seller went on to submit.
--   2. The estimate is stored beside the eventual offer, so the model's
--      assumptions can be checked against what Adam actually paid.

create table quote_requests (
  id uuid primary key default gen_random_uuid(),

  -- The car as the seller described it.
  make text not null,
  model text not null,
  year int not null,
  odometer_km int not null,
  condition text not null,
  service_history service_history not null,
  had_accidents boolean not null default false,
  suburb text,

  -- What the tool said. Null when it declined to estimate, in which case
  -- unavailable_reason carries why.
  estimate_low numeric(10,0),
  estimate_high numeric(10,0),
  estimate_midpoint numeric(10,0),
  confidence text,
  match_tier text,
  comparable_count int,
  unavailable_reason text,

  -- Set only if the seller chose to go further. The tool never requires
  -- contact details to show a number.
  submission_id uuid references submissions(id) on delete set null,

  created_at timestamptz not null default now()
);

create index quote_requests_created_idx on quote_requests (created_at desc);
create index quote_requests_car_idx on quote_requests (make, model, year);

comment on table quote_requests is
  'Public instant-valuation quotes. Machine estimates only — see valuations for Adam''s internal deal worksheet.';

alter table quote_requests enable row level security;

-- No anon insert policy on purpose. The tool computes the estimate on the
-- server and writes with the service role, so a browser cannot post a
-- fabricated estimate into the record Adam later calibrates against.
create policy "admins manage quote requests" on quote_requests
  for all using (is_admin()) with check (is_admin());
