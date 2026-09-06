/**
 * Shared utility helpers for BhavaSpanda.
 */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
