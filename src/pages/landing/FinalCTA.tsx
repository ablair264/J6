import { Arrow } from "./shared";

export default function FinalCTA() {
  return (
    <section className="final">
      <div className="wrap">
        <h2 className="ftitle">Stop guessing.<br /><em>Start building.</em></h2>
        <p className="fdesc">Free forever for standard components. Pro for when you need everything.</p>
        <div className="faction">
          <button className="bp" style={{ padding: "16px 40px" }}>Open J6 — it's free <Arrow /></button>
          <button className="bs" style={{ padding: "16px 40px" }}>View on GitHub</button>
        </div>
      </div>
    </section>
  );
}
