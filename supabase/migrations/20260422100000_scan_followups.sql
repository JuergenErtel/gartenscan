create table public.scan_followups (
  scan_id        uuid primary key references public.scans(id) on delete cascade,
  user_id        uuid not null references auth.users(id) on delete cascade,
  status         text not null default 'OPEN',
  next_check_at  timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index scan_followups_user_status_idx
  on public.scan_followups (user_id, status, updated_at desc);

alter table public.scan_followups enable row level security;

create policy "own followups select" on public.scan_followups
  for select using (auth.uid() = user_id);

create policy "own followups insert" on public.scan_followups
  for insert with check (auth.uid() = user_id);

create policy "own followups update" on public.scan_followups
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
