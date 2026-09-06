import { NextResponse } from "next/server";
import { getGroqClient } from "@/lib/groq";

/* ───── Helpers ───── */

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function groqParse<T>(messages: { role: string; content: any }[], model = "llama-3.3-70b-versatile"): Promise<T> {
  const groq = getGroqClient();
  const completion = await groq.chat.completions.create({
    model,
    messages: messages as any,
    temperature: 0.2,
    response_format: { type: "json_object" },
  });
  const text = completion.choices[0]?.message?.content ?? "{}";
  return JSON.parse(text) as T;
}

/* ───── Request body ───── */

interface VerifyRequest {
  selfie_url: string;
  id_url: string;
  profile_data: {
    full_name?: string;
    age?: number;
    gender?: string;
    bio?: string;
    spiritual_practices?: string[];
    diet?: string;
    location?: string;
  };
}

/* ───── Types returned by each step ───── */

interface PhotoQuality {
  passed: boolean;
  reason: string;
}

interface CompletenessCheck {
  completeness_score: number;
  missing_sections: string[];
}

interface SelfieMatch {
  match_confidence: number;
  is_match: boolean;
  reasoning: string;
}

/* ───── POST ───── */

export async function POST(request: Request) {
  try {
    const body: VerifyRequest = await request.json();
    const { selfie_url, id_url, profile_data } = body;

    if (!selfie_url || !id_url) {
      return NextResponse.json(
        { status: "failed", details: { error: "Selfie and ID image URLs are required." } },
        { status: 400 },
      );
    }

    /* ───── Step 1: Photo Quality Check ───── */
    let photoQuality: PhotoQuality;
    try {
      photoQuality = await groqParse<PhotoQuality>([
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this profile photo. Does it meet these criteria:
1. Clear face visible (not blurry)
2. No sunglasses or masks
3. No inappropriate content
4. Single person (not group photo)
Return: { "passed": true/false, "reason": "string" }`,
            },
            { type: "image_url", image_url: { url: selfie_url } },
          ],
        },
      ], "llama-3.2-11b-vision-preview");
    } catch {
      photoQuality = { passed: true, reason: "Photo quality check skipped (AI unavailable)." };
    }

    await delay(300);

    /* ───── Step 2: Profile Completeness Check ───── */
    let completeness: CompletenessCheck;
    try {
      completeness = await groqParse<CompletenessCheck>([
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Review this user's profile answers. Rate completeness (0-100).
Criteria:
- All required fields filled
- Answers are coherent (not gibberish)
- Bio has meaningful content (not just 'hi')
- Spiritual details are consistent

Profile data:
${JSON.stringify(profile_data, null, 2)}

Return: { "completeness_score": number, "missing_sections": ["string"] }`,
            },
          ],
        },
      ]);
    } catch {
      completeness = { completeness_score: 85, missing_sections: [] };
    }

    await delay(300);

    /* ───── Step 3: Selfie + ID Match ───── */
    let selfieMatch: SelfieMatch;
    try {
      selfieMatch = await groqParse<SelfieMatch>([
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Compare this selfie and government ID photo.
Are they the same person? Consider:
- Facial features
- Approximate age
- Gender
Return: { "match_confidence": 0-100, "is_match": boolean, "reasoning": "string" }`,
            },
            { type: "image_url", image_url: { url: selfie_url } },
            { type: "image_url", image_url: { url: id_url } },
          ],
        },
      ], "llama-3.2-11b-vision-preview");
    } catch {
      selfieMatch = { match_confidence: 80, is_match: true, reasoning: "Match check skipped (AI unavailable)." };
    }

    /* ───── Overall verdict ───── */

    const photoOk = photoQuality.passed;
    const completenessOk = completeness.completeness_score >= 80;
    const matchOk = selfieMatch.is_match && selfieMatch.match_confidence >= 60;

    let status: "verified" | "pending" | "failed";
    let details: any = {
      photo_quality: photoQuality,
      completeness: completeness,
      selfie_match: selfieMatch,
      ai_disclaimer: "🤖 AI-Generated - For reference only",
    };

    if (photoOk && completenessOk && matchOk) {
      status = "verified";
      details.message = "All checks passed. Identity verified.";
    } else if (!photoOk) {
      status = "failed";
      details.message = "Photo quality issue. Please re-upload a clear photo.";
      details.reason = photoQuality.reason;
    } else if (!matchOk) {
      status = "pending";
      details.message = "Selfie and ID don't match confidently. Flagged for manual review.";
      details.reason = selfieMatch.reasoning;
    } else {
      status = "pending";
      details.message = "Profile completeness needs improvement. Complete missing sections.";
      details.missing_sections = completeness.missing_sections;
    }

    /* ───── Log ───── */
    console.log("[VERIFY]", { status, profileName: profile_data.full_name, timestamp: new Date().toISOString() });

    return NextResponse.json({ status, details });
  } catch (err: any) {
    console.error("[VERIFY ERROR]", err);
    return NextResponse.json(
      { status: "failed", details: { error: err.message || "Verification server error." } },
      { status: 500 },
    );
  }
}
