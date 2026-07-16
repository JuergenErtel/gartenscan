-- Tageszaehler fuer Coach-Nachrichten (Free-Limit 3/Tag), analog scan_usage.
create table public.coach_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  day date not null,
  messages_used int not null default 0,
  primary key (user_id, day)
);

alter table public.coach_usage enable row level security;

create policy "coach_usage_select_own" on public.coach_usage
  for select using (auth.uid() = user_id);

create or replace function public.increment_coach_usage(
  p_user_id uuid,
  p_day text
) returns void
language plpgsql
security definer
as $$
begin
  insert into public.coach_usage (user_id, day, messages_used)
  values (p_user_id, p_day::date, 1)
  on conflict (user_id, day)
  do update set messages_used = public.coach_usage.messages_used + 1;
end;
$$;
