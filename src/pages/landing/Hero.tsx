import { Arrow } from "./shared";

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-text">
        <div className="eyebrow">Visual component design</div>
        <h1 className="hero-title">
          Design <em>React</em> components.<br />Without guessing.
        </h1>
        <p className="hero-desc">
          A browser-based studio for React components. Motion controls, visual effects,
          a full token system — then export clean CSS or Tailwind.
        </p>
        <div className="hero-actions">
          <button className="bp">Start for free <Arrow /></button>
          <button className="bs">Watch demo</button>
        </div>
      </div>

      <div className="hero-showcase">
        <div className="hero-showcase-glow" />
        <div className="hero-showcase-inner">
          <video
            src="/edit-component.mp4"
            poster="/screenshot.png"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          />
        </div>
        <div className="hero-showcase-fade" />
      </div>
    </section>
  );
}
