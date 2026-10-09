/**
 * Single source of truth for the Walrus Memory (MemWal) client.
 *
 * The delegate key never leaves the backend. Everything that touches MemWal
 * — health, remember, recall — goes through the client created here.
 */
import { MemWal } from "@mysten-incubation/memwal";

// The vault a creative's memories live in. Configurable so a clean namespace
// is a one-line swap.
export const NAMESPACE = process.env.MEMWAL_NAMESPACE || "audora-demo";

const DEFAULT_SERVER_URL = "https://relayer.memory.walrus.xyz";

let client;

/** Lazily create (and cache) the MemWal client from environment variables. */
export function getMemWal() {
  if (client) return client;

  const { MEMWAL_ACCOUNT_ID, MEMWAL_KEY, MEMWAL_SERVER_URL } = process.env;

  if (!MEMWAL_ACCOUNT_ID || !MEMWAL_KEY) {
    throw new Error(
      "Missing MemWal credentials. Set MEMWAL_ACCOUNT_ID and MEMWAL_KEY in your .env file " +
        "(see .env.example). Generate them at https://memory.walrus.xyz.",
    );
  }

  client = MemWal.create({
    key: MEMWAL_KEY,
    accountId: MEMWAL_ACCOUNT_ID,
    serverUrl: MEMWAL_SERVER_URL || DEFAULT_SERVER_URL,
    namespace: NAMESPACE,
  });

  return client;
}

/**
 * The relayer is occasionally flaky under load: signed requests can come back
 * as a transient `401` (empty body) and remember jobs can sit in `pending` /
 * `running` for minutes while `write_ready` flaps. These helpers retry through
 * that instead of failing the whole operation.
 */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function isTransient(err) {
  const status = err?.status;
  const code = err?.serverCode;
  return (
    status === 401 || status === 429 || status === 502 || status === 503 || status === 504 ||
    code === "AUTH_REJECTED" ||
    err?.name === "TypeError" // fetch network blip
  );
}

/** Call an async MemWal op, retrying transient relayer errors with backoff. */
export async function withRetry(fn, { tries = 6, baseMs = 1500, label = "memwal op" } = {}) {
  let lastErr;
  for (let attempt = 1; attempt <= tries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (!isTransient(err) || attempt === tries) throw err;
      const wait = baseMs * attempt;
      console.warn(
        `[memwal] ${label} transient failure (attempt ${attempt}/${tries}, ` +
          `status ${err?.status ?? "?"}): retrying in ${wait}ms`,
      );
      await sleep(wait);
    }
  }
  throw lastErr;
}

/**
 * Poll a remember job to a terminal state ourselves, tolerating transient 401s
 * from the poll endpoint. Returns the RememberJobStatus (`done` | `failed`), or
 * the last non-terminal status if we run out of budget.
 */
export async function pollRememberJob(jobId, { timeoutMs = 180_000, intervalMs = 3000 } = {}) {
  const memwal = getMemWal();
  const deadline = Date.now() + timeoutMs;
  let last = { job_id: jobId, status: "pending" };

  while (Date.now() < deadline) {
    try {
      last = await memwal.getRememberStatus(jobId);
      if (last.status === "done" || last.status === "failed") return last;
    } catch (err) {
      if (!isTransient(err)) throw err;
      // transient — fall through and retry after the interval
    }
    await sleep(intervalMs);
  }
  return { ...last, timedOut: true };
}
