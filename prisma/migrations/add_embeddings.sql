-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- ProfileEmbedding table already exists via Prisma migration
-- Ensure it has the vector column properly set up
ALTER TABLE "ProfileEmbedding" ADD COLUMN IF NOT EXISTS embedding vector(384);

-- Create index for cosine similarity search
CREATE INDEX IF NOT EXISTS idx_profile_embedding_cosine ON "ProfileEmbedding" USING hnsw (embedding vector_cosine_ops);
