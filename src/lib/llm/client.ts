// DeepInfra client (OpenAI-compatible). Server-side only.
// Discipline: an LLM failure must never surface as a user-facing error —
// every caller has a deterministic fallback.

import { LLM_MODEL } from "@/lib/types";

const ENDPOINT = "https://api.deepinfra.com/v1/openai/chat/completions";
const DEFAULT_TIMEOUT_MS = 20_000;

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export type ToolDef = {
  type: "function";
  function: { name: string; description?: string; parameters: unknown };
};

async function callDeepInfra(body: Record<string, unknown>, timeoutMs: number): Promise<unknown | null> {
  const key = process.env.DEEPINFRA_API_KEY;
  if (!key) return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model: LLM_MODEL, ...body }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** Forced tool call; returns the parsed JSON arguments of the named tool, or null. */
export async function chatToolCall(opts: {
  messages: ChatMessage[];
  tool: ToolDef;
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
}): Promise<unknown | null> {
  const data = await callDeepInfra(
    {
      messages: opts.messages,
      tools: [opts.tool],
      tool_choice: { type: "function", function: { name: opts.tool.function.name } },
      temperature: opts.temperature ?? 0.1,
      max_tokens: opts.maxTokens ?? 1600,
    },
    opts.timeoutMs ?? DEFAULT_TIMEOUT_MS
  );
  try {
    const d = data as {
      choices?: { message?: { tool_calls?: { function?: { name?: string; arguments?: string } }[] } }[];
    };
    const call = d?.choices?.[0]?.message?.tool_calls?.find(
      (c) => c.function?.name === opts.tool.function.name
    );
    if (!call?.function?.arguments) return null;
    return JSON.parse(call.function.arguments);
  } catch {
    return null;
  }
}

/** Plain prose completion; returns text or null. */
export async function chatText(opts: {
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
}): Promise<string | null> {
  const data = await callDeepInfra(
    {
      messages: opts.messages,
      temperature: opts.temperature ?? 0.4,
      max_tokens: opts.maxTokens ?? 900,
    },
    opts.timeoutMs ?? DEFAULT_TIMEOUT_MS
  );
  const d = data as { choices?: { message?: { content?: string } }[] };
  const text = d?.choices?.[0]?.message?.content;
  return typeof text === "string" && text.trim() ? text.trim() : null;
}
