-- garden persistence: plants table + scan->plant link

create table public.plants (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users(id) on delete cascade,
  created_at          timestamptz not null default now(),
  nickname            text not null,
  species             text not null,
  latin_name          text,
  matched_content_id  text,
  cover_image_path    text not null,
  zone_label          text,
  origin_scan_id      uuid references public.scans(id) on delete set null
);

create index plants_user_created_idx on public.plants (user_id, created_at desc);
create index plants_user_content_idx on public.plants (user_id, matched_content_id);

alter table public.plants enable row level security;

create policy "own plants select" on public.plants
  for select using (auth.uid() = user_id);
create policy "own plants insert" on public.plants
  for insert with check (auth.uid() = user_id);
create policy "own plants update" on public.plants
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own plants delete" on public.plants
  for delete using (auth.uid() = user_id);

alter table public.scans
  add column plant_id uuid references public.plants(id) on delete set null;

create index scans_plant_idx on public.scans (plant_id) where plant_id is not null;
