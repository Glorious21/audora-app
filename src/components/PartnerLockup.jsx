import { AudoraMark } from "./AudoraLogo";

/**
 * Official Sui logo files, unmodified, from the Sui media kit. Per the kit the
 * logo may only appear in black, white or Sui Blue — never recoloured or
 * redrawn — so we only ever <img> these files at their native aspect ratio.
 */
const SUI_LOGO = {
  black: "/brand/sui/sui-logo-black.svg",
  white: "/brand/sui/sui-logo-white.svg",
};
const SUI_LOGO_ASPECT = 1914 / 1001;

/** Picks the Sui file that matches the current theme. */
function SuiLogo({ height, onInk = false, alt = "" }) {
  const w = Math.round(height * SUI_LOGO_ASPECT);
  if (onInk) return <img src={SUI_LOGO.white} alt={alt} height={height} width={w} style={{ display: "block" }} />;
  return (
    <>
      <img className="sui-on-paper" src={SUI_LOGO.black} alt={alt} height={height} width={w} style={{ display: "block" }} />
      <img className="sui-on-dark" src={SUI_LOGO.white} alt={alt} height={height} width={w} style={{ display: "none" }} />
      <style>{`[data-theme="dark"] .sui-on-paper{display:none!important}[data-theme="dark"] .sui-on-dark{display:block!important}`}</style>
    </>
  );
}

/** Mark 32 · 1.5px ink divider with 12px each side · Sui logo 32 tall. */
export function PartnerLockup({ height = 32 }) {
  return (
    <span role="img" aria-label="Audora, built on Sui" style={{ display: "inline-flex", alignItems: "center" }}>
      <AudoraMark size={height} />
      <span aria-hidden style={{ width: 1.5, height, background: "var(--ink)", margin: "0 12px", flexShrink: 0 }} />
      <SuiLogo height={height} />
    </span>
  );
}

/** "Built on [Sui] · memory stored on Walrus" credit line. */
export function BuiltOnBadge({ onInk = false }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        flexWrap: "wrap",
        fontSize: 12.5,
        color: onInk ? "#B9B6B0" : "var(--text-3)",
      }}
    >
      <span>Built on</span>
      <SuiLogo height={16} onInk={onInk} alt="Sui" />
      <span aria-hidden>·</span>
      <span>
        memory stored on{" "}
        <span style={{ color: onInk ? "#F4F2EE" : "var(--text-2)", fontWeight: 600 }}>Walrus</span>
      </span>
    </span>
  );
}
