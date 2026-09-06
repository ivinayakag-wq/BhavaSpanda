const HF_API_URL = "https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2";

export function buildEmbeddingText(profile: any): string {
  const parts: string[] = [];
  if (profile.bio) parts.push(`Bio: ${profile.bio}`);
  if (profile.about_me) parts.push(`About me: ${profile.about_me}`);
  if (profile.looking_for) parts.push(`Looking for: ${profile.looking_for}`);
  if (profile.non_negotiable) parts.push(`Non-negotiables: ${profile.non_negotiable}`);
  if (profile.spiritual_community) parts.push(`Spiritual community: ${profile.spiritual_community}`);
  if (profile.primary_practice) parts.push(`Primary practice: ${profile.primary_practice}`);
  if (profile.guru_connection) parts.push(`Guru connection: ${profile.guru_connection}`);
  if (profile.spiritual_commitment) parts.push(`Spiritual commitment: ${profile.spiritual_commitment}`);
  if (profile.life_goals) parts.push(`Life goals: ${profile.life_goals}`);
  if (profile.profession) parts.push(`Profession: ${profile.profession}`);
  if (profile.education) parts.push(`Education: ${profile.education}`);
  if (profile.location) parts.push(`Location: ${profile.location}`);
  if (profile.diet) parts.push(`Diet: ${profile.diet}`);
  if (profile.sun_sign) parts.push(`Sun sign: ${profile.sun_sign}`);
  return parts.join("\n");
}

export async function generateEmbedding(text: string): Promise<number[] | null> {
  if (!text.trim()) return null;

  const hfToken = process.env.HUGGINGFACE_API_KEY;

  try {
    const res = await fetch(HF_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(hfToken ? { Authorization: `Bearer ${hfToken}` } : {}),
      },
      body: JSON.stringify({ inputs: text, options: { wait_for_model: true } }),
    });

    if (!res.ok) {
      console.warn(`Hugging Face API error (${res.status}): ${await res.text()}`);
      return generateFallbackEmbedding(text);
    }

    const data = await res.json();

    if (Array.isArray(data) && data.length > 0) {
      if (Array.isArray(data[0])) {
        const vec = data[0] as number[];
        if (vec.length === 384) return vec;
      }
      if (Array.isArray(data)) {
        const flat = data as number[];
        if (flat.length === 384) return flat;
        if (flat.length > 0 && Array.isArray(flat[0])) return flat[0] as number[];
      }
    }

    if (data?.embedding && Array.isArray(data.embedding)) return data.embedding;
    if (Array.isArray(data?.data?.[0]?.embedding)) return data.data[0].embedding;

    console.warn("Unexpected HF response format, using fallback");
    return generateFallbackEmbedding(text);
  } catch (err) {
    console.warn("Hugging Face API error:", err);
    return generateFallbackEmbedding(text);
  }
}

export function generateFallbackEmbedding(text: string): number[] {
  const chars = text.toLowerCase().replace(/[^a-z\s]/g, "").split("");
  const dim = 384;
  const vec = new Array(dim).fill(0);
  for (let i = 0; i < chars.length; i++) {
    const idx = (chars[i].charCodeAt(0) * i * 7 + i * 31) % dim;
    vec[idx] += 1 / Math.log(chars.length + 2);
  }
  const mag = Math.sqrt(vec.reduce((s, v) => s + v * v, 0));
  if (mag > 0) for (let i = 0; i < dim; i++) vec[i] /= mag;
  return vec;
}

export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom === 0 ? 0 : dot / denom;
}
