/**
 * Core domain types for Karmic Swipe.
 */

export type ZodiacSign =
  | "aries" | "taurus" | "gemini" | "cancer"
  | "leo" | "virgo" | "libra" | "scorpio"
  | "sagittarius" | "capricorn" | "aquarius" | "pisces";

export type SpiritualPath =
  | "meditation" | "yoga" | "mindfulness" | "tantra"
  | "astrology" | "energy-healing" | "shamanism" | "buddhism"
  | "hinduism" | "sufi" | "new-age" | "other";

export type KarmaScore = {
  compatibility: number;      // 0..100
  communication: number;       // 0..100
  spiritualAlignment: number; // 0..100
  emotionalResonance: number; // 0..100
};

export interface Profile {
  id: string;
  displayName: string;
  age: number;
  bio: string;
  zodiac: ZodiacSign;
  spiritualPaths: SpiritualPath[];
  avatarUrl?: string;
  photos: string[];
  location?: string;
  karmaScore?: KarmaScore;
  createdAt: string;
}

export interface Match {
  id: string;
  profileA: Profile;
  profileB: Profile;
  karmaScore: KarmaScore;
  matchedAt: string;
}

export type SwipeDirection = "left" | "right" | "up";

export interface Swipe {
  id: string;
  swiperId: string;
  targetId: string;
  direction: SwipeDirection;
  createdAt: string;
}
