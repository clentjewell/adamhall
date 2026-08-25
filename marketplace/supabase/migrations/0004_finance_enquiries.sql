-- Finance enquiries: standalone lead type (car optional), reusing the
-- enquiry status vocabulary. Consent is captured explicitly.
create table finance_enquiries (
  id uuid primary key default gen_random_uuid(),
  car_id uuid references cars(id) on delete set null,
  name text not null,
  phone text not null,
  email text not null,
  amount numeric(10,0),
  deposit numeric(10,0),
  term_months int,
  message text,
  consent boolean not null default true,
  status enquiry_status not null default 'new',
  created_at timestamptz not null default now()
);
create index finance_enquiries_status_idx on finance_enquiries (status, created_at desc);

alter table finance_enquiries enable row level security;

create policy "anyone can enquire about finance" on finance_enquiries
  for insert with check (status = 'new');
create policy "admins manage finance enquiries" on finance_enquiries
  for all using (is_admin()) with check (is_admin());
