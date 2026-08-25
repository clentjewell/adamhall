-- Buyer accounts: a saved shortlist that follows the person rather than the
-- browser.
--
-- Buyers are ordinary auth.users with no row in admin_users, which is what
-- keeps them out of the console: requireAdmin() and every RLS policy on the
-- admin tables test that table, so a signed-in buyer is structurally
-- incapable of reaching dealer data. Nothing here grants anything beyond a
-- person's own shortlist.
--
-- The garage currently lives in localStorage. This does not replace it: the
-- client keeps working for signed-out visitors, and whatever is in local
-- storage is adopted into the account on first sign-in, so nobody loses a
-- shortlist by registering.

create table saved_cars (
  user_id uuid not null references auth.users(id) on delete cascade,
  car_id uuid not null references cars(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, car_id)
);

-- The only read this table ever serves is "my shortlist", newest first.
create index saved_cars_user_created_idx on saved_cars (user_id, created_at desc);

alter table saved_cars enable row level security;

-- A person may see, add and remove their own saved cars, and nothing else.
-- There is deliberately no update policy: a row here has no mutable fields,
-- so saving and unsaving are an insert and a delete.
create policy "own saved cars are readable"
  on saved_cars for select
  using (user_id = auth.uid());

create policy "own saved cars are insertable"
  on saved_cars for insert
  with check (user_id = auth.uid());

create policy "own saved cars are deletable"
  on saved_cars for delete
  using (user_id = auth.uid());

-- Admins can read shortlists, because knowing which cars a buyer is watching
-- is the point of the enquiry follow-up. They cannot write them: a shortlist
-- is the buyer's own record, and an admin adding to it would be putting
-- words in their mouth.
create policy "admins can read saved cars"
  on saved_cars for select
  using (is_admin());
