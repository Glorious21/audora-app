/** Two soft radial washes at the top plus faint ruled lines that fade by 900px. */
export default function Backdrop() {
  return (
    <div
      aria-hidden
      style={{ position: "absolute", inset: "0 0 auto 0", height: 900, pointerEvents: "none", zIndex: 0 }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          height: 300,
          background:
            "radial-gradient(40% 300px at 18% 0, var(--wash), transparent 70%), radial-gradient(40% 300px at 80% 0, var(--wash2), transparent 70%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "linear-gradient(to bottom, transparent 31px, var(--rule) 31px, var(--rule) 32px)",
          backgroundSize: "100% 32px",
          maskImage: "linear-gradient(to bottom, #000, transparent 900px)",
          WebkitMaskImage: "linear-gradient(to bottom, #000, transparent 900px)",
        }}
      />
    </div>
  );
}
