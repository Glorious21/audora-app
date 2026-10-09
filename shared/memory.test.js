import { test } from "node:test";
import assert from "node:assert/strict";

import { formatMemory, isTestMemory, memoryKey, parseMemory, validateCapture, FIELD_LIMITS } from "./memory.js";

const FULL = {
  title: "Third Mainland at 2AM",
  type: "beat",
  date: "2026-08-27",
  status: "rough",
  tags: "amapiano, nocturnal, vocal chop",
  bpm: "112",
  key: "G minor",
  location: "Ableton / 2026 / tml_2am_v3.als",
  notes: "Made after the late session. The vocal chop on the hook is the whole idea.",
};

test("formatMemory → parseMemory round-trips every field", () => {
  assert.deepEqual(parseMemory(formatMemory(FULL)), FULL);
});

test("empty optional fields round-trip as empty strings, not dashes", () => {
  const minimal = { ...FULL, tags: "", bpm: "", key: "", location: "", notes: "" };
  const text = formatMemory(minimal);
  assert.match(text, /Tempo: —\. Key: —\./);
  assert.deepEqual(parseMemory(text), minimal);
});

test("parses the date (regression: 'Captured on' has no colon)", () => {
  assert.equal(parseMemory(formatMemory(FULL)).date, "2026-08-27");
});

test("parses memories written before this module existed", () => {
  const legacy =
    'Voice note — "car hum — chorus melody". Captured on 2026-08-12. Stage: idea. ' +
    "Tags: melody, catchy. Tempo: —. Key: —. Where it lives: phone voice memo. " +
    "Context: Hummed a full chorus at a red light. Da-da-DAAA, then it falls..";
  const f = parseMemory(legacy);
  assert.equal(f.type, "voice note");
  assert.equal(f.title, "car hum — chorus melody");
  assert.equal(f.date, "2026-08-12");
  assert.equal(f.bpm, "");
  assert.equal(f.notes, "Hummed a full chorus at a red light. Da-da-DAAA, then it falls.");
});

test("memoryKey ignores dash and case differences", () => {
  const a = memoryKey({ type: "voice note", title: "car hum — chorus melody" });
  const b = memoryKey({ type: "voice note", title: "Car Hum - chorus melody" });
  assert.equal(a, b);
  assert.notEqual(a, memoryKey({ type: "beat", title: "car hum — chorus melody" }));
  assert.equal(memoryKey({}, "raw text"), "raw text");
});

test("isTestMemory hides debugging writes, keeps real ideas", () => {
  for (const title of ["curl smoke test beat", "Endpoint Test Loop 2", "watch repro beat", "stability check 3"]) {
    assert.ok(isTestMemory({ title }), title);
  }
  assert.ok(isTestMemory({}, "Track: Sunset Test Beat (step0-connection-test). Date added: 2026-08-27"));
  for (const title of ["car hum — chorus melody", "fire", "hope", "Third Mainland at 2AM"]) {
    assert.ok(!isTestMemory({ title, notes: "needs real drums" }), title);
  }
});

test("parseMemory tolerates garbage", () => {
  assert.equal(parseMemory("not a memory").title, "");
  assert.equal(parseMemory().title, "");
});

test("validateCapture fills defaults and trims", () => {
  const { fields, error } = validateCapture({ title: "  Loop  " }, { today: "2026-10-07" });
  assert.equal(error, undefined);
  assert.equal(fields.title, "Loop");
  assert.equal(fields.type, "other");
  assert.equal(fields.status, "idea");
  assert.equal(fields.date, "2026-10-07");
});

test("validateCapture rejects bad input", () => {
  const bad = [
    [{}, /title is required/],
    [{ title: "x", type: "podcast" }, /type must be one of/],
    [{ title: "x", status: "shipped" }, /status must be one of/],
    [{ title: "x", date: "07/10/2026" }, /YYYY-MM-DD/],
    [{ title: "x", bpm: "fast" }, /bpm/],
    [{ title: "x", bpm: "9000" }, /bpm/],
    [{ title: "x".repeat(FIELD_LIMITS.title + 1) }, /title must be/],
  ];
  for (const [body, re] of bad) assert.match(validateCapture(body).error ?? "", re, JSON.stringify(body));
});
