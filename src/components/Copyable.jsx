import { useEffect, useRef, useState } from "react";
import Icon from "./Icon";

/** Click-to-copy mono value with a "Copied" tooltip for 1.5s. */
export default function Copyable({ value, children, size = 12, style, showIcon = true, label }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);
  if (!value) return null;

  const copy = () => {
    navigator.clipboard?.writeText(value).catch(() => {});
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      type="button"
      onClick={copy}
      title={value}
      aria-label={label ? `Copy ${label}` : `Copy ${value}`}
      className="mono"
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        background: "none",
        border: "none",
        padding: 0,
        cursor: "pointer",
        color: "var(--ink)",
        fontSize: size,
        minWidth: 0,
        ...style,
      }}
    >
      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {children ?? value}
      </span>
      {showIcon && (
        <span style={{ color: copied ? "var(--green)" : "var(--text-2)" }}>
          <Icon name={copied ? "check" : "copy"} size={size} />
        </span>
      )}
      {copied && (
        <span
          role="status"
          style={{
            position: "absolute",
            bottom: "calc(100% + 6px)",
            left: "50%",
            transform: "translateX(-50%)",
            padding: "3px 8px",
            borderRadius: 6,
            background: "var(--ink)",
            color: "var(--bg)",
            fontFamily: "var(--font-sans)",
            fontSize: 11,
            fontWeight: 600,
            whiteSpace: "nowrap",
            pointerEvents: "none",
          }}
        >
          Copied
        </span>
      )}
    </button>
  );
}

/** Shorten a long id as "head…tail". */
export const shortId = (v, head = 10, tail = 6) =>
  v && v.length > head + tail + 1 ? `${v.slice(0, head)}…${v.slice(-tail)}` : v || "";
