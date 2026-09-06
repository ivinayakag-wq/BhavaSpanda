require('dotenv').config();
const { Client } = require('pg');

const sql = `
-- 1. Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Ensure embedding column exists
ALTER TABLE "ProfileEmbedding" ADD COLUMN IF NOT EXISTS embedding vector(384);

-- 3. Create HNSW index for cosine similarity
CREATE INDEX IF NOT EXISTS idx_profile_embedding_cosine ON "ProfileEmbedding" USING hnsw (embedding vector_cosine_ops);

-- 4. Create FeatureFlag table
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

-- 5. Seed feature flags
INSERT INTO "FeatureFlag" ("key", "value", "description") VALUES
  ('early_offer', 'true'::jsonb, 'Master toggle for early offer mode'),
  ('early_offer_limits', '{"likes": 25, "messages": 10}'::jsonb, 'Daily limits during early offer'),
  ('premium_limits', '{"likes": 50, "messages": 100}'::jsonb, 'Standard premium limits'),
  ('premium_pricing', '{"seeker": {"price": 499}, "ultimate": {"price": 999}}'::jsonb, 'Premium pricing'),
  ('show_pricing', 'false'::jsonb, 'Show pricing UI'),
  ('show_donate', 'true'::jsonb, 'Show donate button')
ON CONFLICT ("key") DO UPDATE SET "value" = EXCLUDED.value, "updated_at" = CURRENT_TIMESTAMP;

-- 6. Create PairCompatibility table
CREATE TABLE IF NOT EXISTS "PairCompatibility" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
  "profilePair" TEXT NOT NULL,
  "result" JSONB NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PairCompatibility_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "PairCompatibility_profilePair_key" UNIQUE ("profilePair")
);

-- 7. Add composite indexes for feed filtering performance
CREATE INDEX IF NOT EXISTS "Connection_to_user_id_status_idx" ON "Connection"("to_user_id", "status");
CREATE INDEX IF NOT EXISTS "Connection_from_user_id_status_idx" ON "Connection"("from_user_id", "status");
CREATE INDEX IF NOT EXISTS "Match_user1_id_idx" ON "Match"("user1_id");
CREATE INDEX IF NOT EXISTS "Match_user2_id_idx" ON "Match"("user2_id");
`;

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  console.log('Connected to Supabase');

  try {
    await client.query(sql);
    console.log('All migrations applied successfully');
  } catch (e) {
    console.error('Migration error:', e.message);
  } finally {
    await client.end();
  }
}

main();
