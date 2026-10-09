import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { api } from "../api";
import Icon from "./Icon";
import MemoryCard from "./MemoryCard";
import { useSession } from "../lib/session";

const EXAMPLES = [
  "the amapiano idea with the vocal chop from that late session",
  "the story idea about the lighthouse keeper",
  "something slow I hummed on the way home",
  "the song I started with Jonah",
];

function Toggle({ on, onChange, label }) {
  return (
    <label style={{ display: "inline-flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
      {label}
      <button
        type="button"
        role="switch"
        aria-checked={on}
        onClick={() => onChange(!on)}
        style={{
          width: 34,
          height: 20,
          borderRadius: 999,
          border: "none",
          padding: 2,
          cursor: "pointer",
          background: on ? "var(--ink)" : "var(--line-strong)",
          display: "flex",
          justifyContent: on ? "flex-end" : "flex-start",
        }}
      >
        <span style={{ width: 16, height: 16, borderRadius: "50%", background: "var(--surface)" }} />
      </button>
    </label>
  );
}

function Skeletons() {
  return (
    <div style={{ display: "grid", gap: 16 }} aria-hidden>
      {[1, 0.75, 0.5].map((o, i) => (
        <div
          key={i}
          className="card"
          style={{ opacity: o, padding: "18px 20px", display: "grid", gap: 12, boxShadow: "none" }}
        >
          {[["30%", 10], ["55%", 26], ["90%", 12], ["70%", 12]].map(([w, h], j) => (
            <div
              key={j}
              style={{
                width: w,
                height: h,
                borderRadius: 6,
                background: "var(--line)",
                animation: `pulse 1.4s ease-in-out ${i * 120}ms infinite`,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function Empty({ onPick }) {
  const { runDemo, demoRunning, captures } = useSession();
  return (
    <div className="card rise" style={{ padding: "32px 28px" }}>
      <h2 style={{ fontSize: 34 }}>
        Describe it the way <em>you remember it</em>.
      </h2>
      <p style={{ marginTop: 10, fontSize: 14.5, color: "var(--text-2)" }}>
        Recall searches by meaning, not by filename. Try one of these:
      </p>
      <div style={{ display: "grid", gap: 8, marginTop: 18 }}>
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => onPick(ex)}
            className="lift"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              padding: "12px 16px",
              borderRadius: 12,
              border: "1px solid var(--line)",
              background: "var(--bg)",
              color: "var(--ink)",
              cursor: "pointer",
              fontSize: 14,
              textAlign: "left",
            }}
          >
            {ex}
            <span style={{ color: "var(--accent-strong)" }}><Icon name="arrowRight" size={15} /></span>
          </button>
        ))}
      </div>
      {captures.length === 0 && (
        <div
          style={{
            marginTop: 22,
            paddingTop: 20,
            borderTop: "1px solid var(--line)",
            display: "flex",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 14.5, fontWeight: 650 }}>First time here?</div>
            <div style={{ fontSize: 13, color: "var(--text-2)", marginTop: 2 }}>
              The demo stores four sample memories, then recalls one cold.
            </div>
          </div>
          <button type="button" className="btn btn-ghost" onClick={runDemo} disabled={demoRunning}>
            <Icon name="play" size={13} stroke={2} />
            {demoRunning ? "Storing demo memories" : "Run 2-min demo"}
          </button>
        </div>
      )}
    </div>
  );
}

export default function RecallPanel({ inputRef: externalRef, compact = false }) {
  const { pendingQuery, setPendingQuery } = useSession();
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [showRaw, setShowRaw] = useState(false);
  const localRef = useRef(null);
  const inputRef = externalRef || localRef;
  const inflight = useRef(null);

  // A new recall supersedes the one in flight instead of being dropped.
  async function run(query) {
    const term = (query ?? q).trim();
    if (!term) return;
    inflight.current?.abort();
    const ctrl = (inflight.current = new AbortController());
    setQ(term);
    setBusy(true);
    setError(null);
    try {
      const res = await api.recall(term, ctrl.signal);
      if (!ctrl.signal.aborted) setData(res);
    } catch (e) {
      if (ctrl.signal.aborted) return;
      setError(e.message);
      setData(null);
    } finally {
      if (inflight.current === ctrl) setBusy(false);
    }
  }

  useEffect(() => () => inflight.current?.abort(), []);

  // The demo and "recall this" links push a query in from elsewhere.
  useEffect(() => {
    if (pendingQuery) {
      run(pendingQuery);
      setPendingQuery(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingQuery]);

  const results = data?.results || [];

  return (
    <section style={{ display: "grid", gap: 16, alignContent: "start" }} aria-label="Recall">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          run();
        }}
        className="rise"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: compact ? "6px 6px 6px 14px" : "8px 8px 8px 18px",
          borderRadius: compact ? 14 : 16,
          border: "1.5px solid var(--ink)",
          background: "var(--surface)",
          boxShadow: "var(--shadow)",
        }}
      >
        <span style={{ color: "var(--text-2)" }}><Icon name="search" size={compact ? 17 : 19} /></span>
        <input
          ref={inputRef}
          type="search"
          aria-label="Describe the memory you want to recall"
          aria-keyshortcuts="/"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="the moody thing with the vocal chop…"
          maxLength={300}
          style={{
            flex: 1,
            minWidth: 0,
            background: "none",
            border: "none",
            outline: "none",
            color: "var(--ink)",
            fontSize: compact ? 15 : 18,
            padding: "8px 0",
            caretColor: "var(--accent)",
          }}
        />
        {compact ? (
          <button
            type="submit"
            aria-label="Recall"
            disabled={!q.trim()}
            className="btn btn-ink"
            style={{ width: 40, height: 40, padding: 0, flexShrink: 0 }}
          >
            <Icon name="arrowRight" size={16} stroke={2.2} />
          </button>
        ) : (
          <button type="submit" disabled={!q.trim()} className="btn btn-ink" style={{ padding: "11px 20px" }}>
            {busy ? "Recalling" : "Recall"} <Icon name="arrowRight" size={15} stroke={2.2} />
          </button>
        )}
      </form>

      {error && <div role="alert" className="alert">{error}</div>}

      <div aria-live="polite" aria-busy={busy} style={{ display: "grid", gap: 16 }}>
        {busy ? (
          <Skeletons />
        ) : !data ? (
          <Empty onPick={run} />
        ) : (
          <>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                flexWrap: "wrap",
                fontSize: 13,
                color: "var(--text-2)",
              }}
            >
              <span>
                {results.length} {results.length === 1 ? "memory" : "memories"}
                {results.length > 1 ? ", closest first" : ""}
              </span>
              {!compact && results.length > 0 && (
                <Toggle on={showRaw} onChange={setShowRaw} label="Show stored sentences" />
              )}
            </div>
            {results.length === 0 ? (
              <div className="card" style={{ padding: "28px 24px", textAlign: "center", color: "var(--text-2)", fontSize: 14 }}>
                Nothing came back for that. Describe it more loosely, or store a few memories first.
              </div>
            ) : (
              <motion.div
                key={data.query}
                initial="hidden"
                animate="show"
                variants={{ show: { transition: { staggerChildren: 0.06 } } }}
                style={{ display: "grid", gap: 16 }}
              >
                {results.map((r, i) => (
                  <MemoryCard key={r.blob_id || i} result={r} rank={i} showRaw={showRaw} compact={compact} />
                ))}
              </motion.div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
