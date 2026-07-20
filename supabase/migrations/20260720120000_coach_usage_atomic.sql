-- Macht das Coach-Tageslimit atomar und schliesst die RPC-Rechte.
--
-- Vorher: die Route las den Zaehler, rief Claude und erhoehte danach. Parallele
-- Requests lasen alle denselben Wert und loesten alle einen bezahlten Call aus.
-- Jetzt: ein Aufruf prueft und erhoeht in einem Schritt und liefert den neuen
-- Stand zurueck (-1 = Limit war bereits erreicht, nichts wurde erhoeht).

drop function if exists public.increment_coach_usage(uuid, text);

create or replace function public.increment_coach_usage(
  p_user_id uuid,
  p_day text,
  p_limit int
) returns int
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_used int;
begin
  insert into public.coach_usage (user_id, day, messages_used)
  values (p_user_id, p_day::date, 1)
  on conflict (user_id, day)
  do update set messages_used = public.coach_usage.messages_used + 1
    where public.coach_usage.messages_used < p_limit
  returning messages_used into v_used;

  return coalesce(v_used, -1);
end;
$$;

-- Gibt ein Kontingent zurueck, wenn der Claude-Call nach dem Zaehlen fehlschlaegt.
create or replace function public.release_coach_message(
  p_user_id uuid,
  p_day text
) returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  update public.coach_usage
    set messages_used = greatest(messages_used - 1, 0)
    where user_id = p_user_id and day = p_day::date;
end;
$$;

-- Ohne diesen Entzug ist die Funktion ueber PostgREST erreichbar: jeder
-- angemeldete Nutzer koennte sie mit fremder user_id aufrufen und dessen
-- Kontingent verbrennen. Geschrieben wird ausschliesslich ueber den
-- Service-Role-Client im Server-Code.
revoke execute on function public.increment_coach_usage(uuid, text, int) from public, anon, authenticated;
revoke execute on function public.release_coach_message(uuid, text) from public, anon, authenticated;
revoke execute on function public.increment_scan_usage(uuid, text) from public, anon, authenticated;
