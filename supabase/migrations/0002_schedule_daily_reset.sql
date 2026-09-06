-- ============================================================
-- Daily Reset — schedule reset_daily_limits() via pg_cron
-- Run AFTER 0001_initial_schema.sql, and only on a Supabase
-- project that has the pg_cron extension enabled.
-- ============================================================

-- Enable the pg_cron extension (idempotent).
-- Note: must be created in the `postgres` (cron) database on Supabase.
create extension if not exists pg_cron;

-- Schedule reset at 00:00 IST = 18:30 UTC (prev day).
-- Cron format: min hour dom mon dow
select cron.schedule(
  'karmic-swipe-daily-reset',
  '30 18 * * *',
  $$ select public.reset_daily_limits(); $$
);

-- To unschedule later:
-- select cron.unschedule('karmic-swipe-daily-reset');
