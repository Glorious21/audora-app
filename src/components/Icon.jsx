// Hand-picked stroke icons — keeps Audora from looking like a stock Material app.
const P = {
  search: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM16 16l5 5",
  plus: "M12 5v14M5 12h14",
  copy: "M9 9h10v10H9zM5 15V5h10",
  check: "M4 12l5 5L20 6",
  arrowRight: "M5 12h14M13 6l6 6-6 6",
  arrowUpRight: "M7 17L17 7M8 7h9v9",
  chevronDown: "M6 9l6 6 6-6",
  spark: "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z",
  wave: "M3 12h2l2-6 3 14 3-11 2 5 2-2h4",
  close: "M6 6l12 12M18 6L6 18",
  clock: "M12 7v5l3 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z",
  memory:
    "M9 4a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 6 1V5a3 3 0 0 0-3-1zM15 4a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-6 1",
  shield: "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z",
  play: "M8 5v14l11-7z",
  layers: "M12 3l9 5-9 5-9-5zM3 14l9 5 9-5",
  bolt: "M13 2L4 14h7l-1 8 9-12h-7z",
  sparkle: "M12 3l1.6 5L18 9.6 13.6 12 12 17l-1.6-5L6 9.6 10.4 8zM19 14l.8 2.4L22 17l-2.2.6L19 20l-.8-2.4L16 17l2.2-.6z",
  moon: "M20 15.4A8.5 8.5 0 0 1 8.6 4 8.5 8.5 0 1 0 20 15.4z",
  sun: "M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4",
  link: "M9 15l6-6M8.5 8.5l-1 1a4 4 0 0 0 5.7 5.7l1-1M15.5 15.5l1-1a4 4 0 0 0-5.7-5.7l-1 1",
  lock: "M7 11V8a5 5 0 0 1 10 0v3M5 11h14v10H5z",
  target: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM12 12h.01",
  quote: "M7 7h5v5c0 3-2 5-5 5M17 7h-5",
  folder: "M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
  note: "M9 18V5l11-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z",
  pen: "M4 20h4L19 9l-4-4L4 16zM14 6l4 4",
  mic: "M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zM5 11a7 7 0 0 0 14 0M12 18v3",
  dot: "M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2z",
  key: "M15 7a4 4 0 1 0-3.9 5H12l2 2 2-2 2 2 2-2-4-4h-.1A4 4 0 0 0 15 7z",
  vault: "M4 5h16v14H4zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM12 9V7M8 19v2M16 19v2",
  receipt: "M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6",
};

/** Icon per work type. */
export const TYPE_ICON = {
  beat: "wave",
  song: "note",
  lyrics: "pen",
  "voice note": "mic",
  concept: "sparkle",
  sample: "layers",
  other: "dot",
};

export default function Icon({ name, size = 18, stroke = 1.7, style, ...rest }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      style={{ display: "block", flexShrink: 0, ...style }}
      {...rest}
    >
      <path d={P[name] || P.dot} />
    </svg>
  );
}
