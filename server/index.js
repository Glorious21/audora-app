/**
 * Audora — standalone server (local dev + Render / any Node host).
 *
 * Builds the Express app from server/app.js and listens on $PORT. Once
 * `npm run build` has produced dist/, the app also serves the built UI.
 * On Vercel this file is unused — see api/index.js.
 */
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createApp, NAMESPACE } from "./app.js";
import { getMemWal } from "./lib/memwal.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_INDEX = path.resolve(__dirname, "../dist/index.html");
// In dev the Vite server on :5173 owns the UI; don't also serve a stale dist/.
const hasBuiltUI = process.env.AUDORA_DEV !== "1" && fs.existsSync(DIST_INDEX);

const app = createApp({ serveStatic: hasBuiltUI });

if (!hasBuiltUI) {
  app.get("/", (_req, res) =>
    res
      .type("text/plain")
      .send("Audora API is running. Start the UI with `npm run dev` (or build it with `npm run build`)."),
  );
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n  Audora API   →  http://localhost:${PORT}`);
  console.log(`  namespace    →  ${NAMESPACE}`);
  console.log(`  relayer      →  ${process.env.MEMWAL_SERVER_URL || "(default)"}`);
  console.log(`  UI           →  ${hasBuiltUI ? `served from dist/ at http://localhost:${PORT}` : "run `npm run dev` for the Vite dev server on :5173"}\n`);
  try {
    getMemWal();
  } catch (err) {
    console.error("  ⚠  ", err.message, "\n");
  }
});
