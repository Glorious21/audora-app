import { useEffect, useRef, useState } from "react";

import { api, pollJob } from "../api";
import Icon from "./Icon";
import StoredReceipt from "./StoredReceipt";
import { StagePicker } from "./Stage";
import { WORK_TYPES, MUSICAL_TYPES, FIELD_LIMITS, splitTags } from "../lib/format";

const today = () => new Date().toISOString().slice(0, 10);
const EMPTY = {
  title: "",
  type: "beat",
  status: "idea",
  date: today(),
  tags: [],
  bpm: "",
  key: "",
  location: "",
  notes: "",
};
const isMac = typeof navigator !== "undefined" && /Mac|iP(hone|ad)/.test(navigator.platform);

function Field({ label, htmlFor, children, style }) {
  return (
    <div style={{ display: "grid", gap: 6, ...style }}>
      <label className="label" htmlFor={htmlFor}>{label}</label>
      {children}
    </div>
  );
}

/**
 * The capture form. After "Store memory" it swaps in place for the receipt,
 * which follows the remember job until Walrus returns a blob_id.
 */
export default function CapturePanel({ onCaptured, onRecall, sheet = false, autoFocus = false }) {
  const [form, setForm] = useState(EMPTY);
  const [tagDraft, setTagDraft] = useState(null); // null = "+ tag" link, string = editing
  const [busy, setBusy] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [error, setError] = useState(null);
  const formRef = useRef(null);
  const titleRef = useRef(null);
  const tagRef = useRef(null);

  const lifetime = useRef(null);
  useEffect(() => {
    lifetime.current = new AbortController();
    return () => lifetime.current.abort();
  }, []);

  useEffect(() => {
    if (autoFocus) titleRef.current?.focus();
  }, [autoFocus]);

  useEffect(() => {
    if (tagDraft !== null) tagRef.current?.focus();
  }, [tagDraft !== null]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const musical = MUSICAL_TYPES.includes(form.type);
  const ready = form.title.trim().length > 0;

  function addTags(raw) {
    const next = splitTags(raw).filter((t) => !form.tags.includes(t));
    if (next.length) setForm((f) => ({ ...f, tags: [...f.tags, ...next] }));
  }

  async function store(e) {
    e?.preventDefault();
    if (busy || !ready) return;
    if (tagDraft) addTags(tagDraft);
    setBusy(true);
    setError(null);
    const tags = [...form.tags, ...(tagDraft ? splitTags(tagDraft) : [])];
    const body = {
      ...form,
      tags: [...new Set(tags)].join(", "),
      bpm: musical ? form.bpm : "",
      key: musical ? form.key : "",
    };
    try {
      const signal = lifetime.current.signal;
      const res = await api.capture(body, signal);
      setReceipt(res);
      onCaptured?.(res);
      if (!res.finalized) {
        pollJob(res.job_id, {
          signal,
          onUpdate: (s) => {
            setReceipt((r) => (r && r.job_id === s.job_id ? { ...r, ...s } : r));
            onCaptured?.(s);
          },
        });
      }
    } catch (err) {
      if (!lifetime.current.signal.aborted) setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function clear() {
    setForm({ ...EMPTY, date: today() });
    setTagDraft(null);
    setReceipt(null);
    setError(null);
    setTimeout(() => titleRef.current?.focus(), 0);
  }

  function onKeyDown(e) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      store();
    } else if (e.key === "Escape" && e.target !== tagRef.current) {
      e.preventDefault();
      clear();
    }
  }

  const body = receipt ? (
    <StoredReceipt result={receipt} onRecall={onRecall} onAnother={clear} />
  ) : (
    <form ref={formRef} onSubmit={store} onKeyDown={onKeyDown} style={{ display: "grid", gap: 18 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
        <span className="kicker">New memory</span>
        <span style={{ fontSize: 12, color: "var(--text-2)" }}>Saved as one sentence</span>
      </div>

      <Field label="Working title" htmlFor="cap-title">
        <input
          id="cap-title"
          ref={titleRef}
          className="field field-title"
          value={form.title}
          onChange={set("title")}
          placeholder="Low Tide"
          maxLength={FIELD_LIMITS.title}
          required
          autoComplete="off"
          style={sheet ? { fontSize: 30 } : undefined}
        />
      </Field>

      <Field label="Type">
        <div
          role="group"
          aria-label="Type"
          style={{
            display: "flex",
            gap: 6,
            flexWrap: sheet ? "nowrap" : "wrap",
            overflowX: sheet ? "auto" : undefined,
            margin: sheet ? "0 -22px" : undefined,
            padding: sheet ? "0 22px 2px" : undefined,
          }}
        >
          {WORK_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              className="chip"
              aria-pressed={form.type === t}
              onClick={() => setForm((f) => ({ ...f, type: t }))}
            >
              {t}
            </button>
          ))}
        </div>
      </Field>

      <Field label="Stage">
        <StagePicker value={form.status} onChange={(s) => setForm((f) => ({ ...f, status: s }))} />
      </Field>

      <div style={{ display: "grid", gridTemplateColumns: musical ? "1.3fr 1fr 1.3fr" : "1fr", gap: 16 }}>
        <Field label="Date" htmlFor="cap-date">
          <input id="cap-date" type="date" className="field" value={form.date} onChange={set("date")} />
        </Field>
        {musical && (
          <>
            <Field label="BPM" htmlFor="cap-bpm">
              <input
                id="cap-bpm"
                className="field mono"
                inputMode="numeric"
                value={form.bpm}
                onChange={(e) => setForm((f) => ({ ...f, bpm: e.target.value.replace(/[^\d.]/g, "").slice(0, 5) }))}
                placeholder="113"
              />
            </Field>
            <Field label="Key" htmlFor="cap-key">
              <input
                id="cap-key"
                className="field"
                value={form.key}
                onChange={set("key")}
                placeholder="F minor"
                maxLength={FIELD_LIMITS.key}
              />
            </Field>
          </>
        )}
      </div>

      <Field label="Tags">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center", minHeight: 30 }}>
          {form.tags.map((t) => (
            <span key={t} className="tag tag-wash">
              {t}
              <button
                type="button"
                aria-label={`Remove tag ${t}`}
                onClick={() => setForm((f) => ({ ...f, tags: f.tags.filter((x) => x !== t) }))}
                style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: "var(--text-2)", display: "inline-flex" }}
              >
                <Icon name="close" size={12} stroke={2} />
              </button>
            </span>
          ))}
          {tagDraft === null ? (
            <button type="button" className="link-btn" onClick={() => setTagDraft("")}>
              <Icon name="plus" size={13} stroke={2.2} /> tag
            </button>
          ) : (
            <input
              ref={tagRef}
              aria-label="New tag"
              className="field"
              value={tagDraft}
              onChange={(e) => {
                const v = e.target.value;
                if (v.endsWith(",")) {
                  addTags(v);
                  setTagDraft("");
                } else setTagDraft(v);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !(e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  addTags(tagDraft);
                  setTagDraft("");
                } else if (e.key === "Escape" || (e.key === "Backspace" && !tagDraft)) {
                  e.preventDefault();
                  setTagDraft(null);
                }
              }}
              onBlur={() => {
                addTags(tagDraft);
                setTagDraft(null);
              }}
              placeholder="amapiano, late night"
              style={{ width: 160, fontSize: 13, padding: "3px 0" }}
            />
          )}
        </div>
      </Field>

      <Field label="Where it lives" htmlFor="cap-loc">
        <div style={{ display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid var(--line-strong)" }}>
          <span style={{ color: "var(--text-2)" }}><Icon name="folder" size={16} /></span>
          <input
            id="cap-loc"
            className="field mono"
            value={form.location}
            onChange={set("location")}
            placeholder="~/Ableton/2026/lowtide_v3.als"
            maxLength={FIELD_LIMITS.location}
            style={{ border: "none", fontSize: 13 }}
          />
        </div>
      </Field>

      <Field label="What's the story?" htmlFor="cap-notes">
        <textarea
          id="cap-notes"
          className="ruled"
          rows={4}
          value={form.notes}
          onChange={set("notes")}
          maxLength={FIELD_LIMITS.notes}
          placeholder="Chopped Maya's vocal from the 2 a.m. session. The hook isn't there yet."
        />
      </Field>

      {error && <div role="alert" className="alert">{error}</div>}

      <button
        type="submit"
        className="btn btn-ink"
        disabled={busy || !ready}
        style={{ width: "100%", padding: "14px 20px", justifyContent: "space-between", fontSize: 14.5 }}
      >
        <span>{busy ? "Storing memory" : sheet ? "Store memory →" : "Store memory"}</span>
        {!sheet && (
          <span className="mono" style={{ fontSize: 12, opacity: 0.7 }}>
            {isMac ? "⌘ ↵" : "Ctrl ↵"}
          </span>
        )}
      </button>
    </form>
  );

  if (sheet) return body;
  return (
    <section className="card rise" style={{ padding: 22 }} aria-label="Capture">
      {body}
    </section>
  );
}
