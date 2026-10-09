// Fetch wrapper around the Audora backend. Same-origin in dev via the Vite
// proxy (/api → :3001) so the MemWal delegate key never reaches the browser.

async function json(res) {
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.detail || body.error || `HTTP ${res.status}`);
  return body;
}

const get = (url, signal) => fetch(url, { signal }).then(json);

const sleep = (ms, signal) =>
  new Promise((resolve, reject) => {
    const t = setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => {
      clearTimeout(t);
      reject(signal.reason);
    });
  });

export const api = {
  health: (signal) => get("/api/health", signal),

  capture: (fields, signal) =>
    fetch("/api/memories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields),
      signal,
    }).then(json),

  jobStatus: (jobId, signal) => get(`/api/memories/status/${encodeURIComponent(jobId)}`, signal),

  recall: (q, signal) => get(`/api/memories/search?q=${encodeURIComponent(q)}`, signal),

  chat: (messages, signal) =>
    fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
      signal,
    }).then(json),
};

/**
 * Poll a remember job until Walrus finalizes it (or it fails / we give up),
 * calling `onUpdate` with each status. Transient errors are retried; pass an
 * AbortSignal so polling stops when the component that started it unmounts.
 */
export async function pollJob(jobId, { onUpdate, signal, intervalMs = 4000, maxTries = 40 } = {}) {
  for (let n = 0; n < maxTries && !signal?.aborted; n++) {
    try {
      const s = await api.jobStatus(jobId, signal);
      onUpdate?.({ job_id: jobId, ...s });
      if (s.finalized || s.status === "failed") return s;
    } catch (err) {
      if (signal?.aborted) return null;
      if (/not.?found/i.test(err.message)) return null; // nothing to wait for
    }
    await sleep(intervalMs, signal).catch(() => {});
  }
  return null;
}
