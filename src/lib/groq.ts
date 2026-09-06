import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "",
});

export function getGroqClient() {
  return groq;
}

export async function runCompletion(prompt: string): Promise<string> {
  const completion = await groq.chat.completions.create({
    model: "llama3-8b-8192",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 600,
  });

  return completion.choices[0]?.message?.content?.trim() ?? "";
}
