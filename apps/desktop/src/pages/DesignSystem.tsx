import { useTheme } from "../theme/ThemeContext";
import type { AccentName } from "@trax/core";

/**
 * DEV-ONLY primitive verification page (not linked from any UI).
 * Renders every tier/primitive in isolation. Preview at /design-system.
 */
export function DesignSystem() {
  const { mode, setMode, accentTheme, setAccentTheme } = useTheme();
  const accents: AccentName[] = ["volt", "signal-orange", "crimson"];

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16, maxWidth: 640 }}>
      <div className="wordmark" style={{ fontSize: 32 }}>
        trax<span style={{ color: "var(--accent-color)" }}>●</span>
      </div>
      <div className="tagline">TRACK TODAY. BUILD TOMORROW.</div>
      <div style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)", fontSize: 14 }}>
        {mode} · {accentTheme}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        {(["dark", "light"] as const).map((m) => (
          <button key={m} className="seg" style={{ padding: "8px 16px" }} onClick={() => setMode(m)}>
            {m}
          </button>
        ))}
        {accents.map((a) => (
          <button key={a} className="seg" style={{ padding: "8px 16px" }} onClick={() => setAccentTheme(a)}>
            {a}
          </button>
        ))}
      </div>

      <div className="card-primary" style={{ padding: 16 }}>primary — border + accent shadow</div>
      <div className="card-secondary" style={{ padding: 16 }}>secondary — border only</div>
      <div className="card-tertiary" style={{ padding: 16 }}>tertiary — plain fill</div>

      <div style={{ display: "flex", gap: 12 }}>
        <button className="btn primary" style={{ padding: "12px 24px" }}>Primary</button>
        <button className="btn secondary" style={{ padding: "12px 24px" }}>Secondary</button>
      </div>

      <input className="input" placeholder="Type here…" style={{ padding: "12px 16px" }} />

      <div style={{ display: "flex", gap: 8 }}>
        <span className="seg" style={{ padding: "8px 16px" }}>plain</span>
        <span className="seg selected-accent" style={{ padding: "8px 16px" }}>accent</span>
        <span className="seg selected-contrast" style={{ padding: "8px 16px" }}>contrast</span>
      </div>

      <div className="sticky-note" style={{ padding: 16 }}>
        <div className="fold" />
        <div style={{ fontFamily: "var(--font-body)", fontSize: 14 }}>“Show up. Check it off. Repeat.”</div>
        <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-secondary)", marginTop: 8 }}>— Trax</div>
      </div>

      <div className="divider-h" />
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <strong style={{ fontFamily: "var(--font-body)" }}>12</strong>
        <div className="divider-v" style={{ height: 24 }} />
        <strong style={{ fontFamily: "var(--font-body)" }}>5</strong>
        <div className="divider-v" style={{ height: 24 }} />
        <strong style={{ fontFamily: "var(--font-body)" }}>80%</strong>
      </div>
    </div>
  );
}
