import { useState, useEffect, useRef, type CSSProperties } from "react";

/* ================================================================
   J6 TOKENS + PAGE STYLES
   ================================================================ */
const CSS = `
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
  .nav-logo { font-family: var(--mono); font-size: 22px; color: var(--text-primary); }
  .nav-logo em { color: var(--brand-default); font-style: normal; }
  .nav-links { display: flex; gap: 36px; font-size: 13px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-muted); list-style: none; }
  .nav-links a { color: inherit; text-decoration: none; transition: color 0.2s; cursor: pointer; }
  .nav-links a:hover { color: var(--text-primary); }
  .nav-cta { font-family: var(--mono); font-size: 12px; font-weight: 500; letter-spacing: 0.06em; text-transform: uppercase; padding: 10px 22px; background: var(--brand-default); color: var(--text-inverse); border: none; border-radius: 4px; cursor: pointer; transition: all 0.2s; }
  .nav-cta:hover { background: var(--brand-hover); transform: translateY(-1px); }

  /* ── Hero ─────────────────────────────────── */
  .hero { min-height: 100vh; display: grid; grid-template-columns: 1fr 1fr; overflow: hidden; }
  .hero-l { display: flex; flex-direction: column; justify-content: flex-end; padding: 140px 48px 80px; }
  .eyebrow { font-family: var(--mono); font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--brand-default); margin-bottom: 28px; display: flex; align-items: center; gap: 12px; }
  .eyebrow::before { content: ''; display: block; width: 32px; height: 1px; background: var(--brand-default); }
  .hero-title { font-family: var(--serif); font-size: clamp(52px,5.5vw,88px); line-height: 1.0; letter-spacing: -0.03em; margin-bottom: 36px; font-weight: 900; }
  .hero-title em { font-style: normal; color: var(--brand-default); font-weight: 900; }
  .hero-desc { font-size: 16px; line-height: 1.7; color: var(--text-secondary); max-width: 480px; margin-bottom: 52px; font-weight: 400; }
  .hero-actions { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; }
  .hero-r { position: relative; overflow: hidden; border-left: 1px solid var(--border-subtle); }
  .hcanvas { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: var(--bg-subtle); }

  /* ── Hero video ─────────────────────────────────── */
  .hero-video-wrap {
    position: relative; z-index: 5; width: 92%; max-width: 600px;
    border-radius: 16px; overflow: hidden;
    border: 1px solid var(--border-default);
    box-shadow: 0 40px 100px rgba(0,0,0,0.5);
  }
  .hero-video-wrap video { width: 100%; display: block; }
  .hero-video-glow {
    position: absolute; inset: -40%; z-index: -1;
    background: radial-gradient(ellipse at center, rgba(245,166,35,0.06) 0%, transparent 70%);
    pointer-events: none;
  }

  /* ── Marquee Strip ─────────────────────────────────── */
  .strip { border-top: 1px solid var(--border-subtle); border-bottom: 1px solid var(--border-subtle); padding: 16px 0; background: var(--bg-surface); overflow: hidden; white-space: nowrap; }
  .strip-i { display: inline-flex; animation: mq 30s linear infinite; }
  @keyframes mq { from{transform:translateX(0)} to{transform:translateX(-50%)} }
  .sitem { font-family: var(--mono); font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--text-muted); padding: 0 32px; display: inline-flex; align-items: center; gap: 32px; }
  .sitem::after { content: '\\00D7'; font-size: 8px; color: var(--brand-default); }

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
  .bp { font-family: var(--mono); font-size: 13px; font-weight: 500; letter-spacing: 0.06em; padding: 14px 32px; background: var(--brand-default); color: var(--text-inverse); border: none; border-radius: 4px; cursor: pointer; transition: all 0.25s; display: flex; align-items: center; gap: 10px; }
  .bp:hover { background: var(--brand-hover); transform: translateY(-2px); box-shadow: 0 8px 32px var(--brand-glow); }
  .bs { font-family: var(--mono); font-size: 13px; padding: 14px 32px; background: transparent; color: var(--text-muted); border: 1px solid var(--border-strong); border-radius: 4px; cursor: pointer; transition: all 0.25s; }
  .bs:hover { color: var(--text-primary); border-color: rgba(255,255,255,0.3); }

  /* ── Bento Features ─────────────────────────────────── */
  .bento-hdr { text-align: center; max-width: 640px; margin: 0 auto 72px; }
  .bento-hdr .h2 { margin-bottom: 16px; }
  .bento-hdr .lead { margin: 0 auto; text-align: center; }
  .bento-grid { display: grid; grid-template-columns: repeat(6, 1fr); grid-template-rows: auto auto; gap: 0; border: 1px solid var(--border-subtle); }
  .bento-card { position: relative; overflow: hidden; padding: 40px 44px 0; border: 1px solid var(--border-subtle); margin: -1px; }
  .bento-card.c-a { grid-column: span 4; border-bottom: 1px solid var(--border-subtle); }
  .bento-card.c-b { grid-column: span 2; border-bottom: 1px solid var(--border-subtle); }
  .bento-card.c-c { grid-column: span 3; }
  .bento-card.c-d { grid-column: span 3; }
  .bc-label { font-family: var(--mono); font-size: 10px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--brand-default); margin-bottom: 14px; display: flex; align-items: center; gap: 8px; }
  .bc-label::before { content: ''; width: 14px; height: 1px; background: var(--brand-default); display: block; }
  .bc-title { font-family: var(--serif); font-size: 20px; line-height: 1.15; margin-bottom: 10px; font-weight: 800; letter-spacing: -0.02em; }
  .bc-desc { font-size: 13px; color: var(--text-muted); line-height: 1.7; max-width: 380px; margin-bottom: 32px; }
  .bc-media { width: 100%; position: relative; }
  .bc-media-inner { width: 100%; border-radius: 8px 8px 0 0; overflow: hidden; background: var(--bg-surface); border: 1px solid var(--border-strong); border-bottom: none; position: relative; }
  .bc-media-inner img, .bc-media-inner video { width: 100%; height: 100%; object-fit: cover; display: block; }
  .bc-media-bar { display: flex; align-items: center; gap: 6px; padding: 10px 14px; background: var(--bg-surface); border: 1px solid var(--border-strong); border-top: 1px solid var(--border-subtle); }
  .bc-media-dot { width: 7px; height: 7px; border-radius: 50%; }
  .bc-media-title { font-family: var(--mono); font-size: 10px; color: var(--text-muted); margin-left: 8px; letter-spacing: 0.06em; }
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
  /* The main demo element */
  .fx-demo {
    width: 200px; height: 72px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-family: var(--sans); font-size: 15px; font-weight: 600;
    transition: all 0.7s cubic-bezier(0.34, 1.56, 0.64, 1);
    position: relative; z-index: 2;
  }
  /* Ambient glow behind demo element */
  .fx-ambient {
    position: absolute; width: 260px; height: 120px; border-radius: 50%;
    filter: blur(60px); opacity: 0.4; z-index: 1;
    transition: all 0.8s ease;
  }
  /* Scanning beam */
  .fx-beam {
    position: absolute; width: 1px; height: 100%; top: 0;
    z-index: 3; opacity: 0;
    animation: fx-beam-move 5s ease-in-out infinite;
  }
  @keyframes fx-beam-move {
    0% { left: 15%; opacity: 0; }
    5% { opacity: 0.6; }
    95% { opacity: 0.6; }
    100% { left: 85%; opacity: 0; }
  }
  /* Sparkle particles */
  .fx-sparkle {
    position: absolute; width: 2px; height: 2px; border-radius: 50%;
    background: white; z-index: 4; pointer-events: none;
  }
  @keyframes fx-sparkle-anim {
    0%, 100% { opacity: 0; transform: scale(0); }
    50% { opacity: 0.8; transform: scale(1.5); }
  }
  /* Effect indicator strip */
  .fx-indicators {
    display: flex; gap: 3px; position: absolute; bottom: 24px; z-index: 5;
  }
  .fx-ind {
    width: 28px; height: 3px; border-radius: 2px; background: var(--border-strong);
    transition: all 0.4s; cursor: pointer;
  }
  .fx-ind.active { background: var(--text-primary); width: 40px; }
  /* Info section */
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
  .chips { display: flex; flex-wrap: wrap; gap: 10px; }
  .chip { font-family: var(--mono); font-size: 12px; padding: 10px 20px; background: var(--bg-elevated); border: 1px solid var(--border-subtle); border-radius: 8px; color: var(--text-secondary); cursor: pointer; transition: all 0.25s; position: relative; }
  .chip:hover { border-color: var(--border-strong); color: var(--text-primary); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.3); }
  .chip.pro { border-color: rgba(245,166,35,0.2); color: var(--brand-default); background: rgba(245,166,35,0.04); }
  .chip.pro:hover { border-color: rgba(245,166,35,0.5); box-shadow: 0 8px 24px rgba(245,166,35,0.1); }
  .chip.pro::after { content: 'PRO'; font-size: 8px; letter-spacing: 0.1em; background: var(--brand-default); color: var(--text-inverse); padding: 2px 6px; border-radius: 3px; margin-left: 8px; font-weight: 700; vertical-align: middle; }

  /* ── Testimonials ─────────────────────────────────── */
  .tgrid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; background: var(--border-subtle); }
  .tc { background: var(--bg-subtle); padding: 40px 36px; }
  .ttext { font-family: var(--serif); font-size: 18px; line-height: 1.6; color: var(--text-primary); font-weight: 300; margin-bottom: 28px; }
  .tauthor { display: flex; align-items: baseline; gap: 8px; }
  .tname { font-family: var(--mono); font-size: 12px; color: var(--text-primary); font-weight: 500; }
  .trole { font-family: var(--mono); font-size: 10px; color: var(--text-muted); }
  .tauthor .tsep { color: var(--text-muted); font-size: 10px; }

  /* ── Pricing ─────────────────────────────────── */
  .pgrid-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 2px; background: var(--border-subtle); overflow: hidden; }
  .pcard2 { background: var(--bg-subtle); padding: 56px 48px; position: relative; }
  .pcard2.ft { background: var(--bg-elevated); overflow: hidden; }
  .pcard2.ft::before {
    content: ''; position: absolute; top: -1px; left: -1px; right: -1px; bottom: -1px;
    background: conic-gradient(from var(--pro-angle, 0deg), transparent 60%, var(--brand-default) 78%, transparent 95%);
    animation: pro-spin 4s linear infinite; z-index: 0; border-radius: inherit;
  }
  .pcard2.ft::after {
    content: ''; position: absolute; top: 1px; left: 1px; right: 1px; bottom: 1px;
    background: var(--bg-elevated); z-index: 0; border-radius: inherit;
  }
  .pcard2.ft > * { position: relative; z-index: 1; }
  @keyframes pro-spin { to { --pro-angle: 360deg; } }
  @property --pro-angle { syntax: '<angle>'; inherits: false; initial-value: 0deg; }
  .ptier { font-family: var(--mono); font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--text-muted); margin-bottom: 32px; }
  .pamt { font-family: var(--serif); font-size: 72px; line-height: 1; margin-bottom: 8px; letter-spacing: -0.03em; }
  .pamt sup { font-size: 24px; vertical-align: super; color: var(--text-muted); }
  .pamt sub { font-family: var(--mono); font-size: 14px; color: var(--text-muted); vertical-align: baseline; }
  .pdesc { font-size: 14px; color: var(--text-muted); line-height: 1.6; margin-bottom: 40px; padding-bottom: 40px; border-bottom: 1px solid var(--border-subtle); }
  .pfeats { list-style: none; margin-bottom: 48px; }
  .pfeats li { font-family: var(--mono); font-size: 13px; color: var(--text-secondary); padding: 10px 0; border-bottom: 1px solid var(--border-subtle); display: flex; align-items: center; gap: 12px; }
  .pfeats li:last-child { border-bottom: none; }
  .pfeats li::before { content: '\\2014'; color: var(--brand-default); font-size: 12px; flex-shrink: 0; }
  .pcta { width: 100%; padding: 14px; font-family: var(--mono); font-size: 13px; font-weight: 500; letter-spacing: 0.06em; text-transform: uppercase; border-radius: 4px; cursor: pointer; transition: all 0.25s; border: none; }
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
  .flogo { font-family: var(--mono); font-size: 18px; color: var(--text-primary); }
  .flogo em { color: var(--brand-default); font-style: normal; }
  .flinks { display: flex; gap: 28px; list-style: none; }
  .flinks a { font-family: var(--mono); font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-muted); text-decoration: none; transition: color 0.2s; }
  .flinks a:hover { color: var(--text-primary); }
  .fcopy { font-family: var(--mono); font-size: 11px; color: var(--text-muted); }

  /* ── Responsive ─────────────────────────────────── */
  @media (max-width: 900px) {
    .hero { grid-template-columns: 1fr; } .hero-r { display: none; }
    .hero-l { padding: 120px 24px 80px; }
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
  }
`;

/* ================================================================
   COMPONENTS
   ================================================================ */

const Arrow = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M1 7h12M7 1l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);



/* ── Live Demo ─────────────────────── */
function LiveDemo() {
  const [color, setColor] = useState("#22D3EE");
  const [radius, setRadius] = useState(12);
  const [intensity, setIntensity] = useState(36);
  const [effect, setEffect] = useState("glow");
  const [hovered, setHovered] = useState(false);
  const swatches = ["#F5A623", "#7C3AED", "#22D3EE", "#10B981", "#F43F5E", "#F472B6", "#FFFFFF", "#9A9AA3"];

  const btnStyle = (): CSSProperties => {
    const s: CSSProperties = {
      padding: "14px 36px", borderRadius: `${radius}px`, border: "none",
      cursor: "pointer", fontFamily: "var(--sans)", fontWeight: 700, fontSize: "16px",
      transition: "all 0.3s ease",
    };
    if (effect === "glow") {
      s.background = color; s.color = "#0A0A0B";
      s.boxShadow = hovered
        ? `0 0 ${intensity * 2}px ${color}80, 0 0 ${intensity * 4}px ${color}30`
        : `0 0 ${intensity}px ${color}50`;
    } else if (effect === "shadow") {
      s.background = color; s.color = "#0A0A0B";
      s.boxShadow = `${intensity / 4}px ${intensity / 4}px ${intensity}px rgba(0,0,0,0.6)`;
    } else {
      s.background = "var(--bg-elevated)"; s.color = color;
      s.border = "1px solid rgba(255,255,255,0.06)";
      s.boxShadow = `${intensity / 4}px ${intensity / 4}px ${intensity}px rgba(0,0,0,0.5), -${intensity / 8}px -${intensity / 8}px ${intensity / 2}px rgba(255,255,255,0.03)`;
    }
    if (hovered) s.transform = "translateY(-2px) scale(1.02)";
    return s;
  };

  return (
    <div className="dlayout">
      <div className="dside">
        <div className="dside-h">Component Controls</div>
        <div className="dcg">
          <div className="dcl">Accent Color</div>
          <div className="sws">
            {swatches.map((c) => (
              <div key={c} className={`sw ${color === c ? "on" : ""}`} style={{ background: c }} onClick={() => setColor(c)} />
            ))}
          </div>
        </div>
        <div className="dcg">
          <div className="dcl">Border Radius — {radius}px</div>
          <input type="range" className="dslider" min="0" max="50" value={radius} onChange={(e) => setRadius(+e.target.value)} />
        </div>
        <div className="dcg">
          <div className="dcl">Intensity — {intensity}</div>
          <input type="range" className="dslider" min="0" max="60" value={intensity} onChange={(e) => setIntensity(+e.target.value)} />
        </div>
        <div className="dcg">
          <div className="dcl">Effect</div>
          {([["glow", "Glow"], ["shadow", "Drop Shadow"]] as const).map(([v, l]) => (
            <div key={v} className="eopt" style={{
              color: effect === v ? "var(--brand-default)" : "var(--text-muted)",
              borderLeft: `2px solid ${effect === v ? "var(--brand-default)" : "transparent"}`,
            }} onClick={() => setEffect(v)}>{l}</div>
          ))}
        </div>
      </div>
      <div className="dcanvas">
        <button style={btnStyle()} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>Get Started</button>
        <div className="clabel">Hover to preview interaction</div>
      </div>
    </div>
  );
}

/* ── Effects Showcase Card ─────────────────────── */
const EFFECTS: {
  name: string; desc: string; color: string;
  demoStyle: CSSProperties; ambient: string;
}[] = [
  {
    name: "Drop Shadow", color: "#F5A623",
    desc: "Multi-layer directional shadows with full x/y/blur/spread control",
    demoStyle: {
      background: "#F5A623", color: "#0A0A0B",
      boxShadow: "0 6px 12px rgba(245,166,35,0.3), 0 20px 40px rgba(245,166,35,0.2), 8px 8px 0 rgba(245,166,35,0.15)",
      border: "none",
    },
    ambient: "rgba(245,166,35,0.35)",
  },
  {
    name: "Neon Glow", color: "#22D3EE",
    desc: "Ambient colour glow with intensity, colour and spread control",
    demoStyle: {
      background: "#22D3EE", color: "#0A0A0B",
      boxShadow: "0 0 15px rgba(34,211,238,0.8), 0 0 45px rgba(34,211,238,0.4), 0 0 90px rgba(34,211,238,0.15)",
      border: "none",
    },
    ambient: "rgba(34,211,238,0.5)",
  },
  {
    name: "Gradient", color: "#818CF8",
    desc: "Linear, radial, conic and mesh gradient editor",
    demoStyle: {
      background: "linear-gradient(135deg, #818CF8, #F472B6, #FB923C)",
      color: "#fff",
      boxShadow: "0 8px 32px rgba(129,140,248,0.3), 0 4px 12px rgba(244,114,182,0.2)",
      border: "none",
    },
    ambient: "rgba(129,140,248,0.4)",
  },
  {
    name: "Spotlight", color: "#F0EDE8",
    desc: "Directional light source simulated on components",
    demoStyle: {
      background: "radial-gradient(ellipse at 25% 25%, rgba(255,255,255,0.2) 0%, transparent 50%), var(--bg-elevated)",
      color: "var(--text-primary)",
      boxShadow: "0 2px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)",
      border: "1px solid rgba(255,255,255,0.1)",
    },
    ambient: "rgba(240,237,232,0.15)",
  },
  {
    name: "Animated Border", color: "#10B981",
    desc: "CSS-powered rotating, pulsing and drawing borders",
    demoStyle: {
      background: "var(--bg-elevated)", color: "#10B981",
      boxShadow: "0 0 0 2px #10B981, 0 0 20px rgba(16,185,129,0.25)",
      border: "none",
      animation: "fx-border-pulse 2s ease-in-out infinite",
    },
    ambient: "rgba(16,185,129,0.3)",
  },
  {
    name: "Inner Shadow", color: "#FB923C",
    desc: "Inset shadow effects for pressed or embossed component states",
    demoStyle: {
      background: "var(--bg-surface)", color: "var(--text-secondary)",
      boxShadow: "inset 4px 4px 16px rgba(0,0,0,0.6), inset -3px -3px 10px rgba(251,146,60,0.08), 0 1px 0 rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.04)",
    },
    ambient: "rgba(251,146,60,0.2)",
  },
  {
    name: "Stroke", color: "#F43F5E",
    desc: "Borders with gradient and animated sweep variants",
    demoStyle: {
      background: "transparent", color: "#F43F5E",
      boxShadow: "0 0 16px rgba(244,63,94,0.15)",
      border: "2px solid #F43F5E",
    },
    ambient: "rgba(244,63,94,0.25)",
  },
];

function EffectsShowcaseCard() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [sparkles] = useState(() =>
    Array.from({ length: 16 }, () => ({
      top: `${10 + Math.random() * 80}%`,
      left: `${10 + Math.random() * 80}%`,
      delay: Math.random() * 5,
      duration: Math.random() * 2 + 3,
    }))
  );

  useEffect(() => {
    const t = setInterval(() => setActiveIdx((i) => (i + 1) % EFFECTS.length), 3500);
    return () => clearInterval(t);
  }, []);

  const fx = EFFECTS[activeIdx];

  return (
    <div
      className="fx-card"
      style={{
        borderColor: `${fx.color}25`,
        boxShadow: `0 0 60px ${fx.color}08, 0 24px 48px rgba(0,0,0,0.4)`,
      }}
    >
      <style>{`
        @keyframes fx-border-pulse {
          0%, 100% { box-shadow: 0 0 0 2px #10B981, 0 0 20px rgba(16,185,129,0.25); }
          50% { box-shadow: 0 0 0 3px #10B981, 0 0 30px rgba(16,185,129,0.4); }
        }
      `}</style>

      <div className="fx-card-stage">
        {/* Sparkles */}
        {sparkles.map((s, i) => (
          <div key={i} className="fx-sparkle" style={{
            top: s.top, left: s.left, opacity: 0,
            animation: `fx-sparkle-anim ${s.duration}s ${s.delay}s ease-in-out infinite`,
          }} />
        ))}

        {/* Scanning beam */}
        <div className="fx-beam" style={{
          background: `linear-gradient(to bottom, transparent, ${fx.color}90, transparent)`,
        }} />

        {/* Ambient glow */}
        <div className="fx-ambient" style={{ background: fx.ambient }} />

        {/* Demo element */}
        <div className="fx-demo" style={fx.demoStyle}>
          Get Started
        </div>

        {/* Indicator strip */}
        <div className="fx-indicators">
          {EFFECTS.map((_, i) => (
            <div
              key={i}
              className={`fx-ind ${i === activeIdx ? "active" : ""}`}
              style={i === activeIdx ? { background: fx.color } : undefined}
              onClick={() => setActiveIdx(i)}
            />
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="fx-card-info">
        <div>
          <div className="fx-card-info-name" style={{ color: fx.color }}>{fx.name}</div>
          <div className="fx-card-info-desc">{fx.desc}</div>
        </div>
        <div className="fx-card-count">{activeIdx + 1}/{EFFECTS.length}</div>
      </div>
    </div>
  );
}

/* ── Bento media helper (video) ─────────────────────── */
function BentoMedia({ src, title, gradient, aspect = "16/9" }: {
  src: string; alt?: string; title: string; gradient: string; aspect?: string;
}) {
  return (
    <div className="bc-media">
      <div className="bc-media-inner" style={{ aspectRatio: aspect, background: gradient }}>
        <video
          src={src}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      </div>
      <div className="bc-media-bar">
        <div className="bc-media-dot" style={{ background: "#FF5F57" }} />
        <div className="bc-media-dot" style={{ background: "#FEBC2E" }} />
        <div className="bc-media-dot" style={{ background: "#28C840" }} />
        <span className="bc-media-title">{title}</span>
      </div>
    </div>
  );
}

/* ================================================================
   MAIN PAGE
   ================================================================ */
export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  const components: [string, boolean][] = [
    ["Accordion", false], ["Alert", false], ["Avatar", false], ["Avatar Group", true],
    ["Animated Text", true], ["Badge", false], ["Button", false], ["Card", true],
    ["Checkbox", false], ["Datatable", true], ["Dialog", false], ["Drawer", false],
    ["Dropdown", false], ["Input", false], ["Label", false], ["Navigation Menu", true],
    ["Popover", false], ["Progress", false], ["Slider", false], ["Switch", false],
    ["Tabs", false], ["Tooltip", false],
  ];

  const testimonials = [
    { t: "J6 replaced my entire Figma-to-code workflow. Design, tweak the motion curve, export. Done.", n: "Alex R.", r: "Senior Frontend Engineer" },
    { t: "The token system is genuinely the best I've used. Everything derives from primitives properly.", n: "Priya M.", r: "Design Systems Lead" },
    { t: "I shipped an entire client design system in two days. The neumorphism controls alone saved hours.", n: "Tom C.", r: "Freelance Developer" },
    { t: "Finally a tool that doesn't assume I want purple gradients and Inter everywhere.", n: "Dana K.", r: "Creative Director" },
    { t: "The animation controls are deep but not overwhelming. I've tried everything. This is the one.", n: "Seb L.", r: "Product Designer" },
    { t: "Export to Tailwind is flawless. Copy, paste, it just works.", n: "Juno W.", r: "Full-Stack Developer" },
  ];

  const strip = [
    "Drop Shadow", "Inner Shadow", "Glow Effects", "Spotlight",
    "Animated Borders", "Gradient Mesh", "Token System", "Tailwind Export", "CSS Export",
    "React Motion", "Entry & Exit", "Hover States", "Tap Interactions", "Typography Control", "Free to Start",
  ];

  return (
    <>
      <style>{CSS}</style>

      {/* ── Nav ─────────────────────────────────── */}
      <nav className={`nav ${scrolled ? "s" : ""}`}>
        <div className="nav-logo">J<em>6</em></div>
        <ul className="nav-links">
          <li><a href="#how">How it works</a></li>
          <li><a href="#components">Components</a></li>
          <li><a href="#effects">Effects</a></li>
          <li><a href="#pricing">Pricing</a></li>
        </ul>
        <button className="nav-cta">Start Free</button>
      </nav>

      {/* ── Hero ─────────────────────────────────── */}
      <section className="hero">
        <div className="hero-l">
          <div className="eyebrow">Visual component design</div>
          <h1 className="hero-title">
            Design<br /><em>React</em><br />components.<br />Without guessing.
          </h1>
          <p className="hero-desc">
            J6 is a browser-based designer for React components. Build with interaction motions,
            deep effect controls, a full token system — then export clean CSS or Tailwind.
          </p>
          <div className="hero-actions">
            <button className="bp">Start for free <Arrow /></button>
            <button className="bs">Watch demo</button>
          </div>
        </div>

        {/* Hero right — product video */}
        <div className="hero-r">
          <div className="hcanvas">
            <div className="hero-video-glow" />
            <div className="hero-video-wrap">
              <video
                src="/edit-component.mp4"
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Marquee ─────────────────────────────────── */}
      <div className="strip">
        <div className="strip-i">
          {[...strip, ...strip].map((item, i) => <span key={i} className="sitem">{item}</span>)}
        </div>
      </div>

      {/* ── Bento Features ─────────────────────────────────── */}
      <section className="sec" id="how">
        <div className="wrap">
          <div className="bento-hdr">
            <div className="ol" style={{ justifyContent: "center" }}>Features</div>
            <h2 className="h2">Everything you need.<br /><em>Nothing you don't.</em></h2>
            <p className="lead">From live preview to production export — J6 covers the entire component design workflow in one focused tool.</p>
          </div>
          <div className="bento-grid">
            <div className="bento-card c-a">
              <div className="bc-label">01</div>
              <div className="bc-title">Live Visual Editor & Preview</div>
              <div className="bc-desc">Design components in real-time on a configurable stage. Set your background to match your app, toggle grids, and see every change instantly.</div>
              <BentoMedia
                src="/edit-component.mp4" alt="Live editor preview" title="j6.app — Component Studio"
                gradient="linear-gradient(135deg, var(--bg-elevated) 0%, var(--bg-subtle) 60%, rgba(245,166,35,0.06) 100%)"
                aspect="16/9"
              />
            </div>
            <div className="bento-card c-b">
              <div className="bc-label">02</div>
              <div className="bc-title">Premium Motion & Effects</div>
              <div className="bc-desc">Border beam, neon glow, tilt 3D, glare, spotlight — effects that take hours to hand-code, applied in one click.</div>
              <BentoMedia
                src="/motion-control.mp4" alt="Motion controls" title="Effects Panel"
                gradient="linear-gradient(160deg, var(--bg-subtle) 0%, var(--bg-elevated) 50%, rgba(124,58,237,0.08) 100%)"
                aspect="4/5"
              />
            </div>
            <div className="bento-card c-c">
              <div className="bc-label">03</div>
              <div className="bc-title">Multi-Format Code Export</div>
              <div className="bc-desc">Export as inline CSS, Tailwind utilities, or clean React with named props. Every animation keyframe and CSS variable is included.</div>
              <BentoMedia
                src="/export.mp4" alt="Code export" title="Export Panel"
                gradient="linear-gradient(135deg, var(--bg-base) 0%, var(--bg-subtle) 100%)"
                aspect="4/3"
              />
            </div>
            <div className="bento-card c-d">
              <div className="bc-label">04</div>
              <div className="bc-title">Design Token System</div>
              <div className="bc-desc">Create colour palettes, apply them across 22+ components, and keep your design consistent. Tokens persist per-project and appear in every colour picker.</div>
              <BentoMedia
                src="/token-system.mp4" alt="Token system" title="Token Studio"
                gradient="linear-gradient(135deg, var(--bg-subtle) 0%, rgba(245,166,35,0.04) 100%)"
                aspect="4/3"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Interactive Demo ─────────────────────────────────── */}
      <section className="sec-sm demo-bg">
        <div className="wrap">
          <div className="ol" style={{ marginBottom: "40px" }}>Interactive Demo</div>
          <LiveDemo />
        </div>
      </section>

      {/* ── Visual Effects ─────────────────────────────────── */}
      <section className="sec" id="effects">
        <div className="wrap">
          <div className="fx-layout">
            <div>
              <div className="ol">Visual Effects</div>
              <h2 className="h2">Seven ways to<br />make it <em>yours.</em></h2>
              <p className="lead">Every effect has full numeric control. Not a preset — a proper design tool.</p>
            </div>
            <EffectsShowcaseCard />
          </div>
        </div>
      </section>

      {/* ── Components ─────────────────────────────────── */}
      <section className="sec comp-bg" id="components">
        <div className="wrap">
          <div className="comp-hdr">
            <div>
              <div className="ol">Library</div>
              <h2 className="h2">Every component<br />you <em>need.</em></h2>
            </div>
            <p style={{ fontSize: "14px", color: "var(--text-muted)", maxWidth: "260px", fontFamily: "var(--mono)", lineHeight: "1.7" }}>
              Free plan includes all standard components. Pro unlocks the advanced ones.
            </p>
          </div>
          <div className="chips">
            {components.map(([name, isPro]) => <div key={name} className={`chip ${isPro ? "pro" : ""}`}>{name}</div>)}
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────── */}
      <section className="sec">
        <div className="wrap">
          <div className="ol" style={{ marginBottom: "48px" }}>Used by builders</div>
          <div className="tgrid">
            {testimonials.map((t, i) => (
              <div key={i} className="tc">
                <div className="ttext">"{t.t}"</div>
                <div className="tauthor">
                  <div className="tname">{t.n}</div>
                  <span className="tsep">/</span>
                  <div className="trole">{t.r}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ─────────────────────────────────── */}
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

      {/* ── Final CTA ─────────────────────────────────── */}
      <section className="final">
        <div className="wrap">
          <h2 className="ftitle">Stop guessing.<br /><em>Start building.</em></h2>
          <p className="fdesc">Free forever for standard components. Pro for when you need everything.</p>
          <div className="faction">
            <button className="bp" style={{ fontSize: "15px", padding: "16px 40px" }}>Open J6 — it's free <Arrow /></button>
            <button className="bs" style={{ fontSize: "15px", padding: "16px 40px" }}>View on GitHub</button>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────── */}
      <footer className="footer">
        <div className="flogo">J<em>6</em></div>
        <ul className="flinks">
          <li><a href="#">Docs</a></li><li><a href="#">Components</a></li>
          <li><a href="#">GitHub</a></li><li><a href="#">Privacy</a></li><li><a href="#">Terms</a></li>
        </ul>
        <div className="fcopy">&copy; 2026 J6. All rights reserved.</div>
      </footer>
    </>
  );
}
