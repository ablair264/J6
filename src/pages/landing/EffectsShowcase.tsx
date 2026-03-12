import { useState, useEffect, type CSSProperties } from "react";

const EFFECTS: {
  name: string; desc: string; color: string;
  demoStyle: CSSProperties; ambient: string;
}[] = [
  {
    name: "Drop Shadow", color: "#F5A623",
    desc: "Multi-layer directional shadows with full x/y/blur/spread control",
    demoStyle: {
      background: "#F5A623", color: "#0A0A0B",
      boxShadow: "0 6px 12px rgba(245,166,35,0.3), 0 20px 40px rgba(245,166,35,0.2), 8px 8px 0 rgba(245,166,35,0.15)",
      border: "none",
    },
    ambient: "rgba(245,166,35,0.35)",
  },
  {
    name: "Neon Glow", color: "#22D3EE",
    desc: "Ambient colour glow with intensity, colour and spread control",
    demoStyle: {
      background: "#22D3EE", color: "#0A0A0B",
      boxShadow: "0 0 15px rgba(34,211,238,0.8), 0 0 45px rgba(34,211,238,0.4), 0 0 90px rgba(34,211,238,0.15)",
      border: "none",
    },
    ambient: "rgba(34,211,238,0.5)",
  },
  {
    name: "Gradient", color: "#818CF8",
    desc: "Linear, radial, conic and mesh gradient editor",
    demoStyle: {
      background: "linear-gradient(135deg, #818CF8, #F472B6, #FB923C)",
      color: "#fff",
      boxShadow: "0 8px 32px rgba(129,140,248,0.3), 0 4px 12px rgba(244,114,182,0.2)",
      border: "none",
    },
    ambient: "rgba(129,140,248,0.4)",
  },
  {
    name: "Spotlight", color: "#F0EDE8",
    desc: "Directional light source simulated on components",
    demoStyle: {
      background: "radial-gradient(ellipse at 25% 25%, rgba(255,255,255,0.2) 0%, transparent 50%), var(--bg-elevated)",
      color: "var(--text-primary)",
      boxShadow: "0 2px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)",
      border: "1px solid rgba(255,255,255,0.1)",
    },
    ambient: "rgba(240,237,232,0.15)",
  },
  {
    name: "Animated Border", color: "#10B981",
    desc: "CSS-powered rotating, pulsing and drawing borders",
    demoStyle: {
      background: "var(--bg-elevated)", color: "#10B981",
      boxShadow: "0 0 0 2px #10B981, 0 0 20px rgba(16,185,129,0.25)",
      border: "none",
      animation: "fx-border-pulse 2s ease-in-out infinite",
    },
    ambient: "rgba(16,185,129,0.3)",
  },
  {
    name: "Inner Shadow", color: "#FB923C",
    desc: "Inset shadow effects for pressed or embossed component states",
    demoStyle: {
      background: "var(--bg-surface)", color: "var(--text-secondary)",
      boxShadow: "inset 4px 4px 16px rgba(0,0,0,0.6), inset -3px -3px 10px rgba(251,146,60,0.08), 0 1px 0 rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.04)",
    },
    ambient: "rgba(251,146,60,0.2)",
  },
  {
    name: "Stroke", color: "#F43F5E",
    desc: "Borders with gradient and animated sweep variants",
    demoStyle: {
      background: "transparent", color: "#F43F5E",
      boxShadow: "0 0 16px rgba(244,63,94,0.15)",
      border: "2px solid #F43F5E",
    },
    ambient: "rgba(244,63,94,0.25)",
  },
];

function EffectsShowcaseCard() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [sparkles] = useState(() =>
    Array.from({ length: 6 }, () => ({
      top: `${20 + Math.random() * 60}%`,
      left: `${20 + Math.random() * 60}%`,
      delay: Math.random() * 3,
      duration: Math.random() * 2 + 4,
    }))
  );

  useEffect(() => {
    const t = setInterval(() => setActiveIdx((i) => (i + 1) % EFFECTS.length), 3500);
    return () => clearInterval(t);
  }, []);

  const fx = EFFECTS[activeIdx];

  return (
    <div
      className="fx-card"
      style={{
        borderColor: `${fx.color}25`,
        boxShadow: `0 0 60px ${fx.color}08, 0 24px 48px rgba(0,0,0,0.4)`,
      }}
    >
      <style>{`
        @keyframes fx-border-pulse {
          0%, 100% { box-shadow: 0 0 0 2px #10B981, 0 0 20px rgba(16,185,129,0.25); }
          50% { box-shadow: 0 0 0 3px #10B981, 0 0 30px rgba(16,185,129,0.4); }
        }
      `}</style>

      <div className="fx-card-stage">
        {sparkles.map((s, i) => (
          <div key={i} className="fx-sparkle" style={{
            top: s.top, left: s.left, opacity: 0,
            animation: `fx-sparkle-anim ${s.duration}s ${s.delay}s ease-in-out infinite`,
          }} />
        ))}
        <div className="fx-ambient" style={{ background: fx.ambient }} />
        <div className="fx-demo" style={fx.demoStyle}>
          Get Started
        </div>
        <div className="fx-indicators">
          {EFFECTS.map((_, i) => (
            <div
              key={i}
              className={`fx-ind ${i === activeIdx ? "active" : ""}`}
              style={i === activeIdx ? { background: fx.color } : undefined}
              onClick={() => setActiveIdx(i)}
            />
          ))}
        </div>
      </div>

      <div className="fx-card-info">
        <div>
          <div className="fx-card-info-name" style={{ color: fx.color }}>{fx.name}</div>
          <div className="fx-card-info-desc">{fx.desc}</div>
        </div>
        <div className="fx-card-count">{activeIdx + 1}/{EFFECTS.length}</div>
      </div>
    </div>
  );
}

export default function EffectsShowcase() {
  return (
    <section className="sec" id="effects">
      <div className="wrap">
        <div className="fx-layout">
          <div>
            <div className="ol">Visual Effects</div>
            <h2 className="h2">Seven ways to<br />make it <em>yours.</em></h2>
            <p className="lead">Every effect has full numeric control. Not a preset — a proper design tool.</p>
          </div>
          <EffectsShowcaseCard />
        </div>
      </div>
    </section>
  );
}
