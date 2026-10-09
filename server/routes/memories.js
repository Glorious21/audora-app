/**
 * /api/memories — capture the context around a piece of creative work as one
 * Walrus Memory, and recall it later with a natural-language query.
 */
import { Router } from "express";
import { getMemWal, withRetry, pollRememberJob } from "../lib/memwal.js";
import { formatMemory, parseMemory, validateCapture } from "../../shared/memory.js";

export const memoriesRouter = Router();

/**
 * POST /api/memories
 * body: { title, type, date, tags, status, bpm, key, location, notes }
 * (validated by validateCapture in shared/memory.js)
 *
 * Formats the fields into the canonical memory sentence, stores it via
 * remember(), then polls the job briefly. Always returns the job_id (proof of
 * storage); blob_id is included once the relayer finalizes.
 */
memoriesRouter.post("/", async (req, res) => {
  const { fields, error } = validateCapture(req.body ?? {});
  if (error) return res.status(400).json({ error });
  const memoryText = formatMemory(fields);

  try {
    const memwal = getMemWal();

    const accepted = await withRetry(() => memwal.remember(memoryText), {
      label: "remember",
    });

    // Short window for the relayer to finalize so the response can carry a
    // blob_id. If it's still working, the client polls /api/memories/status.
    const job = await pollRememberJob(accepted.job_id, {
      timeoutMs: 25_000,
      intervalMs: 2500,
    });

    return res.status(201).json({
      job_id: accepted.job_id,
      status: job.status,
      blob_id: job.blob_id ?? null,
      finalized: job.status === "done",
      namespace: job.namespace ?? undefined,
      fields,
      memoryText,
    });
  } catch (err) {
    console.error("POST /api/memories failed:", err);
    return res
      .status(502)
      .json({ error: "Failed to store memory in Walrus Memory", detail: err.message });
  }
});

/**
 * GET /api/memories/status/:jobId — poll a remember job until finalized.
 */
memoriesRouter.get("/status/:jobId", async (req, res) => {
  if (!/^[\w-]{1,64}$/.test(req.params.jobId)) {
    return res.status(400).json({ error: "invalid job id" });
  }
  try {
    const memwal = getMemWal();
    const status = await withRetry(
      () => memwal.getRememberStatus(req.params.jobId),
      { label: "getRememberStatus", tries: 3 },
    );
    return res.status(status.status === "not_found" ? 404 : 200).json({
      job_id: status.job_id,
      status: status.status,
      blob_id: status.blob_id ?? null,
      finalized: status.status === "done",
      error: status.error ?? null,
    });
  } catch (err) {
    console.error("GET /api/memories/status failed:", err);
    return res.status(502).json({ error: "Failed to read job status", detail: err.message });
  }
});

/**
 * GET /api/memories/search?q=... — natural-language recall.
 */
memoriesRouter.get("/search", async (req, res) => {
  const query = String(req.query.q ?? "").trim();
  if (!query) {
    return res.status(400).json({ error: "query param q is required" });
  }
  if (query.length > 300) {
    return res.status(400).json({ error: "query must be 300 characters or fewer" });
  }

  try {
    const memwal = getMemWal();

    // The relayer occasionally returns an empty result set on a transient
    // hiccup rather than throwing. Retry a few times before trusting "nothing".
    let result;
    for (let attempt = 1; attempt <= 3; attempt++) {
      result = await withRetry(() => memwal.recall({ query, limit: 12 }), {
        label: "recall",
      });
      if (result.results.length > 0 || attempt === 3) break;
      await new Promise((r) => setTimeout(r, 1200));
    }

    // The same idea captured more than once (re-running the demo, re-saving
    // with tweaked notes) comes back as several hits. Results arrive closest
    // first, so keep only the best match per type + title.
    const seen = new Set();
    const results = [];
    for (const r of result.results) {
      const fields = parseMemory(r.text);
      const id = fields.title ? `${fields.type}|${fields.title.toLowerCase()}` : r.text;
      if (seen.has(id)) continue;
      seen.add(id);
      results.push({
        text: r.text,
        distance: r.distance,
        relevance:
          typeof r.distance === "number" ? Math.max(0, Math.min(1, 1 - r.distance)) : null,
        blob_id: r.blob_id,
        fields,
      });
    }

    return res.json({ query, total: results.length, results });
  } catch (err) {
    console.error("GET /api/memories/search failed:", err);
    return res
      .status(502)
      .json({ error: "Failed to search Walrus Memory", detail: err.message });
  }
});
