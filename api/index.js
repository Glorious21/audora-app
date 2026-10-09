/**
 * Vercel serverless entry. vercel.json rewrites every /api/* path here, and
 * Vercel keeps the original req.url, so Express routes match as usual.
 *
 * Vercel serves the built UI (dist/) as static assets and rewrites all other
 * paths to index.html (see vercel.json), so this function only handles the API.
 * The Express app matches on the original req.url ("/api/health", …).
 */
import "dotenv/config";
import { createApp } from "../server/app.js";

const app = createApp({ serveStatic: false });

export default app;

// POST /api/memories briefly polls the relayer; give it headroom past the
// 10s default. Hobby allows up to 60s.
export const config = { maxDuration: 60 };
