/**
 * "Recall burst" mark: 12 rounded bars radiating from a centre dot, one bar
 * (2 o'clock) longer and in the accent — the idea you found.
 * Geometry from design_handoff_audora: 64×64 viewBox, inner radius 11, bars
 * 30° apart clockwise from 12 o'clock, stroke 4 round, centre dot r 4.5.
 */
const LENGTHS = [10, 16, 9, 13, 7, 15, 10, 12, 8, 14, 9, 11];
const INNER = 11;

const BARS = LENGTHS.map((len, i) => {
  const a = (i * 30 * Math.PI) / 180;
  const l = i === 1 ? len + 4 : len;
  const sin = Math.sin(a), cos = Math.cos(a);
  return {
    x1: 32 + INNER * sin, y1: 32 - INNER * cos,
    x2: 32 + (INNER + l) * sin, y2: 32 - (INNER + l) * cos,
    found: i === 1,
  };
});

/**
 * tone: "auto" follows the theme tokens; "paper" / "on-dark" are fixed colors
 * for ink blocks; "mono" draws everything in currentColor (footers).
 */
export function AudoraMark({ size = 30, tone = "auto", title }) {
  const colors = {
    auto: ["var(--ink)", "var(--accent)"],
    paper: ["#141414", "#F0461F"],
    "on-dark": ["#FAF9F6", "#FF6B47"],
    mono: ["currentColor", "currentColor"],
  }[tone] || ["var(--ink)", "var(--accent)"];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      style={{ display: "block", flexShrink: 0 }}
    >
      {BARS.map((b, i) => (
        <line
          key={i}
          x1={b.x1.toFixed(2)}
          y1={b.y1.toFixed(2)}
          x2={b.x2.toFixed(2)}
          y2={b.y2.toFixed(2)}
          stroke={b.found ? colors[1] : colors[0]}
          strokeWidth="4"
          strokeLinecap="round"
        />
      ))}
      <circle cx="32" cy="32" r="4.5" fill={colors[0]} />
    </svg>
  );
}

/** Mark + lowercase "audora" wordmark (Inter 700, −0.045em). */
export default function AudoraLogo({ size = 30, wordSize, tone = "auto" }) {
  const ws = wordSize ?? Math.round(size * 0.7);
  const color = tone === "on-dark" ? "#FAF9F6" : tone === "paper" ? "#141414" : "var(--ink)";
  return (
    <span
      role="img"
      aria-label="Audora"
      style={{ display: "inline-flex", alignItems: "center", gap: Math.round(size * 0.34) }}
    >
      <AudoraMark size={size} tone={tone} />
      <span
        aria-hidden
        style={{ fontWeight: 700, letterSpacing: "-0.045em", fontSize: ws, lineHeight: 1, color }}
      >
        audora
      </span>
    </span>
  );
}
