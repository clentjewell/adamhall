-- Adam AI chat history — one row per saved conversation, scoped to the admin
-- who created it. RLS restricts every operation to the owning admin.

create table if not exists public.ai_chats (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'New chat',
  messages jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ai_chats_admin_updated_idx
  on public.ai_chats (admin_id, updated_at desc);

alter table public.ai_chats enable row level security;

create policy "ai_chats owner select" on public.ai_chats for select
  using (admin_id = auth.uid() and exists (select 1 from public.admin_users a where a.id = auth.uid()));

create policy "ai_chats owner insert" on public.ai_chats for insert
  with check (admin_id = auth.uid() and exists (select 1 from public.admin_users a where a.id = auth.uid()));

create policy "ai_chats owner update" on public.ai_chats for update
  using (admin_id = auth.uid() and exists (select 1 from public.admin_users a where a.id = auth.uid()))
  with check (admin_id = auth.uid());

create policy "ai_chats owner delete" on public.ai_chats for delete
  using (admin_id = auth.uid() and exists (select 1 from public.admin_users a where a.id = auth.uid()));
