import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

const profileSelect = {
  id: true,
  name: true,
  age: true,
  gender: true,
  location: true,
  photos: true,
  bio: true,
  tier: true,
  sun_sign: true,
  moon_sign: true,
  nakshatra: true,
  gotra: true,
  ai_archetype: true,
  spiritual_community: true,
  spiritual_practices: true,
  profession: true,
  diet: true,
  alcohol: true,
  smoking: true,
  looking_for: true,
  profile_completeness: true,
  daily_likes_used: true,
  daily_messages_used: true,
  last_reset_date: true,
  answers_to_questions: true,
  contact_visibility: true,
  phone_visible: true,
  email_visible: true,
  verification_status: true,
  swipe_gesture_enabled: true,
  created_at: true,
} satisfies Prisma.ProfileSelect;

export type ProfileData = Prisma.ProfileGetPayload<{
  select: typeof profileSelect & {
    profile_embedding: true;
    subscriptions: { take: 1; orderBy: { created_at: "desc" } };
  };
}>;

export interface FilterCriteria {
  gender?: string;
  location?: string;
  community?: string;
  diet?: string;
  ageMin?: number;
  ageMax?: number;
}

export async function getCurrentUser(userId: string) {
  return prisma.profile.findUnique({
    where: { id: userId },
    select: {
      ...profileSelect,
      subscriptions: { take: 1, orderBy: { created_at: "desc" as const }, select: { status: true, created_at: true } },
    },
  });
}

export async function getProfiles(excludeIds: string[], filters?: FilterCriteria) {
  const where: Prisma.ProfileWhereInput = {
    id: { notIn: excludeIds },
  };

  if (filters) {
    if (filters.gender) where.gender = filters.gender as any;
    if (filters.location) where.location = { contains: filters.location, mode: "insensitive" };
    if (filters.community) where.spiritual_community = filters.community;
    if (filters.diet) where.diet = filters.diet as any;
    if (filters.ageMin !== undefined || filters.ageMax !== undefined) {
      where.age = {};
      if (filters.ageMin !== undefined) where.age.gte = filters.ageMin;
      if (filters.ageMax !== undefined) where.age.lte = filters.ageMax;
    }
  }

  return prisma.profile.findMany({
    where,
    take: 50,
    select: {
      id: true,
      name: true,
      age: true,
      gender: true,
      location: true,
      photos: true,
      profession: true,
      spiritual_community: true,
      spiritual_practices: true,
      sun_sign: true,
      ai_archetype: true,
      looking_for: true,
      diet: true,
      verification_status: true,
    },
  });
}

export async function getProfileById(id: string) {
  return prisma.profile.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      age: true,
      gender: true,
      location: true,
      photos: true,
      bio: true,
      about_me: true,
      profession: true,
      education: true,
      income_range: true,
      spiritual_community: true,
      spiritual_community_other: true,
      spiritual_practices: true,
      primary_practice: true,
      practice_frequency: true,
      practice_hours: true,
      years_practicing: true,
      favorite_space: true,
      gotra: true,
      guru_connection: true,
      spiritual_commitment: true,
      life_goals: true,
      looking_for: true,
      partner_age_min: true,
      partner_age_max: true,
      partner_location: true,
      partner_community: true,
      partner_lifestyle: true,
      diet: true,
      alcohol: true,
      smoking: true,
      morning_person: true,
      exercise: true,
      sun_sign: true,
      moon_sign: true,
      nakshatra: true,
      ai_archetype: true,
      non_negotiable: true,
      verification_status: true,
      answers_to_questions: true,
      family_status: true,
      family_values: true,
      contact_visibility: true,
    },
  });
}

export async function updateProfile(userId: string, data: Prisma.ProfileUpdateInput) {
  return prisma.profile.update({
    where: { id: userId },
    data,
  });
}

export async function createProfile(userId: string, data: Prisma.ProfileCreateInput) {
  return prisma.profile.create({
    data: { id: userId, ...data },
  });
}
