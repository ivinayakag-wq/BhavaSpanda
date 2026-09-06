import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildEmbeddingText, generateEmbedding, cosineSimilarity, generateFallbackEmbedding } from "@/lib/embeddings/generate";
import { requireUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  let profileId: string;
  try {
    const user = await requireUser();
    profileId = user.id;
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const limit = parseInt(req.nextUrl.searchParams.get("limit") || "20", 10);

  try {
    const profile = await prisma.profile.findUnique({ where: { id: profileId } });
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const existingEmbedding = await prisma.$queryRawUnsafe<{ embedding: string | null }[]>(
      `SELECT embedding::text FROM "ProfileEmbedding" WHERE profile_id = $1`,
      profileId
    );

    let queryVector: number[] | null = null;

    if (existingEmbedding?.[0]?.embedding) {
      queryVector = JSON.parse(existingEmbedding[0].embedding);
    } else {
      const text = buildEmbeddingText(profile);
      if (text.trim()) {
        queryVector = await generateEmbedding(text);
        if (queryVector && queryVector.length === 384) {
          const vecStr = `[${queryVector.join(",")}]`;
          const existing = await prisma.profileEmbedding.findUnique({ where: { profile_id: profileId } });
          if (existing) {
            await prisma.$queryRawUnsafe(
              `UPDATE "ProfileEmbedding" SET embedding = $1::vector, updated_at = NOW() WHERE profile_id = $2`,
              vecStr, profileId
            );
          } else {
            await prisma.$queryRawUnsafe(
              `INSERT INTO "ProfileEmbedding" (id, profile_id, embedding, updated_at) VALUES (gen_random_uuid()::text, $1, $2::vector, NOW())`,
              profileId, vecStr
            );
          }
        }
      }
    }

    if (!queryVector) {
      const allProfiles = await prisma.profile.findMany({
        where: { id: { not: profileId } },
        take: limit,
      });
      return NextResponse.json({
        matches: allProfiles,
        method: "fallback",
        semantic: false,
      });
    }

    try {
      const vecStr = `[${queryVector.join(",")}]`;
      const rows = await prisma.$queryRawUnsafe<{
        id: string; name: string; age: number; location: string;
        photos: string[]; tier: string; similarity: number;
      }[]>(
        `SELECT p.id, p.name, p.age, p.location, p.photos, p.tier,
                1 - (pe.embedding <=> $1::vector) as similarity
         FROM "ProfileEmbedding" pe
         JOIN "Profile" p ON p.id = pe.profile_id
         WHERE pe.profile_id != $2 AND pe.embedding IS NOT NULL
         ORDER BY pe.embedding <=> $1::vector
         LIMIT $3`,
        vecStr, profileId, limit
      );

      if (rows.length > 0) {
        return NextResponse.json({ matches: rows, method: "pgvector", semantic: true });
      }
    } catch (vecErr) {
      console.warn("pgvector query failed, using JS fallback:", vecErr);
    }

    const allEmbeddings = await prisma.$queryRawUnsafe<{ profile_id: string; embedding: string }[]>(
      `SELECT profile_id, embedding::text FROM "ProfileEmbedding" WHERE profile_id != $1 AND embedding IS NOT NULL`,
      profileId
    );

    const scored: any[] = [];
    for (const row of allEmbeddings) {
      try {
        const otherVec = JSON.parse(row.embedding);
        const sim = cosineSimilarity(queryVector, otherVec);
        const p = await prisma.profile.findUnique({ where: { id: row.profile_id } });
        if (p) scored.push({ ...p, similarity: sim });
      } catch { /* skip */ }
    }

    scored.sort((a, b) => b.similarity - a.similarity);
    const top = scored.slice(0, limit);

    if (top.length > 0) {
      return NextResponse.json({ matches: top, method: "js-fallback", semantic: true });
    }

    const fallbackProfiles = await prisma.profile.findMany({
      where: { id: { not: profileId } },
      take: limit,
    });
    return NextResponse.json({ matches: fallbackProfiles, method: "fallback", semantic: false });
  } catch (err: any) {
    console.error("Semantic match error:", err);
    const allProfiles = await prisma.profile.findMany({
      where: { id: { not: profileId } },
      take: limit,
    });
    return NextResponse.json({ matches: allProfiles, method: "fallback", semantic: false });
  }
}
