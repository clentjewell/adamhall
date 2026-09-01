-- Ties an enquiry to the account that sent it, when there was one.
--
-- Enquiries and buyer accounts have been two lists that never met: Adam could
-- see that someone enquired and, separately, that someone registered, with
-- nothing joining them. This is the join.
--
-- Nullable on purpose, and it always will be. Enquiring does not require an
-- account and should not start to — most people who ring about a car have
-- never signed up, and a null here is the normal case rather than missing
-- data.

alter table enquiries
  add column user_id uuid references auth.users(id) on delete set null;

-- on delete set null, not cascade: if a buyer closes their account the
-- enquiry is still a real thing that happened and Adam may still be acting on
-- it. It loses its link, not its existence.

create index enquiries_user_idx on enquiries (user_id) where user_id is not null;

-- The public insert policy has to be tightened alongside this. It currently
-- allows any anonymous insert where status = 'new', which now means anyone
-- could post an enquiry attributed to somebody else's account. The added
-- clause permits only an unattributed enquiry or one attributed to the
-- sender's own account.
drop policy "anyone can enquire" on enquiries;
create policy "anyone can enquire" on enquiries
  for insert with check (
    status = 'new'
    and (user_id is null or user_id = auth.uid())
  );

-- Buyers can read their own enquiries back. Nothing in the site does this
-- yet, but the account page is the obvious home for "what you have asked
-- about" and the policy belongs with the column.
create policy "buyers read own enquiries" on enquiries
  for select using (user_id is not null and user_id = auth.uid());
