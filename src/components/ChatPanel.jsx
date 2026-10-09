import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { api } from "../api";
import Icon from "./Icon";

const STARTERS = [
  "Which unfinished beats should I finish first?",
  "What was that melody I hummed in the car?",
  "Do any of my lyrics fit a sparse beat?",
  "Everything in my vault about Lagos",
];

function Sources({ sources }) {
  if (!sources?.length) return null;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
      {sources.slice(0, 4).map((s, i) => (
        <span
          key={s.blob_id || i}
          title={s.text}
          className="tag tag-wash"
          style={{ fontSize: 12, maxWidth: 240, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "inline-block" }}
        >
          {s.fields?.title || `memory ${i + 1}`}
          {typeof s.relevance === "number" && (
            <span className="mono" style={{ color: "var(--text-2)" }}> · {Math.round(s.relevance * 100)}</span>
          )}
        </span>
      ))}
    </div>
  );
}

function Bubble({ msg }) {
  const mine = msg.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      style={{ display: "flex", justifyContent: mine ? "flex-end" : "flex-start" }}
    >
      <div style={{ maxWidth: "min(620px, 88%)" }}>
        {!mine && (
          <div className="kicker" style={{ marginBottom: 6 }}>
            Audora
            {msg.mode === "recall" && (
              <span style={{ color: "var(--text-2)", fontWeight: 500, letterSpacing: 0, textTransform: "none", marginLeft: 8 }}>
                Answered from your vault
              </span>
            )}
          </div>
        )}
        <div
          className={msg.error ? "alert" : undefined}
          style={
            msg.error
              ? undefined
              : {
                  padding: "12px 16px",
                  borderRadius: mine ? "18px 18px 6px 18px" : "18px 18px 18px 6px",
                  fontSize: 15,
                  lineHeight: 1.6,
                  whiteSpace: "pre-wrap",
                  background: mine ? "var(--ink)" : "var(--bg)",
                  color: mine ? "var(--bg)" : "var(--ink)",
                  border: mine ? "none" : "1px solid var(--line)",
                }
          }
        >
          {msg.content}
        </div>
        {!mine && <Sources sources={msg.sources} />}
      </div>
    </motion.div>
  );
}

/** Chat over the vault: every reply is grounded in memories recalled from Walrus. */
export default function ChatPanel() {
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const inflight = useRef(null);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => () => inflight.current?.abort(), []);
  useEffect(() => {
    if (messages.length) endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, busy]);

  async function send(text) {
    const content = (text ?? draft).trim();
    if (!content || busy) return;
    const history = [...messages.filter((m) => !m.error), { role: "user", content }];
    setMessages((prev) => [...prev, { role: "user", content }]);
    setDraft("");
    setBusy(true);
    const ctrl = (inflight.current = new AbortController());
    try {
      const res = await api.chat(history.map(({ role, content }) => ({ role, content })), ctrl.signal);
      setMessages((prev) => [...prev, { role: "assistant", content: res.reply, sources: res.sources, mode: res.mode }]);
    } catch (e) {
      if (ctrl.signal.aborted) return;
      setMessages((prev) => [...prev, { role: "assistant", content: e.message, error: true }]);
    } finally {
      if (inflight.current === ctrl) setBusy(false);
      inputRef.current?.focus();
    }
  }

  return (
    <section className="card rise" style={{ display: "flex", flexDirection: "column", minHeight: 560, overflow: "hidden" }} aria-label="Ask Audora">
      <div
        style={{ flex: 1, padding: "24px 24px 8px", display: "grid", gap: 18, alignContent: "start" }}
        aria-live="polite"
        aria-busy={busy}
      >
        {messages.length === 0 && (
          <div style={{ padding: "8px 0 12px" }}>
            <h2 style={{ fontSize: 34 }}>
              Ask about <em>anything you made</em>.
            </h2>
            <p style={{ marginTop: 10, fontSize: 14.5, color: "var(--text-2)", maxWidth: 560 }}>
              Audora recalls the closest memories from Walrus for every question, then answers from them. The memories
              it used appear under each reply.
            </p>
            <div style={{ display: "grid", gap: 8, marginTop: 20, maxWidth: 620 }}>
              {STARTERS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
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
                  {s}
                  <span style={{ color: "var(--accent-strong)" }}><Icon name="arrowRight" size={15} /></span>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <Bubble key={i} msg={m} />
        ))}

        {busy && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--text-2)" }}>
            <span style={{ display: "inline-flex", gap: 4 }}>
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "var(--accent)",
                    animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                  }}
                />
              ))}
            </span>
            Recalling memories
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        style={{
          position: "sticky",
          bottom: 0,
          padding: 16,
          borderTop: "1px solid var(--line)",
          background: "var(--surface)",
          display: "flex",
          gap: 10,
        }}
      >
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Ask about your vault…"
          aria-label="Message Audora"
          maxLength={2000}
          style={{
            flex: 1,
            minWidth: 0,
            padding: "12px 16px",
            borderRadius: 999,
            border: "1.5px solid var(--ink)",
            background: "var(--surface)",
            color: "var(--ink)",
            fontSize: 15,
            outline: "none",
            caretColor: "var(--accent)",
          }}
        />
        <button type="submit" disabled={!draft.trim() || busy} className="btn btn-ink" style={{ padding: "11px 20px" }}>
          Ask <Icon name="arrowRight" size={15} stroke={2.2} />
        </button>
      </form>
    </section>
  );
}
