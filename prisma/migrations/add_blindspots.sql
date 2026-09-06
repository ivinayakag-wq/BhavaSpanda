-- Add profile fields for blindspot analysis
ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "bio" TEXT;
ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "about_me" TEXT;
ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "non_negotiable" TEXT;

-- Create blindspot_analysis table
CREATE TABLE IF NOT EXISTS "BlindspotAnalysis" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "profileId" TEXT NOT NULL UNIQUE REFERENCES "Profile"(id) ON DELETE CASCADE,
  "analysis" JSONB NOT NULL DEFAULT '{}',
  "generatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Grant permissions
ALTER TABLE "BlindspotAnalysis" ENABLE ROW LEVEL SECURITY;
GRANT ALL ON "BlindspotAnalysis" TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
