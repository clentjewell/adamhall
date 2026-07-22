-- Editable site copy. One row keyed 'site' holding the whole content
-- object; code merges it over typed defaults so missing fields never
-- break a page. Public read (pages render it), admin write.
create table site_content (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by text
);

alter table site_content enable row level security;

create policy "public reads site content" on site_content
  for select using (true);
create policy "admins manage site content" on site_content
  for all using (is_admin()) with check (is_admin());
