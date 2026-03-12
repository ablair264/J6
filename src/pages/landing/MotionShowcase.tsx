import { useState, useCallback, useRef } from "react";

const PRESETS = [
  { id: "blur-fade", label: "Blur Fade", from: { opacity: 0, filter: "blur(12px)", transform: "translateY(16px)" }, to: { opacity: 1, filter: "blur(0px)", transform: "translateY(0)" } },
  { id: "slide-scale", label: "Slide Scale", from: { opacity: 0, transform: "translateX(-40px) scale(0.9)" }, to: { opacity: 1, transform: "translateX(0) scale(1)" } },
  { id: "drop-in", label: "Drop In", from: { opacity: 0, transform: "translateY(-60px) scale(0.95)" }, to: { opacity: 1, transform: "translateY(0) scale(1)" } },
  { id: "expand-x", label: "Expand X", from: { opacity: 0, transform: "scaleX(0)" }, to: { opacity: 1, transform: "scaleX(1)" } },
  { id: "expand-y", label: "Expand Y", from: { opacity: 0, transform: "scaleY(0)" }, to: { opacity: 1, transform: "scaleY(1)" } },
  { id: "fade-up", label: "Fade Up", from: { opacity: 0, transform: "translateY(24px)" }, to: { opacity: 1, transform: "translateY(0)" } },
] as const;

const MOTION_FEATURES = [
  {
    icon: "~",
    bg: "rgba(124,58,237,0.12)",
    color: "#9F72FF",
    title: "Entry & Exit Presets",
    desc: "Six ready-made animation presets — blur-fade, slide-scale, drop-in, expand, and more. Pick one, tweak the timing, done.",
  },
  {
    icon: "\u21BB",
    bg: "rgba(34,211,238,0.12)",
    color: "#22D3EE",
    title: "Spring Physics",
    desc: "Real spring dynamics with stiffness, damping, and mass controls. Your animations feel natural, not robotic.",
  },
  {
    icon: "\u2197",
    bg: "rgba(245,166,35,0.12)",
    color: "#F5A623",
    title: "Hover & Tap Interactions",
    desc: "Scale, rotate, translate on hover or tap. Combine multiple transforms and see them update live in the preview.",
  },
  {
    icon: "\u25E3",
    bg: "rgba(244,114,182,0.12)",
    color: "#F472B6",
    title: "Transform Origin",
    desc: "Control where scaling and rotation anchor from — top-left, center, bottom-right, or any custom point.",
  },
  {
    icon: "\u25CF",
    bg: "rgba(16,185,129,0.12)",
    color: "#10B981",
    title: "Easing Curves",
    desc: "Choose from standard easings or define custom cubic-bezier curves. Preview the timing visually before you export.",
  },
  {
    icon: "\u29BF",
    bg: "rgba(251,146,60,0.12)",
    color: "#FB923C",
    title: "3D Tilt & Glare",
    desc: "Mouse-tracking 3D tilt with optional glare and spotlight overlays. Premium hover effects, zero hand-coding.",
  },
];

export default function MotionShowcase() {
  const [activePreset, setActivePreset] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);

  const replay = useCallback((idx: number) => {
    setActivePreset(idx);
    setAnimKey((k) => k + 1);
  }, []);

  const preset = PRESETS[activePreset];

  return (
    <section className="sec" id="motion">
      <div className="wrap">
        <div className="ol">Motion & Animation</div>
        <h2 className="h2">Animate everything.<br /><em>Control</em> everything.</h2>
        <p className="lead">
          Entry animations, hover interactions, spring physics — all with visual controls.
          No keyframes to write. No guessing at timing values.
        </p>

        {/* Interactive preset demo */}
        <div className="motion-demo-stage">
          <div className="motion-presets">
            {PRESETS.map((p, i) => (
              <button
                key={p.id}
                className={`motion-preset-btn ${i === activePreset ? "active" : ""}`}
                onClick={() => replay(i)}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div
            key={animKey}
            ref={boxRef}
            className="motion-demo-box"
            style={{
              animation: `landing-motion-demo 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards`,
            }}
          >
            {preset.label}
          </div>
          <style>{`
            @keyframes landing-motion-demo {
              from {
                opacity: ${preset.from.opacity};
                filter: ${"filter" in preset.from ? preset.from.filter : "none"};
                transform: ${preset.from.transform};
              }
              to {
                opacity: ${preset.to.opacity};
                filter: ${"filter" in preset.to ? preset.to.filter : "none"};
                transform: ${preset.to.transform};
              }
            }
          `}</style>
          <div style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--text-muted)", letterSpacing: "0.06em" }}>
            Click any preset to replay the animation
          </div>
        </div>

        {/* Feature cards */}
        <div className="motion-grid">
          {MOTION_FEATURES.map((f) => (
            <div key={f.title} className="motion-card">
              <div className="motion-card-icon" style={{ background: f.bg, color: f.color }}>
                {f.icon}
              </div>
              <div className="motion-card-title">{f.title}</div>
              <div className="motion-card-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
