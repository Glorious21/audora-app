/**
 * The Audora memory schema — shared by the Express API and the React UI so
 * the two can never disagree about what a memory looks like.
 *
 * Every idea is stored in Walrus Memory as ONE canonical sentence:
 *
 *   Beat — "Night Drive Loop". Captured on 2026-08-27. Stage: rough.
 *   Tags: afrobeat, moody. Tempo: 102 BPM. Key: A minor.
 *   Where it lives: phone voice memo 14. Context: needs a vocal hook.
 *
 * Keeping that shape stable is what makes semantic recall reliable, and
 * `parseMemory(formatMemory(x))` must round-trip (see shared/memory.test.js).
 *
 * Plain ESM with no dependencies — safe to import from Node and the browser.
 */

export const WORK_TYPES = ["beat", "song", "lyrics", "voice note", "concept", "sample", "other"];

export const STAGES = ["idea", "rough", "refining", "done"];

/** Work types that carry tempo / key fields. */
export const MUSICAL_TYPES = ["beat", "song", "sample"];

/** Max characters per field — keeps one memory a sentence, not an essay. */
export const FIELD_LIMITS = {
  title: 120,
  tags: 200,
  key: 24,
  location: 240,
  notes: 1200,
};

const EMPTY = "—";
const clean = (v) => (v === undefined || v === null ? "" : String(v).trim());
const orDash = (v) => clean(v) || EMPTY;
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/** Format a memory's fields into the canonical sentence stored in Walrus Memory. */
export function formatMemory({ title, type, date, tags, status, bpm, key, location, notes }) {
  return (
    `${cap(orDash(type))} — "${orDash(title)}". ` +
    `Captured on ${orDash(date)}. ` +
    `Stage: ${orDash(status)}. ` +
    `Tags: ${orDash(tags)}. ` +
    `Tempo: ${clean(bpm) ? `${clean(bpm)} BPM` : EMPTY}. ` +
    `Key: ${orDash(key)}. ` +
    `Where it lives: ${orDash(location)}. ` +
    `Context: ${orDash(notes)}.`
  );
}

/**
 * Pull structured fields back out of a canonical sentence. Each label's value
 * runs up to ". {next label}" (or the end of the text for the last one).
 */
export function parseMemory(text = "") {
  const seg = (label, next) => {
    // "Captured on {date}" has no colon; every other label does.
    const end = next ? `\\.\\s*${next}:?\\s` : `\\.?\\s*$`;
    const m = text.match(new RegExp(`${label}:?\\s*(.*?)\\s*${end}`, "s"));
    const v = m ? m[1].trim() : "";
    return v === EMPTY ? "" : v;
  };
  const head = text.match(/^\s*(.+?)\s+—\s+"(.*?)"\./s);
  return {
    type: head ? head[1].trim().toLowerCase() : "",
    title: head ? head[2].trim() : "",
    date: seg("Captured on", "Stage"),
    status: seg("Stage", "Tags"),
    tags: seg("Tags", "Tempo"),
    bpm: seg("Tempo", "Key").replace(/\s*BPM$/i, ""),
    key: seg("Key", "Where it lives"),
    location: seg("Where it lives", "Context"),
    notes: seg("Context", null),
  };
}

/**
 * Identity of a memory for de-duplication: the same idea saved twice, or with
 * "—" vs "-" in the title, collapses to one key.
 */
export function memoryKey(fields = {}, text = "") {
  const title = clean(fields.title)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
  return title ? `${clean(fields.type).toLowerCase()}|${title}` : text;
}

/**
 * Memories written by connection tests and debugging (step0, curl smoke tests,
 * relayer repro loops). Walrus Memory has no delete, so recall hides them.
 */
const TEST_MEMORY =
  /\b(smoke test|endpoint (test|check)|stability check|watch repro|repro ?\d*|diagnostic|probe|step0|connection[- ]test|write path|safe to ignore)\b/i;

export function isTestMemory(fields = {}, text = "") {
  return TEST_MEMORY.test(`${clean(fields.title)} ${clean(fields.notes)}`) || (!fields.title && TEST_MEMORY.test(text));
}

/**
 * Validate and normalise a capture request body. Returns `{ fields }` on
 * success or `{ error }` with a message suitable for a 400 response.
 */
export function validateCapture(body = {}, { today = new Date().toISOString().slice(0, 10) } = {}) {
  const fields = {
    title: clean(body.title),
    type: clean(body.type) || "other",
    status: clean(body.status) || "idea",
    date: clean(body.date) || today,
    tags: clean(body.tags),
    bpm: clean(body.bpm),
    key: clean(body.key),
    location: clean(body.location),
    notes: clean(body.notes),
  };

  if (!fields.title) return { error: "title is required" };
  if (!WORK_TYPES.includes(fields.type)) return { error: `type must be one of: ${WORK_TYPES.join(", ")}` };
  if (!STAGES.includes(fields.status)) return { error: `status must be one of: ${STAGES.join(", ")}` };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fields.date)) return { error: "date must be YYYY-MM-DD" };
  if (fields.bpm && !(/^\d{2,3}(\.\d+)?$/.test(fields.bpm) && +fields.bpm >= 20 && +fields.bpm <= 400)) {
    return { error: "bpm must be a number between 20 and 400" };
  }
  for (const [k, max] of Object.entries(FIELD_LIMITS)) {
    if (fields[k].length > max) return { error: `${k} must be ${max} characters or fewer` };
  }
  return { fields };
}
