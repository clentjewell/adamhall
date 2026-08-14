-- Buyer profiles: the details someone gives when they register to save cars.
--
-- Deliberately short. Everything here is either needed to run the account
-- (name, and the email that lives on auth.users) or genuinely useful and
-- optional. What is NOT here is as considered as what is:
--
--   * No date of birth. Nothing on the buy side uses one. Finance is where
--     age actually matters, and the finance application is where it should
--     be asked for, at the point it is used.
--   * No street address. A buyer browsing cars has no reason to hand one
--     over; it belongs at purchase. Suburb and postcode give the useful
--     part (how far someone is from a car, where demand is) without
--     holding an address for nothing.
--
-- The row is created by a trigger on signup rather than by the app, so a
-- profile always exists for a user even if the app crashes mid-registration
-- or the account is later made some other way.

create table buyer_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  phone text,
  suburb text,
  postcode text,
  -- How they found the Marketplace. Constrained rather than free text so it
  -- can actually be counted; 'other' is the escape hatch.
  heard_about text check (
    heard_about in ('radio', 'google', 'social', 'friend', 'returning', 'other')
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table buyer_profiles enable row level security;

-- A buyer may read and maintain their own profile, and nothing else.
create policy "own profile is readable"
  on buyer_profiles for select
  using (id = auth.uid());

create policy "own profile is updatable"
  on buyer_profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- Admins read profiles because an enquiry is worth nothing without a name
-- and a number to answer it with. They cannot write them: a buyer's own
-- details are the buyer's to correct.
create policy "admins can read profiles"
  on buyer_profiles for select
  using (is_admin());

-- Registration passes these through Supabase's signUp metadata, and this
-- copies them onto the profile. security definer because the row is written
-- before the new user has a session to satisfy an RLS policy with.
create or replace function handle_new_buyer()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  -- Admin accounts are made by hand and carry no signup metadata; skip them
  -- so the console's users do not collect empty buyer profiles.
  if new.raw_user_meta_data ? 'full_name' then
    insert into buyer_profiles (id, full_name, phone, suburb, postcode, heard_about)
    values (
      new.id,
      new.raw_user_meta_data ->> 'full_name',
      nullif(new.raw_user_meta_data ->> 'phone', ''),
      nullif(new.raw_user_meta_data ->> 'suburb', ''),
      nullif(new.raw_user_meta_data ->> 'postcode', ''),
      nullif(new.raw_user_meta_data ->> 'heard_about', '')
    )
    on conflict (id) do nothing;
  end if;
  return new;
end;
$$;

create trigger on_auth_user_created_buyer
  after insert on auth.users
  for each row execute function handle_new_buyer();
