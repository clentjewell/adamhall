-- Adam Hall Buy My Car — initial schema
-- Applied to project adamhall-marketplace (ocyxhfyphqyirjbyvhnw)

create type car_status as enum ('draft','published','sold','archived');
create type submission_status as enum ('new','reviewing','offer_made','accepted','declined','settled');
create type enquiry_kind as enum ('enquiry','book_look');
create type enquiry_status as enum ('new','contacted','closed');
create type service_history as enum ('full','partial','none','unknown');

-- Admin allowlist. Rows are added manually (or via SQL) for Adam + staff;
-- there is no public signup path.
create table admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  name text,
  created_at timestamptz not null default now()
);

create or replace function is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from admin_users where id = auth.uid());
$$;

create table cars (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  make text not null,
  model text not null,
  badge text,
  year int not null,
  price numeric(10,0) not null,
  odometer_km int not null,
  body_type text not null,
  transmission text not null,
  fuel text not null,
  drivetrain text,
  colour text,
  seats int,
  description text,
  adams_take text,
  video_url text,
  ppsr_clear boolean not null default false,
  service_history service_history not null default 'unknown',
  inspection_summary text,
  photos jsonb not null default '[]',
  status car_status not null default 'draft',
  published_at timestamptz,
  sold_at timestamptz,
  source_submission_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table submissions (
  id uuid primary key default gen_random_uuid(),
  token text not null unique default encode(gen_random_bytes(16), 'hex'),
  rego text,
  rego_state text,
  make text,
  model text,
  year int,
  odometer_km int,
  service_history service_history,
  had_accidents boolean,
  accident_notes text,
  tyres_condition text,
  interior_condition text,
  mechanical_issues text,
  condition_notes text,
  seller_name text not null,
  phone text not null,
  email text not null,
  suburb text,
  asking_price numeric(10,0),
  sell_timeframe text,
  trade_target_car_id uuid references cars(id) on delete set null,
  status submission_status not null default 'new',
  offer_amount numeric(10,0),
  offer_sent_at timestamptz,
  declined_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table cars
  add constraint cars_source_submission_fkey
  foreign key (source_submission_id) references submissions(id) on delete set null;

create table submission_photos (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references submissions(id) on delete cascade,
  path text not null,
  kind text,
  created_at timestamptz not null default now()
);

-- 1:1 with submissions. Margin is derived, never hand-entered — this table
-- quietly accumulates Adam's pricing judgement.
create table valuations (
  submission_id uuid primary key references submissions(id) on delete cascade,
  offer_amount numeric(10,0),
  expected_retail numeric(10,0),
  expected_recon numeric(10,0),
  margin numeric generated always as
    (coalesce(expected_retail, 0) - coalesce(offer_amount, 0) - coalesce(expected_recon, 0)) stored,
  notes text,
  updated_by text,
  updated_at timestamptz not null default now()
);

create table enquiries (
  id uuid primary key default gen_random_uuid(),
  car_id uuid not null references cars(id) on delete cascade,
  kind enquiry_kind not null default 'enquiry',
  name text not null,
  phone text not null,
  preferred_time text,
  message text,
  status enquiry_status not null default 'new',
  created_at timestamptz not null default now()
);

-- High-control items are explicit columns: each must be ticked deliberately,
-- with a timestamp and who ticked it. Never inferred, never bulk-set.
create table settlement_checklists (
  submission_id uuid primary key references submissions(id) on delete cascade,
  ppsr_done boolean not null default false,
  ppsr_at timestamptz,
  ppsr_by text,
  payout_letter_done boolean not null default false,
  payout_letter_at timestamptz,
  payout_letter_by text,
  id_verified_done boolean not null default false,
  id_verified_at timestamptz,
  id_verified_by text,
  rego_transfer_done boolean not null default false,
  rego_transfer_at timestamptz,
  rego_transfer_by text,
  funds_cleared_done boolean not null default false,
  funds_cleared_at timestamptz,
  funds_cleared_by text
);

create table status_events (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id uuid not null,
  from_status text,
  to_status text not null,
  actor text not null,
  note text,
  created_at timestamptz not null default now()
);
create index status_events_entity_idx on status_events (entity_type, entity_id, created_at desc);

create table watchlist_alerts (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  make text not null,
  model text,
  max_price numeric(10,0),
  active boolean not null default true,
  last_notified_at timestamptz,
  created_at timestamptz not null default now()
);

create index cars_status_idx on cars (status, published_at desc);
create index submissions_status_idx on submissions (status, created_at desc);
create index enquiries_status_idx on enquiries (status, created_at desc);

-- updated_at maintenance
create or replace function set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
create trigger cars_updated_at before update on cars
  for each row execute function set_updated_at();
create trigger submissions_updated_at before update on submissions
  for each row execute function set_updated_at();

-- ── Row Level Security ──────────────────────────────────────────────

alter table admin_users enable row level security;
alter table cars enable row level security;
alter table submissions enable row level security;
alter table submission_photos enable row level security;
alter table valuations enable row level security;
alter table enquiries enable row level security;
alter table settlement_checklists enable row level security;
alter table status_events enable row level security;
alter table watchlist_alerts enable row level security;

create policy "admins read own allowlist row" on admin_users
  for select using (id = auth.uid());

-- Public: published cars, plus sold cars for 30 days (social proof window).
create policy "public reads live cars" on cars
  for select using (
    status = 'published'
    or (status = 'sold' and sold_at > now() - interval '30 days')
  );
create policy "admins manage cars" on cars
  for all using (is_admin()) with check (is_admin());

-- Sellers submit without an account. They never read via anon key —
-- tokenised status reads happen server-side with the service role.
create policy "anyone can submit a car" on submissions
  for insert with check (status = 'new');
create policy "admins manage submissions" on submissions
  for all using (is_admin()) with check (is_admin());

create policy "anyone can attach photos" on submission_photos
  for insert with check (true);
create policy "admins manage submission photos" on submission_photos
  for all using (is_admin()) with check (is_admin());

create policy "admins manage valuations" on valuations
  for all using (is_admin()) with check (is_admin());

create policy "anyone can enquire" on enquiries
  for insert with check (status = 'new');
create policy "admins manage enquiries" on enquiries
  for all using (is_admin()) with check (is_admin());

create policy "admins manage settlement" on settlement_checklists
  for all using (is_admin()) with check (is_admin());

create policy "admins read audit trail" on status_events
  for select using (is_admin());

create policy "anyone can join watchlist" on watchlist_alerts
  for insert with check (active = true);
create policy "admins manage watchlist" on watchlist_alerts
  for all using (is_admin()) with check (is_admin());

-- ── Storage ─────────────────────────────────────────────────────────

-- Listing photos are public; seller submission photos are private and
-- served to admins via signed URLs only.
insert into storage.buckets (id, name, public)
values ('car-photos', 'car-photos', true), ('submission-photos', 'submission-photos', false);

create policy "public reads car photos" on storage.objects
  for select using (bucket_id = 'car-photos');
create policy "admins manage car photos" on storage.objects
  for all using (bucket_id = 'car-photos' and is_admin())
  with check (bucket_id = 'car-photos' and is_admin());
create policy "sellers upload submission photos" on storage.objects
  for insert with check (bucket_id = 'submission-photos');
create policy "admins read submission photos" on storage.objects
  for select using (bucket_id = 'submission-photos' and is_admin());
