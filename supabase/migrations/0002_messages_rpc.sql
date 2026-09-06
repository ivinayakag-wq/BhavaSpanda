-- ============================================================
-- KARMIC SWIPE — Messages RPC + Realtime
-- ============================================================

-- increment_messages — called from API to bump daily count
create or replace function public.increment_messages(user_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.profiles
     set daily_messages_used = daily_messages_used + 1
   where id = user_id;
end $$;

-- Enable Realtime for direct_messages (live chat) and swipes (instant likes)
alter publication supabase_realtime add table if not exists public.direct_messages;
alter publication supabase_realtime add table if not exists public.swipes;
