import { createAdminClient } from "@/lib/supabase-admin";

const supabase = createAdminClient();

const PROFILE_COLUMNS = `
  id, name, age, gender, location, photos, bio, tier,
  sun_sign, moon_sign, nakshatra, gotra, ai_archetype,
  spiritual_community, spiritual_community_other, spiritual_practices,
  profession, diet, alcohol, smoking, looking_for,
  profile_completeness, daily_likes_used, daily_messages_used,
  last_reset_date, answers_to_questions, contact_visibility,
  phone_visible, email_visible, verification_status,
  swipe_gesture_enabled, created_at, about_me, non_negotiable,
  primary_practice, practice_frequency, practice_hours, years_practicing,
  favorite_space, guru_connection, spiritual_commitment, life_goals,
  partner_age_min, partner_age_max, partner_location, partner_community,
  partner_lifestyle, morning_person, exercise, education, income_range,
  family_status, family_values, birth_date, birth_time, birth_location,
  birth_timezone, spiritual_community_other, email
`.trim();

export interface FilterCriteria {
  gender?: string;
  location?: string;
  community?: string;
  diet?: string;
  ageMin?: number;
  ageMax?: number;
}

export async function getCurrentUser(userId: string) {
  const { data: profile } = await supabase
    .from("Profile")
    .select(`
      ${PROFILE_COLUMNS},
      subscriptions(status, created_at)
    `)
    .eq("id", userId)
    .single();

  if (!profile) return null;

  const subs = (profile as any).subscriptions ?? [];
  const sortedSubs = subs.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return { ...profile, subscriptions: sortedSubs.slice(0, 1) };
}

export async function getProfiles(excludeIds: string[], filters?: FilterCriteria) {
  let query = supabase
    .from("Profile")
    .select(`
      id, name, age, gender, location, photos, profession,
      spiritual_community, spiritual_practices, sun_sign,
      ai_archetype, looking_for, diet, verification_status
    `)
    .not("id", "in", `(${excludeIds.join(",")})`)
    .limit(50);

  if (filters) {
    if (filters.gender) query = query.eq("gender", filters.gender);
    if (filters.location) query = query.ilike("location", `%${filters.location}%`);
    if (filters.community) query = query.eq("spiritual_community", filters.community);
    if (filters.diet) query = query.eq("diet", filters.diet);
    if (filters.ageMin !== undefined) query = query.gte("age", filters.ageMin);
    if (filters.ageMax !== undefined) query = query.lte("age", filters.ageMax);
  }

  const { data } = await query;
  return data ?? [];
}

export async function getProfileById(id: string) {
  const { data } = await supabase
    .from("Profile")
    .select(`
      id, name, age, gender, location, photos, bio, about_me,
      profession, education, income_range,
      spiritual_community, spiritual_community_other, spiritual_practices,
      primary_practice, practice_frequency, practice_hours, years_practicing,
      favorite_space, gotra, guru_connection, spiritual_commitment, life_goals,
      looking_for, partner_age_min, partner_age_max, partner_location,
      partner_community, partner_lifestyle,
      diet, alcohol, smoking, morning_person, exercise,
      sun_sign, moon_sign, nakshatra, ai_archetype, non_negotiable,
      verification_status, answers_to_questions, family_status, family_values,
      contact_visibility
    `)
    .eq("id", id)
    .single();

  return data;
}

export async function updateProfile(userId: string, data: Record<string, any>) {
  const { data: updated } = await supabase
    .from("Profile")
    .update(data)
    .eq("id", userId)
    .select()
    .single();

  return updated;
}

export async function createProfile(userId: string, data: Record<string, any>) {
  const { data: created } = await supabase
    .from("Profile")
    .insert({ id: userId, ...data })
    .select()
    .single();

  return created;
}
