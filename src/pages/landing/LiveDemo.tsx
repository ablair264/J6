import { useState, type CSSProperties } from "react";

export default function LiveDemo() {
  const [color, setColor] = useState("#22D3EE");
  const [radius, setRadius] = useState(12);
  const [intensity, setIntensity] = useState(36);
  const [effect, setEffect] = useState("glow");
  const [hovered, setHovered] = useState(false);
  const swatches = ["#F5A623", "#7C3AED", "#22D3EE", "#10B981", "#F43F5E", "#F472B6", "#FFFFFF", "#9A9AA3"];

  const btnStyle = (): CSSProperties => {
    const s: CSSProperties = {
      padding: "14px 36px", borderRadius: `${radius}px`, border: "none",
      cursor: "pointer", fontFamily: "var(--sans)", fontWeight: 700, fontSize: "16px",
      transition: "all 0.3s ease",
    };
    if (effect === "glow") {
      s.background = color; s.color = "#0A0A0B";
      s.boxShadow = hovered
        ? `0 0 ${intensity * 2}px ${color}80, 0 0 ${intensity * 4}px ${color}30`
        : `0 0 ${intensity}px ${color}50`;
    } else if (effect === "shadow") {
      s.background = color; s.color = "#0A0A0B";
      s.boxShadow = `${intensity / 4}px ${intensity / 4}px ${intensity}px rgba(0,0,0,0.6)`;
    } else {
      s.background = "var(--bg-elevated)"; s.color = color;
      s.border = "1px solid rgba(255,255,255,0.06)";
      s.boxShadow = `${intensity / 4}px ${intensity / 4}px ${intensity}px rgba(0,0,0,0.5), -${intensity / 8}px -${intensity / 8}px ${intensity / 2}px rgba(255,255,255,0.03)`;
    }
    if (hovered) s.transform = "translateY(-2px) scale(1.02)";
    return s;
  };

  return (
    <section className="sec-sm demo-bg">
      <div className="wrap">
        <div className="ol" style={{ marginBottom: "40px" }}>Interactive Demo</div>
        <div className="dlayout">
          <div className="dside">
            <div className="dside-h">Component Controls</div>
            <div className="dcg">
              <div className="dcl">Accent Color</div>
              <div className="sws">
                {swatches.map((c) => (
                  <div key={c} className={`sw ${color === c ? "on" : ""}`} style={{ background: c }} onClick={() => setColor(c)} />
                ))}
              </div>
            </div>
            <div className="dcg">
              <div className="dcl">Border Radius — {radius}px</div>
              <input type="range" className="dslider" min="0" max="50" value={radius} onChange={(e) => setRadius(+e.target.value)} />
            </div>
            <div className="dcg">
              <div className="dcl">Intensity — {intensity}</div>
              <input type="range" className="dslider" min="0" max="60" value={intensity} onChange={(e) => setIntensity(+e.target.value)} />
            </div>
            <div className="dcg">
              <div className="dcl">Effect</div>
              {([["glow", "Glow"], ["shadow", "Drop Shadow"]] as const).map(([v, l]) => (
                <div key={v} className="eopt" style={{
                  color: effect === v ? "var(--brand-default)" : "var(--text-muted)",
                  borderLeft: `2px solid ${effect === v ? "var(--brand-default)" : "transparent"}`,
                }} onClick={() => setEffect(v)}>{l}</div>
              ))}
            </div>
          </div>
          <div className="dcanvas">
            <button style={btnStyle()} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>Get Started</button>
            <div className="clabel">Hover to preview interaction</div>
          </div>
        </div>
      </div>
    </section>
  );
}
