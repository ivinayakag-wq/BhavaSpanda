/**
 * Internal row types mirroring the Supabase migration.
 * Kept separate from `types/index.ts` (domain models) since
 * these map 1:1 to DB columns for RLS-fetched results.
 */
export interface ProfileRow {
  id: string;
  full_name: string | null;
  age: number | null;
  gender: string | null;
  location: string | null;
  bio: string | null;
  diet: string | null;
  alcohol: string | null;
  smoking: string | null;
  spiritual_practices: string[];
  zodiac: string | null;
  nakshatra: string | null;
  gotra: string | null;
  profile_pic_url: string | null;
  answers_to_questions: Record<string, unknown>;
  is_profile_complete: boolean;
  tier: "free" | "premium";
  premium_until: string | null;
  daily_swipes_used: number;
  daily_messages_used: number;
  last_reset_date: string;
  ai_archetype: string | null;
}

export interface MessageRow {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface ConversationSummary {
  otherUserId: string;
  otherName: string | null;
  otherArchetype: string | null;
  lastMessage: string;
  lastMessageAt: string;
  lastMessageSenderId: string;
  unreadCount: number;
}
