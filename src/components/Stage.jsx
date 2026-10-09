import { STAGES } from "../lib/format";

const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "");
export const stageLabel = cap;

/** Four 16×6 pill segments: past ink, current accent, future line-strong. */
export function StageMarker({ stage, showLabel = true }) {
  const at = Math.max(0, STAGES.indexOf(stage));
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <span aria-hidden style={{ display: "inline-flex", gap: 3 }}>
        {STAGES.map((s, i) => (
          <span
            key={s}
            style={{
              width: 16,
              height: 6,
              borderRadius: 999,
              background: i < at ? "var(--ink)" : i === at ? "var(--accent)" : "var(--line-strong)",
            }}
          />
        ))}
      </span>
      {showLabel && <span style={{ fontSize: 12.5, fontWeight: 600 }}>{cap(STAGES[at])}</span>}
    </span>
  );
}

/** Segmented pill picker: Idea / Rough / Refining / Done with progress dots. */
export function StagePicker({ value, onChange }) {
  const at = STAGES.indexOf(value);
  return (
    <div
      role="radiogroup"
      aria-label="Stage"
      style={{
        display: "flex",
        padding: 3,
        borderRadius: 999,
        border: "1px solid var(--line-strong)",
        gap: 2,
      }}
    >
      {STAGES.map((s, i) => {
        const current = i === at;
        return (
          <button
            key={s}
            type="button"
            role="radio"
            aria-checked={current}
            onClick={() => onChange(s)}
            style={{
              flex: 1,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              padding: "7px 6px",
              borderRadius: 999,
              border: "none",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: current ? 600 : 500,
              background: current ? "var(--ink)" : "transparent",
              color: current ? "var(--bg)" : "var(--ink)",
              whiteSpace: "nowrap",
            }}
          >
            <span
              aria-hidden
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                flexShrink: 0,
                background: current ? "var(--accent)" : i < at ? "var(--ink)" : "transparent",
                border: current || i < at ? "none" : "1.25px solid var(--line-strong)",
              }}
            />
            {cap(s)}
          </button>
        );
      })}
    </div>
  );
}
