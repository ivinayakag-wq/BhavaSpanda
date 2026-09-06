# Karmic Swipe — Supabase Migrations

## Files

| File | Purpose |
|---|---|
| `0001_initial_schema.sql` | Tables, enums, indexes, RLS, unique swipe constraint, `reset_daily_limits()` |
| `0002_schedule_daily_reset.sql` | `pg_cron` schedule calling `reset_daily_limits()` at 00:00 IST |

## Applying

### Option A — Supabase CLI (recommended)
```bash
supabase db push          # from karmic-swipe/
# or
supabase migration up
```

### Option B — Supabase Dashboard
1. Go to your Supabase project → **SQL Editor**.
2. Paste the contents of `0001_initial_schema.sql` → **Run**.
3. (Optional) Paste `0002_schedule_daily_reset.sql` → **Run**.

## Notes

- `profiles.id` mirrors `auth.users.id`. A trigger (`on_auth_user_created`) auto-inserts a profile row whenever a new auth user signs up.
- `swipes` has a **unique index** on `(swiper_id, swiped_id)` — double-swiping the same target is rejected at the DB layer. Catch `23505` unique_violation in the app to display a friendly error.
- `matches` are auto-created by the `swipes_create_match` trigger whenever a mutual right-swipe occurs (canonical `least()/greatest()` ordering avoids duplicates).
- **RLS** is enabled on every table. Users can browse all profiles (`for select using (true)`); app enforces tier-based field blurring (free users see blurred `bio`, hidden `email/phone`). Updates only allowed on own rows.
- `reset_daily_limits()` zeroes `daily_swipes_used` and `daily_messages_used` for rows where `last_reset_date <> current_date`. It can be run via `pg_cron` (Option B schedule) or invoked manually: `select public.reset_daily_limits();`.
- A lazy per-user variant `reset_daily_limits_for_user(uid)` is also available for use at the start of an authenticated request when not using cron.
