-- Cache für KI-generierte Ersatzinhalte (erkannte Art ohne kuratierten Eintrag)
alter table public.scans
  add column if not exists ai_fallback jsonb;
