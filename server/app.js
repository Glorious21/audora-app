/**
 * Audora — Express app factory.
 *
 * Shared by the standalone server (server/index.js) and the Vercel serverless
 * function (api/[...path].js). The delegate key is read from the environment
 * here and NEVER sent to the browser.
 *
 *   GET  /api                      → API info
 *   GET  /api/health               → relayer health
 *   POST /api/memories             → capture a piece of work as one memory
 *   GET  /api/memories/status/:id  → poll a remember job
 *   GET  /api/memories/search?q=   → natural-language recall
 *   POST /api/chat                 → AI chat grounded in the vault
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import cors from "cors";

import { getMemWal, NAMESPACE, withRetry } from "./lib/memwal.js";
import { WORK_TYPES, STAGES } from "../shared/memory.js";
import { memoriesRouter } from "./routes/memories.js";
import { chatRouter } from "./routes/chat.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.resolve(__dirname, "../dist");

/**
 * Build the Audora Express app.
 *
 * @param {object}  [opts]
 * @param {boolean} [opts.serveStatic] Serve the built UI from dist/ and add the
 *   SPA fallback. Used by the standalone server in production; left off on
 *   Vercel, where static assets are served by the platform.
 */
export function createApp({ serveStatic = false } = {}) {
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: "32kb" }));
  app.disable("x-powered-by");

  app.use((req, _res, next) => {
    if (req.url.startsWith("/api")) {
      console.log(`${new Date().toISOString()}  ${req.method} ${req.url}`);
    }
    next();
  });

  // ── API ──────────────────────────────────────────────────────────────────
  app.get("/api", (_req, res) => {
    res.json({
      service: "Audora API",
      namespace: NAMESPACE,
      ok: true,
      endpoints: [
        "GET  /api/health",
        "POST /api/memories",
        "GET  /api/memories/status/:jobId",
        "GET  /api/memories/search?q=...",
        "POST /api/chat",
      ],
    });
  });

  // Every open Studio tab polls /api/health; share one relayer round-trip
  // between them instead of hitting the relayer per request.
  let healthCache = { at: 0, promise: null };
  const HEALTH_TTL_MS = 10_000;
  const relayerHealth = () => {
    if (!healthCache.promise || Date.now() - healthCache.at > HEALTH_TTL_MS) {
      const memwal = getMemWal();
      const promise = withRetry(() => memwal.health(), { label: "health", tries: 3 });
      healthCache = { at: Date.now(), promise };
      promise.catch(() => {
        if (healthCache.promise === promise) healthCache = { at: 0, promise: null };
      });
    }
    return healthCache.promise;
  };

  app.get("/api/health", async (_req, res) => {
    try {
      const health = await relayerHealth();
      const acct = process.env.MEMWAL_ACCOUNT_ID || "";
      res.json({
        ok: health.status === "ok",
        namespace: NAMESPACE,
        relayer: process.env.MEMWAL_SERVER_URL || "(default)",
        // account object ID is a public Sui object id; masked middle for display
        account: acct,
        accountMasked: acct ? `${acct.slice(0, 8)}…${acct.slice(-6)}` : null,
        writeReady: health.write_ready ?? null,
        relayerVersion: health.relayerVersion ?? health.version,
        workTypes: WORK_TYPES,
        stages: STAGES,
      });
    } catch (err) {
      console.error("GET /api/health failed:", err);
      res.status(502).json({ ok: false, error: err.message });
    }
  });

  app.use("/api/memories", memoriesRouter);
  app.use("/api/chat", chatRouter);

  app.use("/api", (_req, res) => res.status(404).json({ error: "not found" }));

  // ── UI (standalone server only) ──────────────────────────────────────────
  if (serveStatic && fs.existsSync(path.join(DIST_DIR, "index.html"))) {
    app.use(express.static(DIST_DIR));
    // SPA fallback — every non-API route renders the client shell.
    app.get(/^(?!\/api).*/, (_req, res) => res.sendFile(path.join(DIST_DIR, "index.html")));
  }

  return app;
}

export { NAMESPACE };
