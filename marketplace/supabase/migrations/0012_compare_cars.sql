-- The comparison list, carried on the account like the shortlist.
--
-- Saved cars were mirrored to the account first, on the reasoning that a
-- comparison is working state for one visit and not worth carrying between
-- devices. In practice people pick three cars on the couch and expect to open
-- them again at a desk, so it follows them too.
--
-- Same shape and same rules as saved_cars deliberately: one table pattern to
-- reason about, not two.

create table compare_cars (
  user_id uuid not null references auth.users(id) on delete cascade,
  car_id uuid not null references cars(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, car_id)
);

create index compare_cars_user_created_idx on compare_cars (user_id, created_at desc);

alter table compare_cars enable row level security;

-- A person may see, add and remove their own comparison, and nothing else.
-- No update policy: a row here has no mutable fields, so adding and removing
-- are an insert and a delete.
create policy "own compare cars are readable"
  on compare_cars for select
  using (user_id = auth.uid());

create policy "own compare cars are insertable"
  on compare_cars for insert
  with check (user_id = auth.uid());

create policy "own compare cars are deletable"
  on compare_cars for delete
  using (user_id = auth.uid());

-- Admins read only, matching saved_cars: knowing which three cars a buyer is
-- weighing up is useful before a call. Writing would be putting words in
-- their mouth.
create policy "admins can read compare cars"
  on compare_cars for select
  using (is_admin());

-- The three-car cap is not enforced here on purpose. It is a UI rule about
-- what fits on a comparison table, not an invariant of the data, and a
-- database constraint would turn a merge on sign-in into a failed write
-- rather than a list that gets trimmed.
