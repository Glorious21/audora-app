# Audora — design handoff

Brief for continuing the UI mockups. Everything below matches what is live in
the code today (`src/index.css`, `src/components/AudoraLogo.jsx`,
`src/components/PartnerLockup.jsx`). Screenshots of the current build are in
this folder.

| File | What it shows |
|---|---|
| `landing-desktop.png` | Landing page, full length, 1440 wide |
| `studio-desktop.png` | Studio (the app), 1440 wide, empty state |
| `studio-narrow.png` | Studio at 520 wide (single column) |
| `audora-mark.svg` | The logo mark, final geometry |

---

## 1. Product in one paragraph

Audora is a memory layer for creative work. Producers, songwriters and other
creatives capture the *context* around an idea (title, type, stage, tags,
tempo, key, where the file lives, the story behind it) and later find it by
describing it in plain language: "the amapiano thing with the vocal chop
from that late session". Each idea is stored as one structured sentence in
**Walrus Memory**, encrypted on Walrus, which is built on **Sui**. Built for
the Walrus Memory Prompt Jam.

**Users:** producers, beatmakers, songwriters; also writers, filmmakers and
designers. Many work late at night with lots of unfinished ideas.

**Feeling to aim for:** a songwriter's notebook. Warm, calm and literary, not
a crypto dashboard. The blockchain is the proof underneath, not the headline.

---

## 2. Brand system (current)

### Direction: warm editorial
Cream paper, ink-black type, a single vermilion accent, serif display
headlines with italic vermilion emphasis on key words.

### Colour tokens

| Token | Hex | Use |
|---|---|---|
| `--bg` | `#F6F1E7` | Page background (cream paper, with faint grain) |
| `--surface` | `#FCFAF5` | Cards, panels, inputs |
| `--surface-2` | `#F3EDE1` | Secondary fills, chips |
| `--surface-3` | `#E8E0CF` | Disabled fills, scrollbars |
| `--line` | `#E2D9C6` | Default borders |
| `--line-strong` | `#CFC3AB` | Input borders |
| `--ink` / `--text` | `#1C1915` | Primary text, primary buttons, dark blocks |
| `--text-2` | `#5B5346` | Body copy |
| `--text-3` | `#8C8270` | Hints, metadata |
| `--accent` | `#D9480F` | Vermilion: kickers, italic emphasis, active states, logo crossbar |
| `--accent-strong` | `#B03A0A` | Hover / pressed accent |
| `--paper-on-ink` | `#F6F1E7` | Text on ink blocks |
| `--green` | `#3F7D3A` | Online, finalized |
| `--red` | `#C0392B` | Errors |

Stage colours (memory lifecycle): idea `#8C8270` · rough `#C98A1B` ·
refining `#D9480F` · done `#3F7D3A`.

### Typography

| Role | Font | Notes |
|---|---|---|
| Display (h1, h2) | **Fraunces** (variable) | Weight ~460, `opsz 120`, `SOFT 50`, tracking −0.025em. Emphasis words in *italic vermilion* (`WONK 1`, `SOFT 100`) |
| UI / body | **Inter** (variable) | 13–16px; 600–650 for labels and card titles |
| Data / code | **JetBrains Mono** (variable) | Blob IDs, job IDs, the canonical memory sentence, kickers' numerals |
| Kickers | Inter 11px, 650, uppercase, 0.13em tracking, vermilion | Section labels like CAPTURE / RECALL |

Headline pattern: plain ink words plus one *italic vermilion* phrase, such as
"A memory for *everything* you make" or "Recall *the way you think.*".

### Shape and depth
- Radius: 10px cards (`--radius`), 7px small, 16px large blocks, pill buttons.
- Shadows are warm brown, not grey: `0 1px 3px rgba(60,45,20,.06)` resting,
  `0 28px 60px -28px rgba(60,40,15,.35)` for hero cards.
- Studio background: faint ruled notebook lines (32px rhythm) fading out
  down the page, plus a soft vermilion/amber wash at the top.

### Buttons
- **Primary:** ink pill, paper text, turns `--accent-strong` on hover.
- **Ghost:** surface fill, `--line-strong` border.
- **On ink blocks:** vermilion pill, paper text.

---

## 3. Logo

**The mark is a letter "A" built from audio waveform bars.** Seven rounded
vertical bars on an ink tile: the tops step up to a central peak (the A's
apex), the two tallest bars form its legs, the outer stubs are waveform
tails, and three **vermilion** segments under the middle bars form the
crossbar.

- Geometry (40×40 box, bar width 3.4, fully rounded):
  `x = 6.2, 10.8, 15.4, 20, 24.6, 29.2, 33.8`. Tops step 25.5 → 17 → 12 →
  6.5 (apex) and back. Crossbar segments sit at y 23, height 5.
- Tile: `#1C1915`, radius 10 (of 40). Bars `#F6F1E7`, crossbar `#D9480F`.
- Still reads as an A at 32px. At 16px it reads as a waveform.
- **Wordmark:** "Audora" in Fraunces ~560 weight, followed by a vermilion
  full stop: **Audora.**
- Mono variant (`tone="mono"`): bars only, in currentColor, no tile.

---

## 4. Ecosystem branding: Sui and Walrus

Audora is built on Sui (memory stored on Walrus). The **official Sui logo
files** (from the Sui media kit) are in `public/brand/sui/` in black, white
and Sui Blue. Rules from the Sui kit that every mockup must follow:

- **Never** redraw, recolour, stretch or restyle the Sui logo. Use the files
  only. Allowed colours: black, white, Sui Blue 600 `#298DFF`. On Audora's
  cream/ink palette we use **black** on paper and **white** on ink.
- **Partnership lockup** (used in the landing footer): Audora mark | divider
  | Sui logo. Both logos at the same height, a 1.5px divider spanning the
  symbol's full height, and clear space on each side equal to the width of
  the "u" in "Sui" (~0.36 × logo height).
- **Credit line** (hero, CTA block, Studio footer): "Built on [Sui logo] ·
  memory stored on **Walrus**".
- Sui's colours and typeface (TWK Everett) are **not** used in Audora's
  own UI. Audora keeps its own identity. TWK Everett is a licensed font and
  must not be shipped.
- No official Walrus logo files are in the project yet. Walrus appears as text
  only until its media kit is added.

---

## 5. Screens and components

### Landing (`/`)
1. Sticky header: logo, anchor nav (How it works, Features, The stack), ink
   "Launch Studio" pill.
2. Hero: kicker, serif headline, sub-copy, two CTAs, Sui credit line, and an
   ink "index card" showing the canonical memory sentence in mono.
3. "Capture once. Recall *the way you think.*": 3 numbered step cards.
4. "A vault that understands *what you meant*": 6 feature cards with
   line icons in vermilion-tint squares.
5. "The stack" panel: 4 tech chips.
6. Ink CTA block: logo mark, "Stop losing the *good* ideas", vermilion
   button, white credit line.
7. Footer: Audora × Sui partnership lockup.

### Studio (`/studio`)
- **Top bar:** logo, "Studio" tag, live relayer status pill (green
  online / amber read-only / red offline), "Run 2-min demo" ghost button.
- **Account strip:** registered Sui account (mono, copyable), namespace,
  delegate key mode, relayer version.
- **Title:** "The *Studio*". Two tabs: Studio / On-Chain Proofs (with count badge).
- **Capture panel (left, ~400px):** title*, type (beat, song, lyrics, voice
  note, concept, sample, other), stage (idea → rough → refining → done),
  date, BPM + key (only for beat / song / sample), tags, where it lives,
  context. Ink submit. After saving it becomes a **stored receipt**: job_id →
  blob_id with a finalizing state.
- **Session list:** captures from this session, with "recall this" shortcuts.
- **Recall panel (right):** search field (`/` focuses it) with ink "recall"
  button. Empty state: icon, "Ready to recall", 4 example queries as chips.
  Loading: 3 pulsing skeleton cards. Results: **memory cards** ranked by
  semantic relevance (relevance ring %, type glyph, title, stage, relative
  date, BPM/key, tags, notes, "where it lives", copyable blob_id, toggle to
  show the raw stored sentence).
- **On-Chain Proofs tab:** every capture this session with job_id, blob_id
  and status.

---

## 6. What to design next (suggested)

1. **Memory card redesign.** This is the heart of the product and still has
   the pre-redesign layout. Make it feel like an index card or notebook
   entry. Relevance should read at a glance, and the stage should be a clear
   lifecycle marker.
2. **Capture panel.** Make it feel less like a form and more like jotting
   in a notebook: a large serif title input, chips for type and stage.
3. **Stored receipt and proof states.** Make "it's on Walrus" moment
   satisfying: pending → finalized animation, blob_id as a stamp or seal.
4. **Empty and first-run states** for the Studio, plus the demo flow.
5. **Mobile Studio:** capture and recall as two tabs or a bottom sheet
   instead of one long scroll.
6. **Dark "late-session" theme** using the same tokens inverted (ink
   background, paper text, vermilion accent), since many users work at night.

## 7. Constraints
- Contrast must meet WCAG AA at minimum (the Sui kit asks for this too).
- Must work from 360px wide upward with no horizontal scroll.
- Motion is subtle and respects reduced-motion (Framer Motion is in use).
- Stack: React 18 + Vite, MUI only for form controls, inline styles plus
  CSS tokens. No Tailwind.
