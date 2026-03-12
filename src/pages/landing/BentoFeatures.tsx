import { BentoMedia } from "./shared";

export default function BentoFeatures() {
  return (
    <section className="sec" id="how">
      <div className="wrap">
        <div className="bento-hdr">
          <div className="ol" style={{ justifyContent: "center" }}>Features</div>
          <h2 className="h2">Everything you need.<br /><em>Nothing you don't.</em></h2>
          <p className="lead">From live preview to production export — J6 covers the entire component design workflow in one focused tool.</p>
        </div>
        <div className="bento-grid">
          <div className="bento-card c-wide">
            <div className="bc-label">01</div>
            <div className="bc-title">Live Visual Editor & Preview</div>
            <div className="bc-desc">Design components in real-time on a configurable stage. Set your background to match your app, toggle grids, and see every change instantly.</div>
            <BentoMedia
              src="/screenshots/studio-editor.png" alt="Live editor with component preview and state variants"
              gradient="linear-gradient(135deg, var(--bg-elevated) 0%, var(--bg-subtle) 60%, rgba(245,166,35,0.06) 100%)"
              aspect="21/9"
            />
          </div>
          <div className="bento-card">
            <div className="bc-label">02</div>
            <div className="bc-title">Premium Motion & Effects</div>
            <div className="bc-desc">Border beam, neon glow, tilt 3D, glare, spotlight — effects that take hours to hand-code, applied in one click.</div>
            <BentoMedia
              src="/screenshots/motion-controls.png" alt="Motion FX panel with hover, scale, and easing controls"
              gradient="linear-gradient(160deg, var(--bg-subtle) 0%, var(--bg-elevated) 50%, rgba(124,58,237,0.08) 100%)"
              aspect="16/9"
            />
          </div>
          <div className="bento-card">
            <div className="bc-label">03</div>
            <div className="bc-title">Multi-Format Code Export</div>
            <div className="bc-desc">Export as inline CSS, Tailwind utilities, or clean React with named props.</div>
            <BentoMedia
              src="/screenshots/export-panel.png" alt="Tailwind code export with component and preview styles"
              gradient="linear-gradient(135deg, var(--bg-base) 0%, var(--bg-subtle) 100%)"
              aspect="16/9"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
