import { NextRequest, NextResponse } from "next/server";
import { runCompletion } from "@/lib/groq";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const answers: Record<string, unknown> = body.answers ?? {};

    const prompt = `You are a spiritual archetype astrologer. Based on the following answers from a person seeking their soul archetype, generate a quirky, poetic 2-word spiritual title (e.g. "Cosmic Cowboy", "Zen Rebel", "Starlight Seeker", "Soulful Wanderer").

Answers:
${Object.entries(answers)
  .map(([k, v]) => `- ${k}: ${v}`)
  .join("\n")}

Return ONLY valid JSON — no markdown, no backticks, no extra text:
{ "archetype": "Your 2-Word Title" }`;

    const raw = await runCompletion(prompt);
    const cleaned = raw.replace(/```json?/gi, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleaned) as { archetype: string };

    return NextResponse.json({ archetype: parsed.archetype ?? "Soulful Wanderer" });
  } catch {
    return NextResponse.json(
      { archetype: "Soulful Wanderer", error: "Fallback used" },
      { status: 200 },
    );
  }
}
