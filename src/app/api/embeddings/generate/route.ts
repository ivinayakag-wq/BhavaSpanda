import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildEmbeddingText, generateEmbedding } from "@/lib/embeddings/generate";
import { requireUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  let profileId: string;
  try {
    const user = await requireUser();
    profileId = user.id;
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const profile = await prisma.profile.findUnique({ where: { id: profileId } });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const text = buildEmbeddingText(profile);
    if (!text.trim()) {
      return NextResponse.json({ error: "Not enough profile data to generate embedding" }, { status: 400 });
    }

    const embedding = await generateEmbedding(text);

    if (!embedding || embedding.length !== 384) {
      return NextResponse.json({ error: "Failed to generate embedding" }, { status: 500 });
    }

    const vecStr = `[${embedding.join(",")}]`;

    const existing = await prisma.profileEmbedding.findUnique({
      where: { profile_id: profileId },
    });

    if (existing) {
      await prisma.$queryRawUnsafe(
        `UPDATE "ProfileEmbedding" SET embedding = $1::vector, updated_at = NOW() WHERE profile_id = $2`,
        vecStr,
        profileId
      );
    } else {
      await prisma.$queryRawUnsafe(
        `INSERT INTO "ProfileEmbedding" (id, profile_id, embedding, updated_at) VALUES (gen_random_uuid()::text, $1, $2::vector, NOW())`,
        profileId,
        vecStr
      );
    }

    return NextResponse.json({ success: true, dimensions: embedding.length });
  } catch (err: any) {
    console.error("Embedding generation error:", err);
    return NextResponse.json({ error: err.message || "Failed to generate embedding" }, { status: 500 });
  }
}
