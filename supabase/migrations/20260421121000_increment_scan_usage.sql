create or replace function public.increment_scan_usage(
  p_user_id uuid,
  p_year_month text
) returns void
language plpgsql
security definer
as $$
begin
  insert into public.scan_usage (user_id, year_month, scans_used)
  values (p_user_id, p_year_month, 1)
  on conflict (user_id, year_month)
  do update set scans_used = public.scan_usage.scans_used + 1;
end;
$$;
