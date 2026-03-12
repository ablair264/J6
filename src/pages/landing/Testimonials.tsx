const TESTIMONIALS = [
  { t: "J6 replaced my entire Figma-to-code workflow. Design, tweak the motion curve, export. Done.", n: "Alex R.", r: "Senior Frontend Engineer", featured: true },
  { t: "The token system is genuinely the best I've used. Everything derives from primitives properly.", n: "Priya M.", r: "Design Systems Lead", featured: false },
  { t: "I shipped an entire client design system in two days. The neumorphism controls alone saved hours.", n: "Tom C.", r: "Freelance Developer", featured: false },
  { t: "Finally a tool that doesn't assume I want purple gradients and Inter everywhere.", n: "Dana K.", r: "Creative Director", featured: false },
];

export default function Testimonials() {
  return (
    <section className="sec">
      <div className="wrap">
        <div className="ol" style={{ marginBottom: "48px" }}>Used by builders</div>
        <div className="tgrid">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className={`tc ${t.featured ? "featured" : ""}`}>
              <div className="ttext">"{t.t}"</div>
              <div className="tauthor">
                <div className="tavatar" />
                <div>
                  <div className="tname">{t.n}</div>
                  <div className="trole">{t.r}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
