-- ============================================================
-- KARMIC SWIPE / IshaConnect — Initial Schema Migration
-- ============================================================
-- Tables, RLS policies, indexes, triggers, and the
-- reset_daily_limits() PostgreSQL function.
-- ============================================================

-- ---------- Extensions ----------
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ---------- Enums ----------
do $$ begin
  create type user_tier as enum ('free', 'premium');
exception when duplicate_object then null; end $$;

do $$ begin
  create type gender_type as enum ('male', 'female', 'non-binary', 'other');
exception when duplicate_object then null; end $$;

-- ============================================================
-- 1. PROFILES
-- ============================================================
create table if not exists public.profiles (
  id                      uuid primary key default uuid_generate_v4(),
  -- `id` mirrors auth.users.id; row is created by trigger on signup.
  full_name               text,
  age                     int  check (age between 18 and 120),
  gender                  gender_type,
  location                text,
  bio                     text,
  diet                    text,
  alcohol                 text,
  smoking                 text,
  spiritual_practices     text[] default '{}',
  zodiac                  text,
  nakshatra               text,
  gotra                   text,
  profile_pic_url         text,
  answers_to_questions    jsonb default '{}'::jsonb,
  is_profile_complete     boolean not null default false,
  tier                    user_tier not null default 'free',
  premium_until           timestamptz,
  daily_swipes_used       int not null default 0,
  daily_messages_used     int not null default 0,
  last_reset_date         date not null default current_date,
  ai_archetype            text,
  email                   text,
  phone                   text,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),

  constraint profiles_age_sane check (age is null or age >= 18)
);

create index if not exists profiles_tier_idx           on public.profiles (tier);
create index if not exists profiles_location_idx        on public.profiles (location);
create index if not exists profiles_profile_complete_idx on public.profiles (is_profile_complete);
create index if not exists profiles_zodiac_idx          on public.profiles (zodiac);

-- ============================================================
-- 2. SWIPES  (with double-swipe prevention)
-- ============================================================
create table if not exists public.swipes (
  id          uuid primary key default uuid_generate_v4(),
  swiper_id   uuid not null references public.profiles(id) on delete cascade,
  swiped_id   uuid not null references public.profiles(id) on delete cascade,
  -- direction: true = right (interested), false = left (pass)
  direction   boolean not null,
  created_at  timestamptz not null default now()
);

-- Prevent double-swiping: a swiper can act on a given target only once.
create unique index if not exists swipes_swiper_swiped_unique_idx
  on public.swipes (swiper_id, swiped_id);

create index if not exists swipes_swiper_id_idx  on public.swipes (swiper_id);
create index if not exists swipes_swiped_id_idx  on public.swipes (swiped_id);
create index if not exists swipes_created_at_idx on public.swipes (created_at);

-- ============================================================
-- 3. DIRECT_MESSAGES  (free users limited to 3/day, no match required)
-- ============================================================
create table if not exists public.direct_messages (
  id          uuid primary key default uuid_generate_v4(),
  sender_id   uuid not null references public.profiles(id) on delete cascade,
  receiver_id uuid not null references public.profiles(id) on delete cascade,
  content     text not null check (char_length(content) between 1 and 2000),
  is_read     boolean not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists dm_sender_idx     on public.direct_messages (sender_id);
create index if not exists dm_receiver_idx   on public.direct_messages (receiver_id);
create index if not exists dm_created_at_idx  on public.direct_messages (created_at);

-- Optional unique constraint to prevent duplicate spam (same sender+receiver+content within 2s)
-- deliberately omitted to avoid blocking legit retries; rely on RLS + app-level check.

-- ============================================================
-- 4. MATCHES  (mutual right-swipes only)
-- ============================================================
create table if not exists public.matches (
  id          uuid primary key default uuid_generate_v4(),
  user1_id    uuid not null references public.profiles(id) on delete cascade,
  user2_id    uuid not null references public.profiles(id) on delete cascade,
  matched_at  timestamptz not null default now(),

  -- Order pair canonically (smaller uuid first) to simplify dedup.
  constraint matches_ordered_pair check (user1_id < user2_id)
);

-- Prevent duplicate match rows for the same unordered pair.
create unique index if not exists matches_pair_unique_idx
  on public.matches (least(user1_id, user2_id), greatest(user1_id, user2_id));

create index if not exists matches_user1_idx on public.matches (user1_id);
create index if not exists matches_user2_idx on public.matches (user2_id);

-- ============================================================
-- 5. TRANSACTIONS  (premium payments: ₹49/month)
-- ============================================================
create table if not exists public.transactions (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  amount       numeric(10, 2) not null default 49.00 check (amount >= 0),
  start_date   date not null default current_date,
  expiry_date  date not null,
  created_at   timestamptz not null default now(),
  constraint transactions_dates_sane check (expiry_date >= start_date)
);

create index if not exists tx_user_idx   on public.transactions (user_id);
create index if not exists tx_expiry_idx on public.transactions (expiry_date);

-- ============================================================
-- 6. updated_at auto-maintain triggers
-- ============================================================
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

-- ============================================================
-- 7. Reset daily limits
-- ============================================================
-- reset_daily_limits(): checks `last_reset_date`; if it isn't today,
-- zeroes daily_swipes_used and daily_messages_used and sets
-- last_reset_date = current_date. Single UPDATE, safe to call once
-- a day (e.g., via Supabase cron / pg_cron at 00:00 IST).
-- ============================================================
create or replace function public.reset_daily_limits()
returns void language plpgsql as $$
begin
  update public.profiles
     set daily_swipes_used   = 0,
         daily_messages_used = 0,
         last_reset_date      = current_date
   where last_reset_date <> current_date;
end $$;

-- Optional self-per-row version: lazy reset on read (call from app).
-- Use this when you want per-user lazy reset instead of global cron:
create or replace function public.reset_daily_limits_for_user(p_uid uuid)
returns void language plpgsql as $$
begin
  update public.profiles
     set daily_swipes_used   = 0,
         daily_messages_used = 0,
         last_reset_date      = current_date
   where id = p_uid
     and last_reset_date <> current_date;
end $$;

-- ============================================================
-- 8. Enable RLS
-- ============================================================
alter table public.profiles          enable row level security;
alter table public.swipes            enable row level security;
alter table public.direct_messages   enable row level security;
alter table public.matches           enable row level security;
alter table public.transactions      enable row level security;

-- ============================================================
-- 9. RLS POLICIES
-- ============================================================

-- helper: which auth.uid() maps to
-- (auth.uid() returns the JWT sub of the current user, matching profiles.id)

-- ---------- profiles ----------
-- A user can read any profile (browsing); app enforces tier-gated field blurring.
drop policy if exists "profiles_select_all" on public.profiles;
create policy "profiles_select_all" on public.profiles
  for select using (true);

-- A user can read their own full row (including private contact details).
drop policy if exists "profiles_select_self_private" on public.profiles;
create policy "profiles_select_self_private" on public.profiles
  for select using (id = auth.uid());

-- A user can update only their own row.
drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- Inserts are handled by a trigger from auth.users (service role) —
-- users cannot directly INSERT into profiles. Allow self-insert to be safe.
drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self" on public.profiles
  for insert with check (id = auth.uid());

-- ---------- swipes ----------
-- A user can see swipes they made or received.
drop policy if exists "swipes_select_owner_or_target" on public.swipes;
create policy "swipes_select_owner_or_target" on public.swipes
  for select using (swiper_id = auth.uid() or swiped_id = auth.uid());

-- A user can create swipes only for themselves.
drop policy if exists "swipes_insert_self" on public.swipes;
create policy "swipes_insert_self" on public.swipes
  for insert with check (swiper_id = auth.uid());

-- Swipes are immutable (no update/delete from app); service role manages cleanup.

-- ---------- direct_messages ----------
-- A user can see messages they sent or received.
drop policy if exists "dm_select_participant" on public.direct_messages;
create policy "dm_select_participant" on public.direct_messages
  for select using (sender_id = auth.uid() or receiver_id = auth.uid());

-- A user can send messages only as themselves.
drop policy if exists "dm_insert_self" on public.direct_messages;
create policy "dm_insert_self" on public.direct_messages
  for insert with check (sender_id = auth.uid());

-- A user can mark messages they received as read.
drop policy if exists "dm_update_self_receiver" on public.direct_messages;
create policy "dm_update_self_receiver" on public.direct_messages
  for update using (receiver_id = auth.uid())
  with check (receiver_id = auth.uid());

-- ---------- matches ----------
-- A user can see matches where they are one of the two parties.
drop policy if exists "matches_select_participant" on public.matches;
create policy "matches_select_participant" on public.matches
  for select using (user1_id = auth.uid() or user2_id = auth.uid());

-- Inserts happen via service-role / trigger on mutual swipe-right; users never write directly.

-- ---------- transactions ----------
-- A user can see their own payment history.
drop policy if exists "tx_select_self" on public.transactions;
create policy "tx_select_self" on public.transactions
  for select using (user_id = auth.uid());

-- Inserts/updates handled by service role (webhook) only.

-- ============================================================
-- 10. Auto-create profile on auth signup (service-role safe)
-- ============================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, phone)
  values (new.id, new.email, coalesce(new.phone, ''))
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- 11. Auto-create match on mutual right-swipe
-- ============================================================
-- When a user swipes right on someone who has already swiped right on them,
-- insert a row into matches with canonical (a < b) ordering.
-- ============================================================
create or replace function public.create_match_if_mutual()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.direction = true then
    insert into public.matches (user1_id, user2_id)
    select least(new.swiper_id, new.swiped_id), greatest(new.swiper_id, new.swiped_id)
    where exists (
      select 1 from public.swipes s
       where s.swiper_id = new.swiped_id
         and s.swiped_id = new.swiper_id
         and s.direction  = true
    )
    on conflict do nothing;
  end if;
  return new;
end $$;

drop trigger if exists swipes_create_match on public.swipes;
create trigger swipes_create_match
  after insert on public.swipes
  for each row execute procedure public.create_match_if_mutual();

-- ============================================================
-- 12. increment_swipes RPC — called from API to bump daily count
-- ============================================================
create or replace function public.increment_swipes(user_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.profiles
     set daily_swipes_used = daily_swipes_used + 1
   where id = user_id;
end $$;

-- ============================================================
-- End of migration
-- ============================================================
