/* ================================================================
   J6 TOKENS + PAGE STYLES
   Shared CSS string injected once by the LandingPage composer.
   ================================================================ */

export const CSS = `
  @import url('https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@400,500,700,800,900&f[]=satoshi@400,500,700&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg-base: #0A0A0B; --bg-subtle: #111113; --bg-surface: #141416; --bg-elevated: #1A1A1D;
    --bg-overlay: rgba(0,0,0,0.72);
    --border-subtle: rgba(255,255,255,0.06); --border-default: rgba(255,255,255,0.10);
    --border-strong: rgba(255,255,255,0.18); --border-focus: #F5A623;
    --text-primary: #F0EDE8; --text-secondary: #9A9AA3; --text-muted: #6B6B72;
    --text-inverse: #0A0A0B; --text-link: #F5A623;
    --brand-default: #F5A623; --brand-hover: #FFBA4A;
    --brand-subtle: rgba(245,166,35,0.12); --brand-glow: rgba(245,166,35,0.25);
    --interactive-default: #7C3AED; --interactive-hover: #9F72FF;
    --interactive-subtle: rgba(124,58,237,0.15);
    --status-success: #34D399; --status-warning: #FACC15; --status-error: #FB7185; --status-info: #38BDF8;
    --showcase-electric: #22D3EE; --showcase-bloom: #F472B6; --showcase-acid: #A3E635;
    --showcase-plasma: #818CF8; --showcase-inferno: #FB923C; --showcase-crimson: #F43F5E;
    --showcase-spearmint: #10B981; --showcase-solar: #FACC15;
    --serif: 'Cabinet Grotesk', system-ui, sans-serif;
    --mono: 'Space Mono', 'Courier New', monospace;
    --sans: 'Satoshi', system-ui, sans-serif;
  }

  html { scroll-behavior: smooth; }
  body { background: var(--bg-base); color: var(--text-primary); font-family: var(--sans); -webkit-font-smoothing: antialiased; overflow-x: hidden; }
  ::-webkit-scrollbar { width: 3px; } ::-webkit-scrollbar-track { background: var(--bg-base); } ::-webkit-scrollbar-thumb { background: var(--brand-default); }

  /* ── Nav ─────────────────────────────────── */
  .nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; display: flex; align-items: center; justify-content: space-between; padding: 20px 48px; border-bottom: 1px solid transparent; transition: all 0.4s; }
  .nav.s { background: rgba(10,10,11,0.9); backdrop-filter: blur(24px); border-bottom-color: var(--border-subtle); }
  .nav-logo { display: flex; align-items: center; }
  .nav-logo img { height: 28px; width: auto; }
  .nav-logo .logo-light { display: none; }
  @media (prefers-color-scheme: light) {
    .nav-logo .logo-dark { display: none; }
    .nav-logo .logo-light { display: block; }
  }
  .nav-links { display: flex; gap: 36px; font-size: 13px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-muted); list-style: none; }
  .nav-links a { color: inherit; text-decoration: none; transition: color 0.2s; cursor: pointer; }
  .nav-links a:hover { color: var(--text-primary); }
  .nav-cta { font-family: var(--sans); font-size: 14px; font-weight: 600; padding: 10px 22px; background: var(--brand-default); color: var(--text-inverse); border: none; border-radius: 8px; cursor: pointer; transition: all 0.2s; }
  .nav-cta:hover { background: var(--brand-hover); transform: translateY(-1px); }

  /* ── Hero ─────────────────────────────────── */
  .hero {
    display: flex; flex-direction: column; align-items: center;
    padding: 160px 48px 0; position: relative; overflow: hidden;
  }
  .hero::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0;
    background: radial-gradient(ellipse at 50% 0%, rgba(245,166,35,0.05) 0%, transparent 60%);
    pointer-events: none;
  }
  .eyebrow {
    font-family: var(--mono); font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase;
    color: var(--brand-default); margin-bottom: 28px; display: flex; align-items: center; gap: 12px;
  }
  .eyebrow::before { content: ''; display: block; width: 32px; height: 1px; background: var(--brand-default); }
  .hero-text { text-align: center; max-width: 800px; display: flex; flex-direction: column; align-items: center; }
  .hero-title {
    font-family: var(--serif); font-size: clamp(48px, 6vw, 80px); line-height: 1.05;
    letter-spacing: -0.035em; margin-bottom: 28px; font-weight: 900;
  }
  .hero-title em { font-style: normal; color: var(--brand-default); font-weight: 900; }
  .hero-desc {
    font-size: 17px; line-height: 1.7; color: var(--text-secondary);
    max-width: 520px; margin-bottom: 44px; font-weight: 400;
  }
  .hero-actions { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; justify-content: center; margin-bottom: 80px; }

  /* ── Hero showcase ─────────────────────────────────── */
  .hero-showcase {
    position: relative; width: 100%; max-width: 1100px;
  }
  .hero-showcase-inner {
    width: 100%; border-radius: 12px; overflow: hidden;
    border: 1px solid var(--border-default);
    box-shadow:
      0 4px 8px rgba(0,0,0,0.1),
      0 16px 32px rgba(0,0,0,0.2),
      0 48px 80px rgba(0,0,0,0.4);
    transition: transform 0.4s ease, box-shadow 0.4s ease;
  }
  .hero-showcase:hover .hero-showcase-inner { transform: scale(1.005); box-shadow: 0 4px 8px rgba(0,0,0,0.1), 0 20px 40px rgba(0,0,0,0.25), 0 56px 96px rgba(0,0,0,0.45); }
  .hero-showcase-inner video { width: 100%; display: block; }
  .hero-showcase-glow {
    position: absolute; top: -20%; left: 10%; right: 10%; height: 60%;
    background: radial-gradient(ellipse at center, rgba(245,166,35,0.08) 0%, transparent 70%);
    pointer-events: none; z-index: -1; filter: blur(40px);
  }
  .hero-showcase-fade {
    position: absolute; bottom: 0; left: 0; right: 0; height: 120px;
    background: linear-gradient(to bottom, transparent, var(--bg-base));
    pointer-events: none; z-index: 2;
  }

  /* ── Feature Pills ─────────────────────────────────── */
  .feature-pills { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; padding: 32px 48px; background: var(--bg-surface); border-top: 1px solid var(--border-subtle); border-bottom: 1px solid var(--border-subtle); }
  .pill { font-family: var(--sans); font-size: 13px; font-weight: 500; color: var(--text-secondary); padding: 10px 20px; background: var(--bg-elevated); border: 1px solid var(--border-subtle); border-radius: 100px; transition: all 0.2s ease; }
  .pill:hover { border-color: var(--border-strong); color: var(--text-primary); transform: translateY(-1px); }

  /* ── Sections ─────────────────────────────────── */
  .sec { padding: 120px 48px; }
  .sec-sm { padding: 80px 48px; }
  .wrap { max-width: 1280px; margin: 0 auto; }
  .ol { font-family: var(--mono); font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--brand-default); display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
  .ol::before { content: ''; display: block; width: 24px; height: 1px; background: var(--brand-default); }
  .h2 { font-family: var(--serif); font-size: clamp(40px,4vw,64px); line-height: 1.0; letter-spacing: -0.03em; font-weight: 900; }
  .h2 em { font-style: normal; color: var(--brand-default); font-weight: 900; }
  .lead { font-size: 16px; line-height: 1.75; color: var(--text-secondary); max-width: 520px; margin-top: 20px; }

  /* ── Buttons ─────────────────────────────────── */
  .bp { font-family: var(--sans); font-size: 15px; font-weight: 600; padding: 14px 32px; background: var(--brand-default); color: var(--text-inverse); border: none; border-radius: 8px; cursor: pointer; transition: all 0.25s; display: flex; align-items: center; gap: 10px; }
  .bp:hover { background: var(--brand-hover); transform: translateY(-2px); box-shadow: 0 8px 32px var(--brand-glow); }
  .bs { font-family: var(--sans); font-size: 15px; font-weight: 500; padding: 14px 32px; background: transparent; color: var(--text-secondary); border: none; border-radius: 8px; cursor: pointer; transition: all 0.25s; }
  .bs:hover { color: var(--text-primary); }

  /* ── Bento Features ─────────────────────────────────── */
  .bento-hdr { text-align: center; max-width: 640px; margin: 0 auto 72px; }
  .bento-hdr .h2 { margin-bottom: 16px; }
  .bento-hdr .lead { margin: 0 auto; text-align: center; }
  .bento-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
  .bento-card { position: relative; overflow: hidden; padding: 40px 44px 0; background: var(--bg-subtle); border-radius: 16px; border: 1px solid var(--border-subtle); transition: all 0.3s ease; }
  .bento-card:hover { border-color: var(--border-strong); transform: translateY(-4px); }
  .bento-card.c-wide { grid-column: span 2; }
  .bc-label { font-family: var(--mono); font-size: 10px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--brand-default); margin-bottom: 14px; display: flex; align-items: center; gap: 8px; }
  .bc-label::before { content: ''; width: 14px; height: 1px; background: var(--brand-default); display: block; }
  .bc-title { font-family: var(--serif); font-size: 20px; line-height: 1.15; margin-bottom: 10px; font-weight: 800; letter-spacing: -0.02em; }
  .bc-desc { font-size: 13px; color: var(--text-muted); line-height: 1.7; max-width: 380px; margin-bottom: 32px; }
  .bc-media { width: 100%; position: relative; }
  .bc-media-inner { width: 100%; border-radius: 8px 8px 0 0; overflow: hidden; background: var(--bg-surface); border: 1px solid var(--border-strong); border-bottom: none; position: relative; }
  .bc-media-inner img, .bc-media-inner video { width: 100%; height: 100%; object-fit: cover; display: block; }
  .bc-placeholder {
    width: 100%; height: 100%; min-height: 200px;
    display: flex; align-items: center; justify-content: center;
  }

  /* ── Live Demo ─────────────────────────────────── */
  .demo-bg { background: var(--bg-subtle); border-top: 1px solid var(--border-subtle); border-bottom: 1px solid var(--border-subtle); }
  .dlayout { display: grid; grid-template-columns: 280px 1fr; border: 1px solid var(--border-subtle); overflow: hidden; min-height: 500px; }
  .dside { border-right: 1px solid var(--border-subtle); background: var(--bg-surface); }
  .dside-h { padding: 20px; border-bottom: 1px solid var(--border-subtle); font-family: var(--mono); font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-muted); }
  .dcg { padding: 16px 20px; border-bottom: 1px solid var(--border-subtle); }
  .dcl { font-family: var(--mono); font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-muted); margin-bottom: 12px; }
  .sws { display: flex; gap: 6px; flex-wrap: wrap; }
  .sw { width: 22px; height: 22px; border-radius: 50%; cursor: pointer; border: 2px solid transparent; transition: all 0.2s; }
  .sw.on { border-color: var(--brand-default); transform: scale(1.2); }
  .dslider { width: 100%; height: 2px; background: var(--border-strong); border-radius: 2px; outline: none; accent-color: var(--brand-default); appearance: none; -webkit-appearance: none; display: block; margin-top: 4px; }
  .eopt { font-family: var(--mono); font-size: 12px; cursor: pointer; padding: 6px 0 6px 10px; transition: all 0.2s; }
  .dcanvas { display: flex; align-items: center; justify-content: center; padding: 48px; position: relative; background: radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0.02) 0%, transparent 70%); }
  .clabel { position: absolute; bottom: 20px; right: 20px; font-family: var(--mono); font-size: 10px; color: var(--text-muted); }

  /* ── Effects Showcase ─────────────────────────────────── */
  .fx-layout { display: grid; grid-template-columns: 340px 1fr; gap: 80px; align-items: start; }
  .fx-card {
    max-width: 520px; width: 100%; margin: 0 auto; border-radius: 16px;
    border: 1px solid var(--border-default);
    background: var(--bg-subtle);
    overflow: hidden; transition: border-color 0.8s, box-shadow 0.8s;
  }
  .fx-card-stage {
    height: 320px; position: relative; overflow: hidden;
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0;
    background: radial-gradient(ellipse at 50% 40%, rgba(255,255,255,0.03) 0%, transparent 70%);
  }
  .fx-demo {
    width: 200px; height: 72px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-family: var(--sans); font-size: 15px; font-weight: 600;
    transition: all 0.7s cubic-bezier(0.34, 1.56, 0.64, 1);
    position: relative; z-index: 2;
  }
  .fx-ambient {
    position: absolute; width: 260px; height: 120px; border-radius: 50%;
    filter: blur(60px); opacity: 0.4; z-index: 1;
    transition: all 0.8s ease;
  }
  .fx-sparkle {
    position: absolute; width: 2px; height: 2px; border-radius: 50%;
    background: white; z-index: 4; pointer-events: none;
  }
  @keyframes fx-sparkle-anim {
    0%, 100% { opacity: 0; transform: scale(0); }
    50% { opacity: 0.6; transform: scale(1.2); }
  }
  .fx-indicators {
    display: flex; gap: 3px; position: absolute; bottom: 24px; z-index: 5;
  }
  .fx-ind {
    width: 28px; height: 3px; border-radius: 2px; background: var(--border-strong);
    transition: all 0.4s; cursor: pointer;
  }
  .fx-ind.active { background: var(--text-primary); width: 40px; }
  .fx-card-info {
    padding: 24px 28px; border-top: 1px solid var(--border-subtle);
    display: flex; align-items: flex-start; justify-content: space-between; gap: 20px;
  }
  .fx-card-info-name {
    font-family: var(--mono); font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase;
    margin-bottom: 6px; transition: color 0.4s;
  }
  .fx-card-info-desc {
    font-size: 13px; color: var(--text-secondary); line-height: 1.6; max-width: 340px;
  }
  .fx-card-count {
    font-family: var(--mono); font-size: 11px; color: var(--text-muted);
    letter-spacing: 0.06em; white-space: nowrap; padding-top: 2px;
  }

  /* ── Components Section ─────────────────────────────────── */
  .comp-bg { background: var(--bg-subtle); border-top: 1px solid var(--border-subtle); border-bottom: 1px solid var(--border-subtle); }
  .comp-hdr { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 56px; }
  .comp-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
  .comp-card { padding: 24px; background: var(--bg-elevated); border: 1px solid var(--border-subtle); border-radius: 12px; transition: all 0.25s; cursor: pointer; }
  .comp-card:hover { border-color: var(--border-strong); transform: translateY(-2px); }
  .comp-card-title { font-family: var(--sans); font-size: 15px; font-weight: 600; color: var(--text-primary); margin-bottom: 4px; }
  .comp-card-desc { font-size: 13px; color: var(--text-muted); }
  .comp-cat { font-family: var(--mono); font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--brand-default); margin-bottom: 12px; }

  /* ── Testimonials ─────────────────────────────────── */
  .tgrid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }
  .tc { background: var(--bg-subtle); padding: 40px 36px; border-radius: 16px; border: 1px solid var(--border-subtle); }
  .tc.featured { grid-column: span 2; background: var(--bg-elevated); }
  .tc.featured .ttext { font-size: 24px; }
  .ttext { font-family: var(--serif); font-size: 18px; line-height: 1.6; color: var(--text-primary); font-weight: 300; margin-bottom: 28px; }
  .tauthor { display: flex; align-items: center; gap: 12px; }
  .tavatar { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, var(--brand-default), var(--interactive-default)); }
  .tname { font-family: var(--sans); font-size: 14px; color: var(--text-primary); font-weight: 600; }
  .trole { font-family: var(--sans); font-size: 13px; color: var(--text-muted); }
  .tauthor .tsep { color: var(--text-muted); font-size: 13px; }

  /* ── Pricing ─────────────────────────────────── */
  .pgrid-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; overflow: hidden; }
  .pcard2 { background: var(--bg-subtle); padding: 56px 48px; position: relative; border-radius: 16px; border: 1px solid var(--border-subtle); }
  .pcard2.ft { background: var(--bg-elevated); border: 1px solid rgba(245,166,35,0.3); box-shadow: 0 0 0 1px rgba(245,166,35,0.1), 0 0 60px rgba(245,166,35,0.08); }
  .ptier { font-family: var(--mono); font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--text-muted); margin-bottom: 32px; }
  .pamt { font-family: var(--serif); font-size: 72px; line-height: 1; margin-bottom: 8px; letter-spacing: -0.03em; }
  .pamt sup { font-size: 24px; vertical-align: super; color: var(--text-muted); }
  .pamt sub { font-family: var(--mono); font-size: 14px; color: var(--text-muted); vertical-align: baseline; }
  .pdesc { font-size: 14px; color: var(--text-muted); line-height: 1.6; margin-bottom: 40px; padding-bottom: 40px; border-bottom: 1px solid var(--border-subtle); }
  .pfeats { list-style: none; margin-bottom: 48px; }
  .pfeats li { font-family: var(--sans); font-size: 15px; color: var(--text-secondary); padding: 12px 0; border-bottom: 1px solid var(--border-subtle); display: flex; align-items: center; gap: 12px; }
  .pfeats li:last-child { border-bottom: none; }
  .pfeats li::before { content: '\\2014'; color: var(--brand-default); font-size: 12px; flex-shrink: 0; }
  .pcta { width: 100%; padding: 14px; font-family: var(--sans); font-size: 15px; font-weight: 600; border-radius: 8px; cursor: pointer; transition: all 0.25s; border: none; }
  .pcta-f { background: transparent; color: var(--text-muted); border: 1px solid var(--border-strong) !important; }
  .pcta-f:hover { color: var(--text-primary); }
  .pcta-p { background: var(--brand-default); color: var(--text-inverse); }
  .pcta-p:hover { background: var(--brand-hover); transform: translateY(-1px); box-shadow: 0 8px 24px var(--brand-glow); }

  /* ── Final CTA ─────────────────────────────────── */
  .final { text-align: center; padding: 160px 48px; position: relative; overflow: hidden; border-top: 1px solid var(--border-subtle); }
  .final::before { content: 'J6'; position: absolute; font-family: var(--serif); font-size: clamp(200px,30vw,400px); font-weight: 900; color: rgba(245,166,35,0.03); top: 50%; left: 50%; transform: translate(-50%,-50%); pointer-events: none; }
  .ftitle { font-family: var(--serif); font-size: clamp(48px,5vw,80px); line-height: 1.0; letter-spacing: -0.03em; margin-bottom: 24px; position: relative; z-index: 1; font-weight: 900; }
  .ftitle em { font-style: normal; color: var(--brand-default); font-weight: 900; }
  .fdesc { font-size: 16px; color: var(--text-secondary); margin-bottom: 48px; position: relative; z-index: 1; }
  .faction { display: flex; gap: 16px; justify-content: center; position: relative; z-index: 1; }

  /* ── Footer ─────────────────────────────────── */
  .footer { border-top: 1px solid var(--border-subtle); padding: 40px 48px; display: flex; align-items: center; justify-content: space-between; }
  .flogo { display: flex; align-items: center; }
  .flogo img { height: 22px; width: auto; }
  .flogo .logo-light { display: none; }
  @media (prefers-color-scheme: light) {
    .flogo .logo-dark { display: none; }
    .flogo .logo-light { display: block; }
  }
  .flinks { display: flex; gap: 28px; list-style: none; }
  .flinks a { font-family: var(--sans); font-size: 14px; color: var(--text-muted); text-decoration: none; transition: color 0.2s; }
  .flinks a:hover { color: var(--text-primary); }
  .fcopy { font-family: var(--sans); font-size: 13px; color: var(--text-muted); }

  /* ── Motion Showcase ─────────────────────────────────── */
  .motion-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 56px; }
  .motion-card {
    padding: 32px 28px; background: var(--bg-subtle); border: 1px solid var(--border-subtle);
    border-radius: 14px; transition: all 0.3s ease; cursor: default;
  }
  .motion-card:hover { border-color: var(--border-strong); transform: translateY(-3px); }
  .motion-card-icon {
    width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center;
    margin-bottom: 20px; font-size: 20px;
  }
  .motion-card-title { font-family: var(--sans); font-size: 15px; font-weight: 700; margin-bottom: 8px; }
  .motion-card-desc { font-size: 13px; color: var(--text-muted); line-height: 1.65; }
  .motion-demo-stage {
    margin-top: 56px; padding: 48px; background: var(--bg-subtle); border: 1px solid var(--border-subtle);
    border-radius: 16px; display: flex; flex-direction: column; align-items: center; gap: 32px;
  }
  .motion-presets { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; }
  .motion-preset-btn {
    font-family: var(--mono); font-size: 11px; letter-spacing: 0.06em;
    padding: 8px 16px; border-radius: 100px; cursor: pointer; transition: all 0.2s;
    border: 1px solid var(--border-subtle); background: var(--bg-elevated); color: var(--text-muted);
  }
  .motion-preset-btn:hover { border-color: var(--border-strong); color: var(--text-primary); }
  .motion-preset-btn.active { border-color: var(--brand-default); color: var(--brand-default); background: var(--brand-subtle); }
  .motion-demo-box {
    width: 180px; height: 60px; border-radius: 10px; background: var(--brand-default); color: var(--text-inverse);
    display: flex; align-items: center; justify-content: center; font-family: var(--sans); font-size: 14px; font-weight: 600;
  }

  /* ── Export Workflow ─────────────────────────────────── */
  .workflow-steps { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2px; margin-top: 56px; }
  .workflow-step {
    padding: 36px 28px; background: var(--bg-subtle); position: relative;
    transition: all 0.3s ease;
  }
  .workflow-step:first-child { border-radius: 14px 0 0 14px; }
  .workflow-step:last-child { border-radius: 0 14px 14px 0; }
  .workflow-step:hover { background: var(--bg-elevated); }
  .workflow-num {
    font-family: var(--serif); font-size: 40px; font-weight: 900; color: var(--brand-default);
    opacity: 0.3; margin-bottom: 16px; line-height: 1;
  }
  .workflow-step-title { font-family: var(--sans); font-size: 15px; font-weight: 700; margin-bottom: 8px; }
  .workflow-step-desc { font-size: 13px; color: var(--text-muted); line-height: 1.65; }
  .workflow-code {
    margin-top: 48px; padding: 32px; background: var(--bg-surface); border: 1px solid var(--border-subtle);
    border-radius: 14px; overflow: hidden;
  }
  .workflow-code-tabs { display: flex; gap: 0; margin: -32px -32px 24px; border-bottom: 1px solid var(--border-subtle); }
  .workflow-code-tab {
    font-family: var(--mono); font-size: 12px; letter-spacing: 0.04em;
    padding: 14px 24px; cursor: pointer; transition: all 0.2s;
    color: var(--text-muted); border-bottom: 2px solid transparent;
  }
  .workflow-code-tab:hover { color: var(--text-primary); }
  .workflow-code-tab.active { color: var(--brand-default); border-bottom-color: var(--brand-default); }
  .workflow-code-block {
    font-family: var(--mono); font-size: 13px; line-height: 1.7; color: var(--text-secondary);
    white-space: pre; overflow-x: auto;
  }
  .workflow-code-block .kw { color: var(--interactive-default); }
  .workflow-code-block .str { color: var(--showcase-spearmint); }
  .workflow-code-block .num { color: var(--showcase-inferno); }
  .workflow-code-block .cmt { color: var(--text-muted); }
  .workflow-code-block .prop { color: var(--showcase-electric); }

  /* ── Component Catalog ─────────────────────────────────── */
  .catalog-filters { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 32px; }
  .catalog-filter {
    font-family: var(--mono); font-size: 11px; letter-spacing: 0.06em;
    padding: 7px 16px; border-radius: 100px; cursor: pointer; transition: all 0.2s;
    border: 1px solid var(--border-subtle); background: transparent; color: var(--text-muted);
  }
  .catalog-filter:hover { border-color: var(--border-strong); color: var(--text-primary); }
  .catalog-filter.active { border-color: var(--brand-default); color: var(--brand-default); background: var(--brand-subtle); }
  .catalog-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
  .catalog-card {
    padding: 20px; background: var(--bg-elevated); border: 1px solid var(--border-subtle);
    border-radius: 12px; transition: all 0.25s; cursor: pointer; position: relative;
  }
  .catalog-card:hover { border-color: var(--border-strong); transform: translateY(-2px); }
  .catalog-card-name { font-family: var(--sans); font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 4px; }
  .catalog-card-cat { font-family: var(--mono); font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-muted); }
  .catalog-badge {
    position: absolute; top: 12px; right: 12px; font-family: var(--mono); font-size: 9px;
    letter-spacing: 0.1em; text-transform: uppercase; padding: 3px 8px; border-radius: 4px;
  }
  .catalog-badge.free { background: rgba(52,211,153,0.12); color: var(--status-success); }
  .catalog-badge.pro { background: var(--interactive-subtle); color: var(--interactive-default); }

  /* ── Why UI Studio ─────────────────────────────────── */
  .why-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: center; margin-top: 56px; }
  .why-points { display: flex; flex-direction: column; gap: 28px; }
  .why-point { display: flex; gap: 20px; align-items: flex-start; }
  .why-point-icon {
    width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; font-size: 18px;
  }
  .why-point-title { font-family: var(--sans); font-size: 16px; font-weight: 700; margin-bottom: 6px; }
  .why-point-desc { font-size: 14px; color: var(--text-muted); line-height: 1.65; }
  .why-visual {
    padding: 48px; background: var(--bg-subtle); border: 1px solid var(--border-subtle);
    border-radius: 16px; display: flex; flex-direction: column; gap: 20px;
  }
  .why-compare { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .why-compare-col { padding: 24px; border-radius: 12px; }
  .why-compare-col.before { background: var(--bg-surface); border: 1px solid var(--border-subtle); }
  .why-compare-col.after { background: var(--brand-subtle); border: 1px solid rgba(245,166,35,0.2); }
  .why-compare-label {
    font-family: var(--mono); font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase;
    margin-bottom: 16px; display: flex; align-items: center; gap: 8px;
  }
  .why-compare-label::before { content: ''; width: 12px; height: 1px; display: block; }
  .why-compare-col.before .why-compare-label { color: var(--text-muted); }
  .why-compare-col.before .why-compare-label::before { background: var(--text-muted); }
  .why-compare-col.after .why-compare-label { color: var(--brand-default); }
  .why-compare-col.after .why-compare-label::before { background: var(--brand-default); }
  .why-compare-line {
    font-family: var(--mono); font-size: 12px; line-height: 2; color: var(--text-secondary);
  }

  /* ── Responsive ─────────────────────────────────── */
  @media (max-width: 900px) {
    .hero { padding: 120px 24px 0; }
    .hero-title { font-size: clamp(36px, 8vw, 56px); }
    .hero-actions { margin-bottom: 48px; }
    .hero-showcase-inner { transform: none; }
    .nav { padding: 16px 24px; } .nav-links { display: none; }
    .sec, .final { padding: 80px 24px; } .sec-sm { padding: 60px 24px; }
    .bento-grid { grid-template-columns: 1fr; }
    .bento-card.c-a, .bento-card.c-b, .bento-card.c-c, .bento-card.c-d { grid-column: span 1; }
    .pgrid-layout, .fx-layout { grid-template-columns: 1fr; }
    .tgrid { grid-template-columns: 1fr; }
    .dlayout { grid-template-columns: 1fr; }
    .dside { border-right: none; border-bottom: 1px solid var(--border-subtle); }
    .footer { flex-direction: column; gap: 20px; text-align: center; }
    .faction { flex-direction: column; align-items: center; }
    .comp-hdr { flex-direction: column; align-items: flex-start; gap: 20px; }
    .motion-grid { grid-template-columns: 1fr; }
    .workflow-steps { grid-template-columns: 1fr 1fr; }
    .workflow-step:first-child { border-radius: 14px 0 0 0; }
    .workflow-step:nth-child(2) { border-radius: 0 14px 0 0; }
    .workflow-step:nth-child(3) { border-radius: 0 0 0 14px; }
    .workflow-step:last-child { border-radius: 0 0 14px 0; }
    .catalog-grid { grid-template-columns: repeat(2, 1fr); }
    .why-grid { grid-template-columns: 1fr; }
    .why-compare { grid-template-columns: 1fr; }
  }
`;
