import Groq from "groq-sdk";

let _groq: Groq | null = null;

function getGroq(): Groq {
  if (_groq) return _groq;
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("GROQ_API_KEY is not set");
  _groq = new Groq({ apiKey: key });
  return _groq;
}

export function getGroqClient() {
  return getGroq();
}

export async function runCompletion(prompt: string): Promise<string> {
  const groq = getGroq();
  const completion = await groq.chat.completions.create({
    model: "llama3-8b-8192",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 600,
  });

  return completion.choices[0]?.message?.content?.trim() ?? "";
}
