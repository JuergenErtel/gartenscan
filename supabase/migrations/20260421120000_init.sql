-- gartenscan initial schema (A+B: Foundation + Real Plant Scan)

-- profiles: App-spezifische User-Daten (1:1 mit auth.users)
create table public.profiles (
  id                       uuid primary key references auth.users(id) on delete cascade,
  created_at               timestamptz not null default now(),
  is_anonymous             boolean not null default true,
  email                    text,
  garden_type              text,
  experience               text,
  interests                text[] not null default '{}',
  pets_children            text[] not null default '{}',
  solution_preference      text,
  completed_onboarding_at  timestamptz
);

create table public.entitlements (
  user_id                  uuid primary key references auth.users(id) on delete cascade,
  plan                     text not null default 'free',
  source                   text not null default 'default',
  updated_at               timestamptz not null default now(),
  stripe_customer_id       text,
  stripe_subscription_id   text,
  current_period_end       timestamptz
);

create table public.scans (
  id                       uuid primary key default gen_random_uuid(),
  user_id                  uuid not null references auth.users(id) on delete cascade,
  created_at               timestamptz not null default now(),
  image_path               text not null,
  image_meta               jsonb,
  triage_category          text,
  triage_quality           text,
  triage_reason            text,
  provider                 text,
  provider_raw             jsonb,
  status                   text not null,
  matched_content_id       text
);

create table public.scan_candidates (
  id                       uuid primary key default gen_random_uuid(),
  scan_id                  uuid not null references public.scans(id) on delete cascade,
  rank                     int not null,
  scientific_name          text not null,
  common_names             text[] not null default '{}',
  taxonomy                 jsonb,
  confidence               numeric(4,3) not null,
  content_id               text
);

create table public.scan_usage (
  user_id                  uuid not null references auth.users(id) on delete cascade,
  year_month               text not null,
  scans_used               int not null default 0,
  primary key (user_id, year_month)
);

create index scans_user_created_idx   on public.scans (user_id, created_at desc);
create index scan_candidates_scan_idx on public.scan_candidates (scan_id, rank);

-- Row Level Security
alter table public.profiles         enable row level security;
alter table public.entitlements     enable row level security;
alter table public.scans            enable row level security;
alter table public.scan_candidates  enable row level security;
alter table public.scan_usage       enable row level security;

create policy "own profile"        on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "own entitlement"    on public.entitlements
  for select using (auth.uid() = user_id);

create policy "own scans select"   on public.scans
  for select using (auth.uid() = user_id);
create policy "own scans insert"   on public.scans
  for insert with check (auth.uid() = user_id);

create policy "own candidates"     on public.scan_candidates
  for select using (exists (
    select 1 from public.scans s where s.id = scan_id and s.user_id = auth.uid()
  ));

create policy "own usage"          on public.scan_usage
  for select using (auth.uid() = user_id);

-- Storage bucket
insert into storage.buckets (id, name, public)
values ('scan-images', 'scan-images', false)
on conflict (id) do nothing;

-- Storage-RLS: kein Client-Upload (nur Service-Role), Client liest via signed URL
-- → keine Policies nötig, da private Bucket + kein Client-Schreibpfad existiert.

-- Auto-create profile + entitlement on auth user insert
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, is_anonymous)
  values (new.id, coalesce((new.raw_user_meta_data->>'is_anonymous')::boolean, new.is_anonymous, true));

  insert into public.entitlements (user_id, plan, source)
  values (new.id, 'free', 'default');

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();
