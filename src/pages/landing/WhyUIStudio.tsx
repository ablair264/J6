export default function WhyUIStudio() {
  return (
    <section className="sec">
      <div className="wrap">
        <div className="ol">Why UI Studio</div>
        <h2 className="h2">Built for people who<br /><em>learn by doing.</em></h2>
        <p className="lead">
          You don't need to know CSS by heart. Pick a component, move sliders,
          see what happens. When it looks right, copy the code.
        </p>

        <div className="why-grid">
          <div className="why-points">
            <div className="why-point">
              <div className="why-point-icon" style={{ background: "rgba(245,166,35,0.12)", color: "#F5A623" }}>
                {"\u25A0"}
              </div>
              <div>
                <div className="why-point-title">See what you're building</div>
                <div className="why-point-desc">
                  No more refreshing the browser after every CSS change. The preview updates instantly
                  as you adjust any property — colors, spacing, shadows, radius, everything.
                </div>
              </div>
            </div>
            <div className="why-point">
              <div className="why-point-icon" style={{ background: "rgba(124,58,237,0.12)", color: "#9F72FF" }}>
                {"\u2699"}
              </div>
              <div>
                <div className="why-point-title">No CSS expertise needed</div>
                <div className="why-point-desc">
                  Sliders for box-shadow. Color pickers for gradients. Dropdowns for border-radius.
                  You control the design, we write the properties.
                </div>
              </div>
            </div>
            <div className="why-point">
              <div className="why-point-icon" style={{ background: "rgba(34,211,238,0.12)", color: "#22D3EE" }}>
                {"\u2750"}
              </div>
              <div>
                <div className="why-point-title">Copy-paste export</div>
                <div className="why-point-desc">
                  One click to copy CSS, Tailwind, or a full React component.
                  Paste it into your project and it just works. No dependencies, no lock-in.
                </div>
              </div>
            </div>
            <div className="why-point">
              <div className="why-point-icon" style={{ background: "rgba(16,185,129,0.12)", color: "#10B981" }}>
                {"\u2B06"}
              </div>
              <div>
                <div className="why-point-title">Learn by experimenting</div>
                <div className="why-point-desc">
                  Watch the generated code change as you move sliders. You'll understand box-shadow,
                  transforms, and keyframe animations by the time you've exported your first component.
                </div>
              </div>
            </div>
          </div>

          <div className="why-visual">
            <div className="why-compare">
              <div className="why-compare-col before">
                <div className="why-compare-label">Without UI Studio</div>
                <div className="why-compare-line">
                  1. Google "CSS box shadow generator"<br />
                  2. Copy some values<br />
                  3. Paste into code<br />
                  4. Refresh browser<br />
                  5. Not quite right...<br />
                  6. Go back to generator<br />
                  7. Repeat 14 times<br />
                  8. Give up and use defaults
                </div>
              </div>
              <div className="why-compare-col after">
                <div className="why-compare-label">With UI Studio</div>
                <div className="why-compare-line">
                  1. Open studio<br />
                  2. Pick component<br />
                  3. Drag sliders<br />
                  4. See it live<br />
                  5. Copy code<br />
                  6. Ship it
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
