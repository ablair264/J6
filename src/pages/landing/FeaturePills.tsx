const PILLS = [
  "Drop Shadow", "Inner Shadow", "Glow Effects", "Spotlight",
  "Animated Borders", "Gradient Mesh",
];

export default function FeaturePills() {
  return (
    <div className="feature-pills">
      {PILLS.map((item, i) => <span key={i} className="pill">{item}</span>)}
    </div>
  );
}
