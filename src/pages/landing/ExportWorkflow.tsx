import { useState } from "react";

const STEPS = [
  { num: "1", title: "Pick a component", desc: "Choose from 22+ components — buttons, cards, inputs, dialogs, data tables, and more." },
  { num: "2", title: "Style it visually", desc: "Use the inspector panel to adjust colors, spacing, borders, shadows, and typography. See every change live." },
  { num: "3", title: "Add effects & motion", desc: "Apply entry animations, hover effects, neon glow, animated borders — all with slider controls." },
  { num: "4", title: "Export clean code", desc: "Copy production-ready CSS, Tailwind utilities, or a full React component with named props." },
];

const CODE_TABS = [
  {
    label: "CSS",
    code: `<span class="cmt">/* Exported from UI Studio */</span>
<span class="kw">.btn-primary</span> {
  <span class="prop">padding</span>: <span class="num">14px</span> <span class="num">32px</span>;
  <span class="prop">border-radius</span>: <span class="num">10px</span>;
  <span class="prop">background</span>: <span class="str">#F5A623</span>;
  <span class="prop">color</span>: <span class="str">#0A0A0B</span>;
  <span class="prop">font-weight</span>: <span class="num">600</span>;
  <span class="prop">box-shadow</span>: <span class="num">0</span> <span class="num">0</span> <span class="num">36px</span> <span class="str">rgba(245,166,35,0.5)</span>;
  <span class="prop">transition</span>: all <span class="num">0.25s</span> ease;
}

<span class="kw">.btn-primary:hover</span> {
  <span class="prop">transform</span>: translateY(<span class="num">-2px</span>) scale(<span class="num">1.02</span>);
  <span class="prop">box-shadow</span>: <span class="num">0</span> <span class="num">0</span> <span class="num">72px</span> <span class="str">rgba(245,166,35,0.3)</span>;
}`,
  },
  {
    label: "Tailwind",
    code: `<span class="cmt">&lt;!-- Exported from UI Studio --&gt;</span>
<span class="kw">&lt;button</span>
  <span class="prop">class</span>=<span class="str">"px-8 py-3.5 rounded-[10px]
    bg-[#F5A623] text-[#0A0A0B]
    font-semibold
    shadow-[0_0_36px_rgba(245,166,35,0.5)]
    hover:-translate-y-0.5 hover:scale-[1.02]
    hover:shadow-[0_0_72px_rgba(245,166,35,0.3)]
    transition-all duration-250"</span>
<span class="kw">&gt;</span>
  Get Started
<span class="kw">&lt;/button&gt;</span>`,
  },
  {
    label: "React",
    code: `<span class="cmt">// Exported from UI Studio</span>
<span class="kw">export function</span> <span class="str">PrimaryButton</span>({ children }) {
  <span class="kw">return</span> (
    <span class="kw">&lt;button</span>
      <span class="prop">className</span>=<span class="str">"btn-primary"</span>
      <span class="prop">style</span>={{
        <span class="prop">padding</span>: <span class="str">'14px 32px'</span>,
        <span class="prop">borderRadius</span>: <span class="num">10</span>,
        <span class="prop">background</span>: <span class="str">'#F5A623'</span>,
        <span class="prop">color</span>: <span class="str">'#0A0A0B'</span>,
        <span class="prop">fontWeight</span>: <span class="num">600</span>,
      }}
    <span class="kw">&gt;</span>
      {children}
    <span class="kw">&lt;/button&gt;</span>
  );
}`,
  },
];

export default function ExportWorkflow() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <section className="sec" id="workflow">
      <div className="wrap">
        <div className="ol">Design &rarr; Export</div>
        <h2 className="h2">From idea to<br /><em>production code.</em></h2>
        <p className="lead">
          Four steps. No build tools, no CLI setup, no dependencies to install.
          Design visually, copy the output, ship it.
        </p>

        <div className="workflow-steps">
          {STEPS.map((s) => (
            <div key={s.num} className="workflow-step">
              <div className="workflow-num">{s.num}</div>
              <div className="workflow-step-title">{s.title}</div>
              <div className="workflow-step-desc">{s.desc}</div>
            </div>
          ))}
        </div>

        <div className="workflow-code">
          <div className="workflow-code-tabs">
            {CODE_TABS.map((tab, i) => (
              <div
                key={tab.label}
                className={`workflow-code-tab ${i === activeTab ? "active" : ""}`}
                onClick={() => setActiveTab(i)}
              >
                {tab.label}
              </div>
            ))}
          </div>
          <div
            className="workflow-code-block"
            dangerouslySetInnerHTML={{ __html: CODE_TABS[activeTab].code }}
          />
        </div>
      </div>
    </section>
  );
}
