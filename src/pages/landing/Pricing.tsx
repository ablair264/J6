export default function Pricing() {
  return (
    <section className="sec" id="pricing">
      <div className="wrap">
        <div style={{ marginBottom: "64px" }}>
          <div className="ol">Pricing</div>
          <h2 className="h2">Start free.<br /><em>Go pro</em> when ready.</h2>
        </div>
        <div className="pgrid-layout">
          <div className="pcard2">
            <div className="ptier">Free</div>
            <div className="pamt"><sup>$</sup>0</div>
            <p className="pdesc">Everything you need to start building great components. No card required, no time limit.</p>
            <ul className="pfeats">
              {["All 16 standard components", "Drop shadow, stroke, gradient effects", "Basic token system", "CSS export", "Hover & tap motion", "Community support"].map((f) => <li key={f}>{f}</li>)}
            </ul>
            <button className="pcta pcta-f" style={{ border: "1px solid var(--border-strong)" }}>Start for free</button>
          </div>
          <div className="pcard2 ft">
            <div className="ptier">Pro</div>
            <div className="pamt"><sup>$</sup>12<sub>/mo</sub></div>
            <p className="pdesc">The full toolkit. Pro components, all effects, Tailwind export, and the complete token architecture system.</p>
            <ul className="pfeats">
              {["Everything in Free", "6 Pro components incl. Datatable", "All 7 effect types", "Spotlight & animated borders", "Animated border effects", "Full token system creator", "Tailwind CSS export", "Entry & exit animations", "Priority support"].map((f) => <li key={f}>{f}</li>)}
            </ul>
            <button className="pcta pcta-p">Start Pro Trial</button>
          </div>
        </div>
      </div>
    </section>
  );
}
