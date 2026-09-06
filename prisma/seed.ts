import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const PROFILES = [
  {
    id: "user-1",
    name: "Arjun Mehta",
    age: 28,
    gender: "Male" as const,
    location: "Coimbatore",
    photos: ["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400"],

    spiritual_community: "Isha Foundation",
    primary_practice: "Meditation",
    practice_frequency: "Daily" as const,
    years_practicing: 5,
    diet: "Vegetarian" as const,
    alcohol: "Never" as const,
    smoking: false,
    sun_sign: "Virgo",
    tier: "ultimate" as const,
    profile_completeness: 100,
    looking_for: "Life_Partner" as const,
    partner_location: "Anywhere" as const,
    partner_community: "Same_Community" as const,
    notifications_enabled: true,
  },
  {
    id: "user-2",
    name: "Priya Sharma",
    age: 26,
    gender: "Female" as const,
    location: "Bangalore",
    photos: ["https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400"],

    spiritual_community: "Isha Foundation",
    primary_practice: "Hatha Yoga",
    practice_frequency: "Daily" as const,
    years_practicing: 7,
    diet: "Vegan" as const,
    alcohol: "Occasionally" as const,
    smoking: false,
    sun_sign: "Pisces",
    tier: "seeker" as const,
    profile_completeness: 100,
    looking_for: "Spiritual_Companion" as const,
    partner_location: "Same_City" as const,
    partner_community: "Same_Community" as const,
  },
  {
    id: "user-3",
    name: "Ravi Patel",
    age: 30,
    gender: "Male" as const,
    location: "Mumbai",
    photos: ["https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400"],

    spiritual_community: "Isha Foundation",
    primary_practice: "Bhakti Yoga",
    practice_frequency: "Weekly" as const,
    years_practicing: 3,
    diet: "Vegetarian" as const,
    alcohol: "Never" as const,
    smoking: false,
    sun_sign: "Taurus",
    tier: "free" as const,
    profile_completeness: 80,
    looking_for: "Friend" as const,
    partner_location: "Anywhere" as const,
    partner_community: "Any_Community" as const,
  },
  {
    id: "user-4",
    name: "Ananya Gupta",
    age: 25,
    gender: "Female" as const,
    location: "Delhi",
    photos: ["https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400"],

    spiritual_community: "Isha Foundation",
    primary_practice: "Meditation",
    practice_frequency: "Daily" as const,
    years_practicing: 4,
    diet: "Vegetarian" as const,
    alcohol: "Never" as const,
    smoking: false,
    sun_sign: "Cancer",
    tier: "free" as const,
    profile_completeness: 90,
    looking_for: "Life_Partner" as const,
    partner_location: "Anywhere" as const,
    partner_community: "Same_Community" as const,
  },
  {
    id: "user-5",
    name: "Vikram Singh",
    age: 32,
    gender: "Male" as const,
    location: "Pune",
    photos: ["https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400"],

    spiritual_community: "Isha Foundation",
    primary_practice: "Hatha Yoga",
    practice_frequency: "Daily" as const,
    years_practicing: 10,
    diet: "Vegetarian" as const,
    alcohol: "Never" as const,
    smoking: false,
    sun_sign: "Capricorn",
    tier: "seeker" as const,
    profile_completeness: 100,
    looking_for: "Spiritual_Companion" as const,
    partner_location: "Same_City" as const,
    partner_community: "Same_Community" as const,
  },
  {
    id: "user-6",
    name: "Meera Nair",
    age: 27,
    gender: "Female" as const,
    location: "Chennai",
    photos: ["https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400"],

    spiritual_community: "ISKCON",
    primary_practice: "Bhakti Yoga",
    practice_frequency: "Daily" as const,
    years_practicing: 6,
    diet: "Vegetarian" as const,
    alcohol: "Never" as const,
    smoking: false,
    sun_sign: "Libra",
    tier: "free" as const,
    profile_completeness: 85,
    looking_for: "Life_Partner" as const,
    partner_location: "Anywhere" as const,
    partner_community: "Any_Community" as const,
  },
  {
    id: "user-7",
    name: "Karthik Iyer",
    age: 29,
    gender: "Male" as const,
    location: "Hyderabad",
    photos: ["https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400"],

    spiritual_community: "Art of Living",
    primary_practice: "Meditation",
    practice_frequency: "Daily" as const,
    years_practicing: 3,
    diet: "Vegetarian" as const,
    alcohol: "Occasionally" as const,
    smoking: false,
    sun_sign: "Aquarius",
    tier: "free" as const,
    profile_completeness: 70,
    looking_for: "Spiritual_Companion" as const,
    partner_location: "Same_City" as const,
    partner_community: "Any_Community" as const,
  },
  {
    id: "user-8",
    name: "Divya Joshi",
    age: 24,
    gender: "Female" as const,
    location: "Jaipur",
    photos: ["https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400"],

    spiritual_community: "Isha Foundation",
    primary_practice: "Meditation",
    practice_frequency: "Weekly" as const,
    years_practicing: 1,
    diet: "Vegetarian" as const,
    alcohol: "Never" as const,
    smoking: false,
    sun_sign: "Leo",
    tier: "free" as const,
    profile_completeness: 60,
    looking_for: "Friend" as const,
    partner_location: "Anywhere" as const,
    partner_community: "Any_Community" as const,
  },
];

const MATCHES = [
  { user1_id: "user-1", user2_id: "user-2" },
  { user1_id: "user-1", user2_id: "user-4" },
  { user1_id: "user-3", user2_id: "user-6" },
];

const CONNECTIONS = [
  { from_user_id: "user-3", to_user_id: "user-1", status: "pending" as const },
  { from_user_id: "user-5", to_user_id: "user-1", status: "pending" as const },
  { from_user_id: "user-6", to_user_id: "user-1", status: "pending" as const },
  { from_user_id: "user-7", to_user_id: "user-1", status: "pending" as const },
  { from_user_id: "user-8", to_user_id: "user-1", status: "pending" as const },
];

const MESSAGES = [
  { matchIdx: 0, sender_id: "user-1", content: "Namaskaram Priya! I saw your profile and felt a connection. Would you like to chat?", created_at_offset: -3600 },
  { matchIdx: 0, sender_id: "user-2", content: "Namaskaram Arjun! Yes, I'd love to. I see you're also into Isha practices.", created_at_offset: -3300 },
  { matchIdx: 0, sender_id: "user-1", content: "Yes! I've been practicing Shambhavi for 5 years now. It's been transformative.", created_at_offset: -3000 },
  { matchIdx: 0, sender_id: "user-2", content: "That's wonderful! I've been doing Hatha Yoga for 7 years. We should meditate together sometime.", created_at_offset: -2700 },
  { matchIdx: 1, sender_id: "user-4", content: "Hi Arjun! I noticed you're also an Inner Engineering graduate. How was your experience?", created_at_offset: -7200 },
  { matchIdx: 1, sender_id: "user-1", content: "Hey Ananya! It was life-changing. The Shambhavi initiation was the most profound experience.", created_at_offset: -6900 },
  { matchIdx: 2, sender_id: "user-3", content: "Hare Krishna Meera! Would you like to join our kirtan this weekend?", created_at_offset: -86400 },
  { matchIdx: 2, sender_id: "user-6", content: "Hare Krishna! I would love to. Where is it happening?", created_at_offset: -82800 },
];

async function main() {
  console.log("Seeding database...");

  for (const p of PROFILES) {
    await prisma.profile.upsert({
      where: { id: p.id },
      update: p,
      create: p,
    });
    console.log(`  Created profile: ${p.name} (${p.id})`);
  }

  for (const m of MATCHES) {
    await prisma.match.upsert({
      where: { user1_id_user2_id: { user1_id: m.user1_id, user2_id: m.user2_id } },
      update: m,
      create: m,
    });
    console.log(`  Created match: ${m.user1_id} ↔ ${m.user2_id}`);
  }

  for (const c of CONNECTIONS) {
    await prisma.connection.upsert({
      where: { from_user_id_to_user_id: { from_user_id: c.from_user_id, to_user_id: c.to_user_id } },
      update: c,
      create: c,
    });
  }
  console.log(`  Created ${CONNECTIONS.length} connections`);

  for (const msg of MESSAGES) {
    const match = await prisma.match.findFirst({
      where: {
        OR: [
          { user1_id: msg.sender_id },
          { user2_id: msg.sender_id },
        ],
      },
    });
    if (!match) continue;
    const created_at = new Date(Date.now() + msg.created_at_offset * 1000);
    await prisma.message.create({
      data: {
        match_id: match.id,
        sender_id: msg.sender_id,
        content: msg.content,
        created_at,
      },
    });
  }
  console.log(`  Created ${MESSAGES.length} messages`);

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
