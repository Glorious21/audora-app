import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import RelevanceRing from "./RelevanceRing";
import Icon, { TYPE_ICON } from "./Icon";
import Copyable, { shortId } from "./Copyable";
import { StageMarker } from "./Stage";
import { relativeDate, splitTags } from "../lib/format";

export const cardRise = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

/** Index-card result: header, accent rule, ruled notes, tags, footer strip. */
export default function MemoryCard({ result, rank, showRaw: showRawAll = false, compact = false }) {
  const f = result.fields || {};
  const [showRaw, setShowRaw] = useState(showRawAll);
  useEffect(() => setShowRaw(showRawAll), [showRawAll]);
  const top = rank === 0;
  const tags = splitTags(f.tags);
  const music = [f.bpm && `${f.bpm} BPM`, f.key].filter(Boolean).join(" · ");
  const when = f.date ? relativeDate(f.date) : "";

  return (
    <motion.article
      variants={cardRise}
      className="card lift"
      style={{ overflow: "hidden", padding: 0 }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: compact ? "1fr auto" : "40px 1fr auto",
          gap: 14,
          padding: compact ? "16px 16px 12px" : "18px 20px 14px",
          alignItems: "start",
        }}
      >
        {!compact && (
          <span
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: "var(--wash)",
              color: "var(--accent-strong)",
              display: "grid",
              placeItems: "center",
            }}
          >
            <Icon name={TYPE_ICON[f.type] || "dot"} size={19} />
          </span>
        )}
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: ".1em",
              textTransform: "uppercase",
              color: "var(--text-2)",
            }}
          >
            {f.type || "memory"}
            {when && ` · ${when}`}
          </div>
          <h3 className="display" style={{ fontSize: compact ? 23 : 28, marginTop: 4, lineHeight: 1.1, overflowWrap: "anywhere" }}>
            {f.title || "Untitled"}
          </h3>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "6px 16px", marginTop: 10 }}>
            {f.status && <StageMarker stage={f.status} />}
            {music && (
              <span className="mono" style={{ fontSize: 12, color: "var(--text-2)" }}>{music}</span>
            )}
          </div>
        </div>
        <RelevanceRing value={result.relevance ?? 0} top={top} size={compact ? 44 : 56} />
      </div>

      <div style={{ margin: compact ? "0 16px" : "0 20px", height: 1, background: "var(--accent)", opacity: 0.5 }} />

      {(f.notes || tags.length > 0) && (
        <div style={{ padding: compact ? "6px 16px 14px" : "6px 20px 16px" }}>
          {f.notes && (
            <p
              style={{
                fontSize: 14.5,
                lineHeight: "28px",
                backgroundImage: "linear-gradient(to bottom, transparent 27px, var(--line) 27px, var(--line) 28px)",
                backgroundSize: "100% 28px",
              }}
            >
              {f.notes}
            </p>
          )}
          {tags.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
              {tags.map((t) => (
                <span key={t} className="tag">{t}</span>
              ))}
            </div>
          )}
        </div>
      )}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: compact ? "10px 16px" : "10px 20px",
          borderTop: "1px solid var(--line)",
          background: "color-mix(in srgb, var(--bg) 60%, var(--surface))",
          fontSize: 12,
        }}
      >
        <span style={{ display: "inline-flex", alignItems: "center", gap: 7, minWidth: 0, flex: 1, color: "var(--text-2)" }}>
          <Icon name="folder" size={14} />
          <span className="mono" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "var(--ink)" }}>
            {f.location || "—"}
          </span>
        </span>
        {!compact && result.blob_id && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--text-2)" }}>
            blob
            <Copyable value={result.blob_id} label="blob id">{shortId(result.blob_id, 6, 4)}</Copyable>
          </span>
        )}
        {!compact && (
          <button
            type="button"
            className="link-btn"
            aria-expanded={showRaw}
            onClick={() => setShowRaw((v) => !v)}
          >
            Stored sentence
            <Icon name="chevronDown" size={14} style={{ transform: showRaw ? "rotate(180deg)" : "none" }} />
          </button>
        )}
      </div>

      {showRaw && (
        <p
          className="mono"
          style={{
            padding: compact ? "12px 16px" : "14px 20px",
            borderTop: "1px dashed var(--line-strong)",
            background: "var(--bg)",
            fontSize: 12,
            lineHeight: 1.65,
            color: "var(--ink)",
            overflowWrap: "anywhere",
          }}
        >
          {result.text}
        </p>
      )}
    </motion.article>
  );
}
