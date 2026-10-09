# Audora

**A memory layer for creative work.** Artists, producers and writers generate a
flood of ideas — beats, songs, lyrics, voice notes, concepts, drafts — and lose
the *context* around them. Audora lets you capture that context in natural
language and recall it later by meaning, even when you don't remember the title
or the filename.

The semantic memory layer is **[Walrus Memory](https://memory.walrus.xyz)**
(`@mysten-incubation/memwal`) — no custom database or vector store. The MemWal
relayer handles embedding, encryption, storage on Walrus, and semantic recall.

> Built for the **Walrus Memory Prompt Jam**. [`prompts/audora.md`](prompts/audora.md)
> has two prompts: a **system prompt** you paste into `CLAUDE.md` / any MCP client
> to turn your assistant into a creative memory, and the **build prompt** that
> regenerates this whole app.

## The problem

**Who:** producers, songwriters and beatmakers — but also writers, screenwriters,
designers, filmmakers, photographers and game devs. Anyone who generates more raw
ideas than they can finish, especially alongside an AI assistant. Not just music.

**Pain:** a creative forgets an idea because there's no consistent way to catch
it. One goes in a voice memo, the next in a Notion page, the next on a napkin,
the next as `idea_final_v3.als` — a different place and a different shape every
time, so there's nothing to search. You make a beat (or draft a verse, or sketch
a shot list) at 2 a.m., save the file, and move on. Six months later there are
400 fragments across five apps and no memory of which one had the part you loved,
what it still needed, who you made it with, or where it lives. The *context*
around an idea — the mood, the collaborator, the missing piece, the session it
came from — is the highest-value part of the work, and it evaporates the moment
you close the session. Filenames don't hold it. You can't grep a feeling.

**Solution:** Audora gives every idea *one consistent shape and one place*. It
saves the context as a single structured sentence to Walrus Memory the instant
you capture it, and lets you recall it later in plain language — *"the moody
thing with the vocal chop from that late session"*, *"the story idea about the
lighthouse keeper"* — ranked by meaning. No tags to maintain, no naming
discipline, no database to run.

## 60-second verify

| | |
|---|---|
| 📄 System prompt | [`prompts/audora.md`](prompts/audora.md#the-audora-system-prompt) — paste into any MCP client, fill the config block, done |
| 📄 Build prompt | [`prompts/audora.md`](prompts/audora.md#build-the-reference-app-from-scratch) — copy-paste, rebuild the whole app |
| ▶️ Run it | `cp .env.example .env` → `npm install` → `npm run dev` → **http://localhost:5173** (landing `/`, Studio `/studio`) |
| 🩺 Connection test | `npm run step0` — health → `remember()` → `recall()` against the live relayer, prints **PASS** |
| ⛓️ On-chain account | [`MemWalAccount` on Suiscan](https://suiscan.xyz/mainnet/object/0x392e1063bb45715908cfa751c82e232269fcaa5029eabaadd4d30c239687f6be) — mainnet, holds the memories |
| 🛠️ Tool surface | `health` · `remember` · `remember_bulk` · `analyze` · `recall` · `restore` — the system prompt ties each to a trigger; the app wires `health` / `remember` / `getRememberStatus` / `recall` to real UI actions |
| 🎬 Demo | click **Run 2-min demo** in the Studio — seeds four real memories, recalls one cold  https://youtu.be/Qw8WglkZTa8|

## How it works

Every idea is stored as **one MemWal memory**, written as a consistent
structured sentence so recall stays reliable:

```
{Type} — "{title}". Captured on {date}. Stage: {status}. Tags: {tags}.
Tempo: {bpm} BPM. Key: {key}. Where it lives: {location}. Context: {notes}.
```

- **Capture** → backend formats the sentence → `memwal.remember(text)` → returns
  a `job_id` (proof of write) → `blob_id` once Walrus finalizes.
- **Recall** → `memwal.recall({ query })` → results ranked by semantic
  `distance` (lower = closer), re-parsed back into structured fields for the UI.

### The core logic — `server/lib/memwal.js` + `server/routes/memories.js`

```js
import { MemWal } from "@mysten-incubation/memwal";

const memwal = MemWal.create({
  key: process.env.MEMWAL_KEY,
  accountId: process.env.MEMWAL_ACCOUNT_ID,
  serverUrl: process.env.MEMWAL_SERVER_URL,
  namespace: process.env.MEMWAL_NAMESPACE, // "audora-demo"
});

// capture
const { job_id } = await memwal.remember(memorySentence);
const { blob_id } = await memwal.getRememberStatus(job_id);

// recall
const { results } = await memwal.recall({ query, limit: 12 });
// results: [{ text, distance, blob_id }]
```

## Setup

One codebase — the React UI (`index.html` + `src/`) and the Express API
(`server/`) share a single `package.json` and one `node_modules`.

```bash
cp .env.example .env          # fill in MEMWAL_ACCOUNT_ID + MEMWAL_KEY
npm install

npm run step0                 # verify Walrus Memory end-to-end  => PASS
npm run dev                   # Vite UI :5173  +  Express API :3001 (proxied)
```

Open **http://localhost:5173** — the landing page is at `/`, the Studio at
`/studio`.

### Production

```bash
npm run build                 # emits dist/
npm start                     # Express serves the API + the built UI on :3001
```

### Deploy (Vercel)

`vercel.json` is committed. The Vite UI builds to `dist/` (served as static
assets); every `/api/*` request is routed to a single serverless function
(`api/[...path].js`) that runs the same Express app via `createApp()`.

```bash
npx vercel            # first run: log in + link the project
npx vercel --prod     # deploy
```

Or import the repo at [vercel.com/new](https://vercel.com/new). Either way, set
these Environment Variables in the Vercel project:

| var | value |
|---|---|
| `MEMWAL_ACCOUNT_ID` | your Walrus Memory account object ID |
| `MEMWAL_KEY` | your Ed25519 delegate key |
| `MEMWAL_SERVER_URL` | `https://relayer.memory.walrus.xyz` |
| `MEMWAL_NAMESPACE` | `audora-demo` |
| `ANTHROPIC_API_KEY` | your Anthropic API key, for the Ask Audora chat |

### Deploy (Render)

`render.yaml` is a Blueprint. In Render: **New → Blueprint**, connect this repo,
then set the secrets when prompted:

| var | value |
|---|---|
| `MEMWAL_ACCOUNT_ID` | your Walrus Memory account object ID |
| `MEMWAL_KEY` | your Ed25519 delegate key |
| `ANTHROPIC_API_KEY` | your Anthropic API key, for the Ask Audora chat |

`MEMWAL_SERVER_URL` and `MEMWAL_NAMESPACE` are set by the blueprint. Build runs
`npm install && npm run build`; the service starts with `npm start` and Express
serves both the API and the built UI on the port Render provides.

## Layout

```
index.html            UI entry (root)
vite.config.js         Vite + /api → :3001 dev proxy
src/                   React app
  App.jsx              route switch (lib/router.jsx — no react-router dep)
  pages/Landing.jsx    marketing landing  ( / )
  pages/Studio.jsx     capture + recall + proofs  ( /studio )
  components/          panels, cards, AudoraLogo
server/                Express API — holds the MemWal delegate key
  app.js               createApp() — shared Express app factory
  index.js  dev.js     standalone-server entrypoints (dev.js skips dist/)
  lib/memwal.js        the only place the MemWal client is created
  routes/memories.js   capture / status / recall
api/[...path].js       Vercel serverless entry — runs createApp()
scripts/step0-*.js     standalone connection test
```

## API

| Method | Route | Purpose |
|---|---|---|
| `GET`  | `/api/health` | relayer health, `write_ready`, account, namespace |
| `POST` | `/api/memories` | `{ title, type, date, tags, status, bpm, key, location, notes }` → `{ job_id, blob_id, memoryText }` |
| `GET`  | `/api/memories/status/:jobId` | poll a remember job to `done` |
| `GET`  | `/api/memories/search?q=...` | natural-language recall |

`type` ∈ beat · song · lyrics · voice note · concept · sample · other
`status` ∈ idea · rough · refining · done

## UI

- **Landing** (`/`) — what Audora is, how the capture → recall flow works, the stack.
- **Studio** (`/studio`) — capture panel (left) + recall panel (right). Recall
  shows ranked memory cards with a relevance ring, parsed metadata, and the
  Walrus `blob_id`.
- **On-Chain Proofs** — every write this session with its `job_id` / `blob_id`.
- **Run 2-min demo** — seeds four sample memories so recall has something to find.
- Account, namespace and live relayer status are shown in the Studio header strip.

React + Vite + MUI (form controls) + framer-motion. Light editorial theme, blue
accent, mobile-responsive.

## Notes

- The delegate key is read from `.env` on the **backend only** — never sent to
  the browser. `.env` is gitignored; `.env.example` has placeholders.
- `MEMWAL_SERVER_URL` is a one-line swap between relayers. These credentials are
  registered on **production** (`relayer.memory.walrus.xyz`).
- The production relayer is occasionally slow / returns transient `401`s;
  `server/lib/memwal.js` retries through it (`withRetry`, `pollRememberJob`).
