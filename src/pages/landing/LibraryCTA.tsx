import { Arrow } from "./shared";

export default function LibraryCTA() {
  return (
    <section className="sec-sm" id="library" style={{ background: "var(--bg-base)", borderTop: "1px solid var(--border-subtle)", borderBottom: "1px solid var(--border-subtle)" }}>
      <div className="wrap">
        <div className="library-cta" style={{ textAlign: "center", maxWidth: "600px", margin: "0 auto" }}>
          <div className="ol" style={{ justifyContent: "center" }}>Component Library</div>
          <h2 className="h2" style={{ fontSize: "clamp(32px, 4vw, 48px)", marginBottom: "16px" }}>Explore the full <em>library</em></h2>
          <p style={{ fontSize: "16px", color: "var(--text-secondary)", lineHeight: "1.7", marginBottom: "32px" }}>
            Browse all 22+ components with live previews, props documentation, and copy-paste ready code.
          </p>
          <a
            href="https://j6-ui.netlify.app/library/"
            target="_blank"
            rel="noopener noreferrer"
            className="bp"
            style={{ display: "inline-flex", margin: "0 auto" }}
          >
            View Library <Arrow />
          </a>
        </div>
      </div>
    </section>
  );
}
