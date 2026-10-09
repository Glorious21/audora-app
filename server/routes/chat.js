/**
 * /api/chat — talk to your vault. Each turn recalls the closest memories from
 * Walrus Memory for the latest question, then asks Claude to answer using only
 * those memories (retrieval-augmented chat).
 */
import { Router } from "express";
import Anthropic from "@anthropic-ai/sdk";
import { getMemWal, withRetry } from "../lib/memwal.js";
import { isTestMemory, memoryKey, parseMemory } from "../../shared/memory.js";

export const chatRouter = Router();

const MODEL = "claude-opus-5-5";
const MAX_TURNS = 20;
const MAX_CHARS = 2000;

const SYSTEM = `You are Audora, a memory assistant for creative people (producers, songwriters, writers, designers).
The user keeps a vault of notes about their unfinished work: beats, lyrics, voice notes, sketches, and the context around them.
Each turn you are given the memories from the vault that best match the user's latest message, closest first.

- Answer from those memories. Name the piece of work (its title) and point to where it lives when the memory says so.
- If none of the memories fit, say so plainly and suggest what the user could capture or how to rephrase. Never invent work, files, dates or details.
- You can help them think: connect related ideas, suggest what to finish next, or draft a next step, but keep it grounded in what the vault holds.
- Keep replies short and conversational: a few sentences or a short list. Plain text, no headings.`;

let client;
const getClient = () => (client ??= new Anthropic());

function cleanMessages(raw) {
  if (!Array.isArray(raw)) return null;
  const msgs = raw
    .slice(-MAX_TURNS)
    .filter((m) => (m?.role === "user" || m?.role === "assistant") && typeof m.content === "string")
    .map((m) => ({ role: m.role, content: m.content.trim().slice(0, MAX_CHARS) }))
    .filter((m) => m.content);
  while (msgs.length && msgs[0].role !== "user") msgs.shift();
  if (!msgs.length || msgs.at(-1).role !== "user") return null;
  return msgs;
}

async function recallFor(query) {
  const memwal = getMemWal();
  const result = await withRetry(() => memwal.recall({ query: query.slice(0, 300), limit: 16 }), {
    label: "recall",
  });
  const seen = new Set();
  const sources = [];
  for (const r of result.results) {
    const fields = parseMemory(r.text);
    if (isTestMemory(fields, r.text)) continue;
    const id = memoryKey(fields, r.text);
    if (seen.has(id)) continue;
    seen.add(id);
    sources.push({
      text: r.text,
      blob_id: r.blob_id,
      relevance: typeof r.distance === "number" ? Math.max(0, Math.min(1, 1 - r.distance)) : null,
      fields,
    });
  }
  return sources.slice(0, 8);
}

// After an auth or billing failure, answer from recall for this long before trying Claude again.
const CLAUDE_RETRY_MS = 5 * 60_000;
let claudeDownUntil = 0;

const UNFINISHED = /\b(unfinished|not (yet )?(done|finished)|still|need|needs|missing|finish|incomplete|wip)\b/i;
const trimDots = (s) => String(s || "").trim().replace(/\.+$/, "");

/**
 * A grounded answer built only from the recalled memories, used when Claude
 * can't be reached. Names the closest matches, their stage, the story and
 * where each one lives.
 */
function recallAnswer(question, sources) {
  let picks = sources;
  if (UNFINISHED.test(question)) picks = picks.filter((s) => s.fields.status !== "done");
  const best = picks[0]?.relevance ?? 0;
  picks = picks.filter((s) => (s.relevance ?? 0) >= best - 0.12).slice(0, 3);

  if (!picks.length) {
    return {
      reply: "I couldn't find anything in your vault that matches that. Try describing it another way, or capture it first.",
      sources,
      model: null,
      mode: "recall",
    };
  }

  const describe = (s) => {
    const f = s.fields;
    const meta = [f.type, f.status && `${f.status} stage`, f.bpm && `${f.bpm} BPM`, f.key].filter(Boolean).join(", ");
    return [
      `• "${f.title || "Untitled"}"${meta ? ` (${meta})` : ""}`,
      f.notes && `  ${trimDots(f.notes)}.`,
      f.location && `  Lives in: ${trimDots(f.location)}.`,
    ]
      .filter(Boolean)
      .join("\n");
  };

  const lead =
    picks.length === 1
      ? `The closest match in your vault is "${picks[0].fields.title || "Untitled"}".`
      : "These are the closest matches in your vault, best first:";
  return { reply: `${lead}\n\n${picks.map(describe).join("\n\n")}`, sources: picks, model: null, mode: "recall" };
}

/**
 * POST /api/chat
 * body: { messages: [{ role: "user" | "assistant", content: string }, ...] }
 * → { reply, sources, model, mode? }   mode "recall" = answered without Claude
 */
chatRouter.post("/", async (req, res) => {
  const messages = cleanMessages(req.body?.messages);
  if (!messages) {
    return res.status(400).json({ error: "messages must end with a user message" });
  }
  const question = messages.at(-1).content;

  let sources;
  try {
    sources = await recallFor(question);
  } catch (err) {
    console.error("POST /api/chat recall failed:", err);
    return res.status(502).json({ error: "Failed to search Walrus Memory", detail: err.message });
  }

  const context = sources.length
    ? sources.map((s, i) => `[${i + 1}] ${s.text}`).join("\n")
    : "(no matching memories in the vault)";

  // The memories ride in the last user turn so the system prompt stays cacheable.
  const turns = [
    ...messages.slice(0, -1),
    {
      role: "user",
      content: `<memories>\n${context}\n</memories>\n\n${question}`,
    },
  ];

  if (Date.now() < claudeDownUntil) return res.json(recallAnswer(question, sources));

  try {
    const response = await getClient().beta.messages.create({
      model: MODEL,
      max_tokens: 16000,
      output_config: { effort: "low" },
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: SYSTEM,
      messages: turns,
    });

    if (response.stop_reason === "refusal") {
      return res.json({
        reply: "I can't help with that one. Try asking about the work in your vault.",
        sources,
        model: response.model,
      });
    }
    const reply = response.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("")
      .trim();
    return res.json({ reply, sources, model: response.model });
  } catch (err) {
    // No key, no credits, rate limited or offline: answer from the recalled
    // memories instead, so the chat still works. After an account-level
    // failure, skip Claude for a few minutes so every turn isn't slowed by it.
    const reason = err instanceof Anthropic.APIError ? err.error?.error?.message || err.message : err.message;
    console.warn("POST /api/chat: Claude unavailable, answering from recall:", reason);
    if (!(err instanceof Anthropic.RateLimitError)) claudeDownUntil = Date.now() + CLAUDE_RETRY_MS;
    return res.json(recallAnswer(question, sources));
  }
});
