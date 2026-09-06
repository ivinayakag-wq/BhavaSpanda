import { prisma } from "@/lib/prisma";

interface CacheEntry {
  value: unknown;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 60_000; // 60 seconds

function getFromCache<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.value as T;
}

function setCache(key: string, value: unknown): void {
  cache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
}

/**
 * Get a feature flag value by key. Uses in-memory cache (60s TTL).
 * Returns defaultValue if the flag doesn't exist or DB is unreachable.
 */
export async function getFeatureFlag<T = unknown>(key: string, defaultValue: T): Promise<T> {
  const cached = getFromCache<T>(key);
  if (cached !== null) return cached;

  try {
    const flag = await prisma.featureFlag.findUnique({
      where: { key },
      select: { value: true },
    });
    const value = (flag?.value as T) ?? defaultValue;
    setCache(key, value);
    return value;
  } catch {
    // DB may not have FeatureFlag table yet — fail gracefully
    return defaultValue;
  }
}

/** Convenience helpers */

export async function isEarlyOffer(): Promise<boolean> {
  return getFeatureFlag<boolean>("early_offer", true);
}

export async function getEarlyOfferLimits(): Promise<{ likes: number; messages: number }> {
  return getFeatureFlag("early_offer_limits", { likes: 25, messages: 10 });
}

export async function getPremiumLimits(): Promise<{ likes: number; messages: number }> {
  return getFeatureFlag("premium_limits", { likes: 50, messages: 100 });
}

export async function shouldShowPricing(): Promise<boolean> {
  return getFeatureFlag<boolean>("show_pricing", false);
}

export async function shouldShowDonate(): Promise<boolean> {
  return getFeatureFlag<boolean>("show_donate", true);
}

/** Clear cache (useful after admin updates flags) */
export function clearFeatureFlagCache(): void {
  cache.clear();
}
