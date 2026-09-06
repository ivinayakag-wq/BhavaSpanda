-- Add astrology columns to profiles
ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "moon_sign" TEXT;
ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "nakshatra" TEXT;

-- Create astrological_data table
CREATE TABLE IF NOT EXISTS "AstrologicalData" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "profileId" TEXT NOT NULL UNIQUE REFERENCES "Profile"(id) ON DELETE CASCADE,
  "sunSign" TEXT,
  "moonSign" TEXT,
  "nakshatra" TEXT,
  "risingSign" TEXT,
  "rawData" JSONB,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Grant permissions
ALTER TABLE "AstrologicalData" ENABLE ROW LEVEL SECURITY;
GRANT ALL ON "AstrologicalData" TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
