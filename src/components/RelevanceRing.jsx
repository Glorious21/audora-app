import { motion } from "framer-motion";

/** Match ring: 4px stroke on a --line track; accent for the top result. */
export default function RelevanceRing({ value = 0, size = 56, top = false }) {
  const pct = Math.round(Math.max(0, Math.min(1, value || 0)) * 100);
  const r = (size - 4) / 2;
  const c = 2 * Math.PI * r;
  const compact = size < 50;

  return (
    <div
      role="img"
      aria-label={`${pct}% match`}
      style={{ position: "relative", width: size, height: size, flexShrink: 0 }}
    >
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)", display: "block" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line)" strokeWidth={4} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={top ? "var(--accent)" : "var(--text-2)"}
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - pct / 100) }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "grid",
          placeItems: "center",
          alignContent: "center",
          lineHeight: 1.05,
        }}
      >
        <span style={{ fontSize: compact ? 13 : 15, fontWeight: 650 }}>{pct}</span>
        {!compact && <span style={{ fontSize: 10.5, color: "var(--text-2)" }}>match</span>}
      </div>
    </div>
  );
}
