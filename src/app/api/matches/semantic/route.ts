import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
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
    const supabase = createAdminClient();

    const { data: profile } = await supabase
      .from("Profile")
      .select("*")
      .eq("id", profileId)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const { data: existingRow } = await supabase
      .from("ProfileEmbedding")
      .select("embedding")
      .eq("profile_id", profileId)
      .single();

    let queryVector: number[] | null = null;

    if (existingRow?.embedding) {
      const raw = existingRow.embedding;
      queryVector = typeof raw === "string" ? JSON.parse(raw) : raw;
    } else {
      const text = buildEmbeddingText(profile);
      if (text.trim()) {
        queryVector = await generateEmbedding(text);
        if (queryVector && queryVector.length === 384) {
          const vecStr = `[${queryVector.join(",")}]`;
          await supabase.from("ProfileEmbedding").upsert(
            { profile_id: profileId, embedding: vecStr },
            { onConflict: "profile_id" }
          );
        }
      }
    }

    if (!queryVector) {
      const { data: allProfiles } = await supabase
        .from("Profile")
        .select("*")
        .neq("id", profileId)
        .limit(limit);
      return NextResponse.json({
        matches: allProfiles ?? [],
        method: "fallback",
        semantic: false,
      });
    }

    try {
      const { data: embeddingRows } = await supabase
        .from("ProfileEmbedding")
        .select("embedding, profile_id")
        .neq("profile_id", profileId)
        .not("embedding", "is", null);

      if (!embeddingRows || embeddingRows.length === 0) {
        throw new Error("No embeddings found");
      }

      const scored = embeddingRows.map((row) => {
        const raw = row.embedding;
        const otherVec: number[] = typeof raw === "string" ? JSON.parse(raw) : raw;
        const similarity = cosineSimilarity(queryVector!, otherVec);
        return { profile_id: row.profile_id, similarity };
      });

      scored.sort((a, b) => b.similarity - a.similarity);
      const topIds = scored.slice(0, limit).map((s) => s.profile_id);

      if (topIds.length === 0) throw new Error("No matches after scoring");

      const { data: matchProfiles } = await supabase
        .from("Profile")
        .select("id, name, age, location, photos, tier")
        .in("id", topIds);

      const profileMap = new Map((matchProfiles ?? []).map((p) => [p.id, p]));
      const rows = scored
        .slice(0, limit)
        .map((s) => {
          const p = profileMap.get(s.profile_id);
          if (!p) return null;
          return { ...p, similarity: s.similarity };
        })
        .filter(Boolean);

      if (rows.length > 0) {
        return NextResponse.json({ matches: rows, method: "pgvector", semantic: true });
      }
    } catch (vecErr) {
      console.warn("Vector similarity query failed, using JS fallback:", vecErr);
    }

    const { data: allEmbeddings } = await supabase
      .from("ProfileEmbedding")
      .select("profile_id, embedding")
      .neq("profile_id", profileId)
      .not("embedding", "is", null);

    const scored: any[] = [];
    for (const row of allEmbeddings ?? []) {
      try {
        const raw = row.embedding;
        const otherVec: number[] = typeof raw === "string" ? JSON.parse(raw) : raw;
        const sim = cosineSimilarity(queryVector, otherVec);
        const { data: p } = await supabase
          .from("Profile")
          .select("*")
          .eq("id", row.profile_id)
          .single();
        if (p) scored.push({ ...p, similarity: sim });
      } catch { /* skip */ }
    }

    scored.sort((a, b) => b.similarity - a.similarity);
    const top = scored.slice(0, limit);

    if (top.length > 0) {
      return NextResponse.json({ matches: top, method: "js-fallback", semantic: true });
    }

    const { data: fallbackProfiles } = await supabase
      .from("Profile")
      .select("*")
      .neq("id", profileId)
      .limit(limit);
    return NextResponse.json({ matches: fallbackProfiles ?? [], method: "fallback", semantic: false });
  } catch (err: any) {
    console.error("Semantic match error:", err);
    const supabase = createAdminClient();
    const { data: allProfiles } = await supabase
      .from("Profile")
      .select("*")
      .neq("id", profileId)
      .limit(limit);
    return NextResponse.json({ matches: allProfiles ?? [], method: "fallback", semantic: false });
  }
}
