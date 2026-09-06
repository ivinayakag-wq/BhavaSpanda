import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
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
    const supabase = createAdminClient();

    const { data: profile } = await supabase
      .from("Profile")
      .select("*")
      .eq("id", profileId)
      .single();

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

    await supabase.from("ProfileEmbedding").upsert(
      { profile_id: profileId, embedding: vecStr },
      { onConflict: "profile_id" }
    );

    return NextResponse.json({ success: true, dimensions: embedding.length });
  } catch (err: any) {
    console.error("Embedding generation error:", err);
    return NextResponse.json({ error: err.message || "Failed to generate embedding" }, { status: 500 });
  }
}
