import { useState } from "react";
import { Arrow } from "./shared";

interface CatalogItem {
  name: string;
  cat: string;
  tier: "free" | "pro";
}

const ALL_COMPONENTS: CatalogItem[] = [
  // Input
  { name: "Button", cat: "Input", tier: "free" },
  { name: "Checkbox", cat: "Input", tier: "free" },
  { name: "Input", cat: "Input", tier: "free" },
  { name: "Slider", cat: "Input", tier: "free" },
  { name: "Switch", cat: "Input", tier: "free" },
  { name: "Dropdown", cat: "Input", tier: "free" },
  // Layout
  { name: "Accordion", cat: "Layout", tier: "free" },
  { name: "Card", cat: "Layout", tier: "free" },
  { name: "Tabs", cat: "Layout", tier: "free" },
  // Navigation
  { name: "Navigation Menu", cat: "Navigation", tier: "free" },
  // Feedback
  { name: "Alert", cat: "Feedback", tier: "free" },
  { name: "Badge", cat: "Feedback", tier: "free" },
  { name: "Progress", cat: "Feedback", tier: "free" },
  { name: "Tooltip", cat: "Feedback", tier: "free" },
  // Overlay
  { name: "Dialog", cat: "Overlay", tier: "free" },
  { name: "Drawer", cat: "Overlay", tier: "free" },
  { name: "Popover", cat: "Overlay", tier: "free" },
  // Display
  { name: "Avatar", cat: "Display", tier: "free" },
  // Pro
  { name: "Data Table", cat: "Data", tier: "pro" },
  { name: "Animated Text", cat: "Text", tier: "pro" },
];

const CATEGORIES = ["All", ...Array.from(new Set(ALL_COMPONENTS.map((c) => c.cat)))];

export default function ComponentCatalog() {
  const [filter, setFilter] = useState("All");

  const filtered = filter === "All"
    ? ALL_COMPONENTS
    : ALL_COMPONENTS.filter((c) => c.cat === filter);

  return (
    <section className="sec comp-bg" id="components">
      <div className="wrap">
        <div className="comp-hdr">
          <div>
            <div className="ol">Full Component Library</div>
            <h2 className="h2">{ALL_COMPONENTS.length} components.<br />All <em>customizable.</em></h2>
          </div>
          <p style={{ fontSize: "15px", color: "var(--text-muted)", maxWidth: "320px", lineHeight: "1.7" }}>
            Every component works in the visual editor with live preview, effect controls, and multi-format export.
          </p>
        </div>

        <div className="catalog-filters">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`catalog-filter ${filter === cat ? "active" : ""}`}
              onClick={() => setFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="catalog-grid">
          {filtered.map((c) => (
            <div key={c.name} className="catalog-card">
              <span className={`catalog-badge ${c.tier}`}>{c.tier}</span>
              <div className="catalog-card-name">{c.name}</div>
              <div className="catalog-card-cat">{c.cat}</div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: "48px" }}>
          <a
            href="https://j6-ui.netlify.app/library/"
            target="_blank"
            rel="noopener noreferrer"
            className="bp"
            style={{ display: "inline-flex" }}
          >
            Browse full library <Arrow />
          </a>
        </div>
      </div>
    </section>
  );
}
