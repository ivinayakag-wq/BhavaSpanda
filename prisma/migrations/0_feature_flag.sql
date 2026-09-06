-- Run this in Supabase SQL Editor to create the FeatureFlag table

CREATE TABLE IF NOT EXISTS "FeatureFlag" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
  "key" TEXT NOT NULL,
  "value" JSONB NOT NULL,
  "description" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "FeatureFlag_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "FeatureFlag_key_key" UNIQUE ("key")
);

-- Seed early offer feature flags
INSERT INTO "FeatureFlag" ("key", "value", "description") VALUES
  ('early_offer', 'true'::jsonb, 'Master toggle for early offer mode - makes app free with reduced limits'),
  ('early_offer_limits', '{"likes": 25, "messages": 10}'::jsonb, 'Daily limits during early offer period'),
  ('premium_limits', '{"likes": 50, "messages": 100}'::jsonb, 'Standard premium tier limits for future use'),
  ('premium_pricing', '{"seeker": {"price": 499, "name": "Seeker", "features": ["50 likes/day", "10 messages/day", "AI Match Score", "Vedic Compatibility"]}, "ultimate": {"price": 999, "name": "Ultimate", "features": ["Unlimited likes", "Unlimited messages", "AI Match Score", "Vedic Compatibility", "Blindspot Analysis"]}}'::jsonb, 'Premium plan pricing and features config - stored for future use'),
  ('show_pricing', 'false'::jsonb, 'Whether to show upgrade/pricing UI elements'),
  ('show_donate', 'true'::jsonb, 'Whether to show donate button')
ON CONFLICT ("key") DO UPDATE SET
  "value" = EXCLUDED.value,
  "description" = EXCLUDED.description,
  "updated_at" = CURRENT_TIMESTAMP;
