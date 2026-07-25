// DeepInfra client (OpenAI-compatible). Server-side only.
// Discipline: JSON-constrained, temp 0.3, hard timeout → caller falls back to
// deterministic output. An LLM failure must never surface as a user-facing error.

import { LLM_MODEL, LLM_TIMEOUT_MS } from "@/lib/types";

const ENDPOINT = "https://api.deepinfra.com/v1/openai/chat/completions";

type ChatMessage = { role: "system" | "user"; content: string };

export async function llmJson<T>(
  messages: ChatMessage[],
  validate: (parsed: unknown) => T | null
): Promise<T | null> {
  const key = process.env.DEEPINFRA_API_KEY;
  if (!key) return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), LLM_TIMEOUT_MS);
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: LLM_MODEL,
        temperature: 0.3,
        max_tokens: 1400,
        response_format: { type: "json_object" },
        messages,
      }),
    });
    if (!res.ok) {
      console.error("[llm] non-200:", res.status);
      return null;
    }
    const data = await res.json();
    const content: string | undefined = data?.choices?.[0]?.message?.content;
    if (!content) return null;
    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      // Model sometimes wraps JSON in prose; try to find the outermost object
      const m = content.match(/\{[\s\S]*\}/);
      if (!m) return null;
      try {
        parsed = JSON.parse(m[0]);
      } catch {
        return null;
      }
    }
    return validate(parsed);
  } catch (err) {
    console.error("[llm] request failed/timeout:", (err as Error).message);
    return null;
  } finally {
    clearTimeout(timer);
  }
}
