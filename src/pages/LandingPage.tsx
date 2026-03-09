import { useState, useEffect, useRef, type CSSProperties } from "react";

/* ================================================================
   J6 TOKENS + PAGE STYLES
   Embeds the full token system from j6-tokens.css and page layout
   ================================================================ */
const CSS = `
  @import url('https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@400,500,700,800,900&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  /* ── Token System ─────────────────────────────────── */
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
    /* Showcase palette */
    --showcase-electric: #22D3EE; --showcase-bloom: #F472B6; --showcase-acid: #A3E635;
    --showcase-plasma: #818CF8; --showcase-inferno: #FB923C; --showcase-crimson: #F43F5E;
    --showcase-spearmint: #10B981; --showcase-solar: #FACC15;
    /* Fonts */
    --serif: 'Cabinet Grotesk', system-ui, sans-serif;
    --mono: 'Space Mono', 'Courier New', monospace;
    --sans: 'Space Grotesk', system-ui, sans-serif;
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
  .stats { display: flex; gap: 40px; margin-top: 64px; }
  .stat-n { font-family: var(--serif); font-size: 32px; line-height: 1; margin-bottom: 4px; font-weight: 800; }
  .stat-l { font-family: var(--mono); font-size: 10px; color: var(--text-muted); letter-spacing: 0.12em; text-transform: uppercase; }
  .hero-r { position: relative; overflow: hidden; border-left: 1px solid var(--border-subtle); }
  .hcanvas { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: var(--bg-subtle); }
  .grid-bg { position: absolute; inset: 0; background-image: linear-gradient(var(--border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px); background-size: 48px 48px; opacity: 0.6; }

  /* ── Hero showcase components ─────────────────────────────────── */
  .hero-showcase { display: flex; gap: 12px; margin-top: 32px; flex-wrap: wrap; align-items: center; }

  /* Dropdown */
  .j6-dropdown { position: relative; }
  .j6-dropdown-trigger {
    font-family: var(--mono); font-size: 12px; font-weight: 500; letter-spacing: 0.06em;
    padding: 10px 20px; border-radius: 6px; cursor: pointer; transition: all 0.22s ease;
    display: flex; align-items: center; gap: 8px;
    background: var(--showcase-spearmint); color: var(--text-inverse);
    border: 1.5px solid rgba(52,211,153,0.4);
  }
  .j6-dropdown-trigger:hover { transform: translateY(-2px); box-shadow: 0 6px 24px rgba(16,185,129,0.3); }
  .j6-dropdown-trigger svg { transition: transform 0.2s; }
  .j6-dropdown-trigger.open svg { transform: rotate(180deg); }
  .j6-dropdown-menu {
    position: absolute; top: calc(100% + 8px); left: 0; z-index: 20; min-width: 220px;
    background: rgba(4,120,87,0.95); border: 1px solid rgba(16,185,129,0.65);
    border-radius: 8px; padding: 6px; opacity: 0; transform: translateY(8px);
    transition: all 0.2s ease; pointer-events: none;
    backdrop-filter: blur(16px);
  }
  .j6-dropdown-menu.open { opacity: 1; transform: translateY(0); pointer-events: auto; }
  .j6-dropdown-item {
    display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 6px;
    font-family: var(--sans); font-size: 13px; color: rgba(248,250,252,0.9);
    cursor: pointer; transition: all 0.15s; text-decoration: none;
  }
  .j6-dropdown-item:hover { background: rgba(226,232,240,1); color: #0f172a; }
  .j6-dropdown-item span.icon { font-size: 15px; width: 20px; text-align: center; }
  .j6-dropdown-sep { height: 1px; background: rgba(255,255,255,0.12); margin: 4px 6px; }

  /* Popover */
  .j6-popover { position: relative; }
  .j6-popover-trigger {
    font-family: var(--mono); font-size: 12px; font-weight: 500; letter-spacing: 0.06em;
    padding: 10px 20px; border-radius: 6px; cursor: pointer; transition: all 0.22s ease;
    display: flex; align-items: center; gap: 8px;
    background: var(--interactive-default); color: #fff;
    border: none; position: relative; overflow: hidden;
  }
  .j6-popover-trigger::before {
    content: ''; position: absolute; inset: -1px; border-radius: 7px;
    background: conic-gradient(from 0deg, transparent 60%, var(--showcase-plasma) 80%, transparent 100%);
    animation: shine-spin 4s linear infinite; z-index: -1;
  }
  .j6-popover-trigger::after {
    content: ''; position: absolute; inset: 1px; border-radius: 5px;
    background: var(--interactive-default); z-index: -1;
  }
  @keyframes shine-spin { to { transform: rotate(360deg); } }
  .j6-popover-trigger:hover { transform: translateY(-2px); box-shadow: 0 6px 24px rgba(124,58,237,0.35); }
  .j6-popover-content {
    position: absolute; top: calc(100% + 10px); left: 50%; transform: translateX(-50%) translateY(8px);
    z-index: 20; width: 320px; padding: 20px;
    background: rgba(91,33,182,0.95); border: 1px solid var(--showcase-plasma);
    border-radius: 10px; opacity: 0; pointer-events: none;
    transition: all 0.25s ease; backdrop-filter: blur(16px);
  }
  .j6-popover-content.open { opacity: 1; transform: translateX(-50%) translateY(0); pointer-events: auto; }
  .j6-popover-content h4 { font-family: var(--serif); font-size: 16px; font-weight: 700; color: #fff; margin-bottom: 8px; }
  .j6-popover-content p { font-size: 13px; color: rgba(255,255,255,0.8); line-height: 1.6; margin-bottom: 12px; }
  .j6-popover-feat { display: flex; align-items: center; gap: 8px; padding: 6px 0; font-size: 12px; color: rgba(255,255,255,0.7); font-family: var(--mono); }
  .j6-popover-feat .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--showcase-plasma); flex-shrink: 0; }

  /* Mini Switch */
  .j6-switch { display: flex; align-items: center; gap: 8px; cursor: pointer; }
  .j6-switch-track {
    width: 40px; height: 22px; border-radius: 11px; position: relative; transition: background 0.25s;
    background: var(--bg-elevated); border: 1px solid var(--border-strong);
  }
  .j6-switch-track.on { background: var(--showcase-electric); border-color: rgba(34,211,238,0.5); }
  .j6-switch-thumb {
    width: 16px; height: 16px; border-radius: 50%; background: var(--text-primary);
    position: absolute; top: 2px; left: 2px; transition: all 0.25s cubic-bezier(0.34,1.56,0.64,1);
  }
  .j6-switch-track.on .j6-switch-thumb { left: 20px; background: var(--text-inverse); }
  .j6-switch-label { font-family: var(--mono); font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-muted); }

  /* Mini Badge */
  .j6-badge {
    font-family: var(--mono); font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase;
    padding: 5px 12px; border-radius: 100px; display: inline-flex; align-items: center; gap: 6px;
  }
  .j6-badge .pulse { width: 6px; height: 6px; border-radius: 50%; animation: badge-pulse 2s ease-in-out infinite; }
  @keyframes badge-pulse { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(0.7); } }

  /* Mini Tooltip */
  .j6-tooltip-wrap { position: relative; display: inline-flex; }
  .j6-tooltip-trigger {
    font-family: var(--mono); font-size: 11px; padding: 6px 14px; border-radius: 4px;
    cursor: pointer; transition: all 0.2s;
    background: var(--bg-elevated); border: 1px solid var(--border-strong); color: var(--text-secondary);
  }
  .j6-tooltip-trigger:hover { color: var(--text-primary); border-color: var(--showcase-inferno); }
  .j6-tooltip-bubble {
    position: absolute; bottom: calc(100% + 8px); left: 50%; transform: translateX(-50%) translateY(4px);
    padding: 8px 14px; border-radius: 6px; white-space: nowrap;
    background: var(--showcase-inferno); color: var(--text-inverse);
    font-family: var(--mono); font-size: 11px; font-weight: 500;
    opacity: 0; pointer-events: none; transition: all 0.2s;
  }
  .j6-tooltip-bubble.show { opacity: 1; transform: translateX(-50%) translateY(0); }
  .j6-tooltip-bubble::after {
    content: ''; position: absolute; top: 100%; left: 50%; transform: translateX(-50%);
    border: 5px solid transparent; border-top-color: var(--showcase-inferno);
  }

  /* Mini Progress */
  .j6-progress { display: flex; align-items: center; gap: 10px; }
  .j6-progress-track { width: 80px; height: 4px; border-radius: 2px; background: var(--bg-elevated); overflow: hidden; }
  .j6-progress-fill { height: 100%; border-radius: 2px; transition: width 1s ease; }
  .j6-progress-label { font-family: var(--mono); font-size: 10px; color: var(--text-muted); letter-spacing: 0.08em; }

  /* ── Preview Card (hero right) ─────────────────────────────────── */
  .pcard { position: relative; z-index: 2; width: 320px; background: var(--bg-elevated); border: 1px solid var(--border-strong); border-radius: 12px; overflow: hidden; box-shadow: 0 32px 80px rgba(0,0,0,0.6); }
  .pcard-hdr { display: flex; align-items: center; gap: 6px; padding: 12px 16px; border-bottom: 1px solid var(--border-subtle); background: var(--bg-surface); }
  .dot { width: 8px; height: 8px; border-radius: 50%; }
  .pcard-lbl { font-family: var(--mono); font-size: 10px; color: var(--text-muted); margin-left: auto; }
  .pcard-body { padding: 24px; }
  .pbtn { width: 100%; padding: 12px; border: none; cursor: pointer; font-family: var(--sans); font-size: 14px; font-weight: 600; margin-bottom: 16px; }
  .pgrid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .pctrl { background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: 6px; padding: 8px 10px; }
  .pctrl-l { font-family: var(--mono); font-size: 9px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 4px; }
  .pctrl-v { font-family: var(--mono); font-size: 11px; font-weight: 500; }
  .ftag { position: absolute; font-family: var(--mono); font-size: 10px; letter-spacing: 0.06em; padding: 6px 12px; background: var(--bg-base); border: 1px solid var(--border-strong); border-radius: 20px; color: var(--text-muted); white-space: nowrap; animation: fl 4s ease-in-out infinite; }
  @keyframes fl { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }

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
  .bc-media-inner img { width: 100%; display: block; }
  .bc-media-bar { display: flex; align-items: center; gap: 6px; padding: 10px 14px; background: var(--bg-surface); border: 1px solid var(--border-strong); border-top: 1px solid var(--border-subtle); }
  .bc-media-dot { width: 7px; height: 7px; border-radius: 50%; }
  .bc-media-title { font-family: var(--mono); font-size: 10px; color: var(--text-muted); margin-left: 8px; letter-spacing: 0.06em; }

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
  .dcanvas { display: flex; align-items: center; justify-content: center; padding: 48px; position: relative; background-image: linear-gradient(var(--border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px); background-size: 32px 32px; }
  .clabel { position: absolute; bottom: 20px; right: 20px; font-family: var(--mono); font-size: 10px; color: var(--text-muted); }

  /* ── Effects Section ─────────────────────────────────── */
  .fx-layout { display: grid; grid-template-columns: 340px 1fr; gap: 80px; align-items: start; }

  /* Effects showcase card */
  .fx-showcase { position: relative; aspect-ratio: 4/3; border-radius: 16px; overflow: hidden; display: flex; flex-direction: column; }
  .fx-card-inner {
    flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
    background: var(--bg-subtle); padding: 40px; position: relative; transition: all 0.6s ease;
  }
  .fx-card-demo {
    width: 140px; height: 56px; border-radius: 8px; display: flex; align-items: center; justify-content: center;
    font-family: var(--sans); font-size: 14px; font-weight: 600; transition: all 0.6s ease;
    margin-bottom: 24px;
  }
  .fx-card-name {
    font-family: var(--mono); font-size: 12px; letter-spacing: 0.14em; text-transform: uppercase;
    color: var(--brand-default); margin-bottom: 8px; transition: all 0.3s;
  }
  .fx-card-desc {
    font-size: 13px; color: var(--text-secondary); text-align: center; max-width: 280px; line-height: 1.6;
  }
  .fx-card-dots { display: flex; gap: 6px; position: absolute; bottom: 20px; }
  .fx-card-dot {
    width: 6px; height: 6px; border-radius: 50%; background: var(--border-strong);
    transition: all 0.3s; cursor: pointer;
  }
  .fx-card-dot.active { background: var(--brand-default); transform: scale(1.4); }

  /* ── Components Section ─────────────────────────────────── */
  .comp-bg { background: var(--bg-subtle); border-top: 1px solid var(--border-subtle); border-bottom: 1px solid var(--border-subtle); }
  .comp-hdr { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 56px; }
  .chips { display: flex; flex-wrap: wrap; gap: 10px; }
  .chip { font-family: var(--mono); font-size: 12px; padding: 9px 18px; background: var(--bg-elevated); border: 1px solid var(--border-subtle); border-radius: 100px; color: var(--text-secondary); cursor: pointer; transition: all 0.2s; }
  .chip:hover { border-color: var(--brand-default); color: var(--text-primary); }
  .chip.pro { border-color: rgba(245,166,35,0.3); color: var(--brand-default); }
  .chip.pro::after { content: 'PRO'; font-size: 8px; letter-spacing: 0.1em; background: var(--brand-default); color: var(--text-inverse); padding: 1px 5px; border-radius: 2px; margin-left: 8px; font-weight: 700; vertical-align: middle; }

  /* ── Testimonials ─────────────────────────────────── */
  .tgrid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; background: var(--border-subtle); }
  .tc { background: var(--bg-subtle); padding: 40px 36px; }
  .ttext { font-family: var(--serif); font-size: 18px; line-height: 1.6; color: var(--text-primary); font-weight: 300; margin-bottom: 28px; }
  .tauthor { display: flex; align-items: center; gap: 12px; }
  .tav { width: 36px; height: 36px; border-radius: 50%; background: var(--bg-elevated); border: 1px solid var(--border-strong); display: flex; align-items: center; justify-content: center; font-family: var(--mono); font-size: 12px; color: var(--brand-default); flex-shrink: 0; }
  .tname { font-family: var(--mono); font-size: 12px; color: var(--text-primary); font-weight: 500; }
  .trole { font-family: var(--mono); font-size: 10px; color: var(--text-muted); margin-top: 2px; }

  /* ── Pricing ─────────────────────────────────── */
  .pgrid-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 2px; background: var(--border-subtle); overflow: hidden; }
  .pcard2 { background: var(--bg-subtle); padding: 56px 48px; position: relative; }
  .pcard2.ft { background: var(--bg-elevated); }
  .pcard2.ft::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: var(--brand-default); }
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
    .stats { gap: 24px; } .hero-showcase { flex-direction: column; align-items: flex-start; }
    .j6-popover-content { left: 0; transform: translateX(0) translateY(8px); }
    .j6-popover-content.open { transform: translateX(0) translateY(0); }
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

const ChevronDown = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ── Hero Dropdown ─────────────────────── */
function HeroDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const sections = [
    { icon: "◈", label: "How It Works", href: "#how" },
    { icon: "▣", label: "Visual Effects", href: "#effects" },
    { icon: "◉", label: "Components", href: "#components" },
    { icon: "✦", label: "Pricing", href: "#pricing" },
  ];

  return (
    <div className="j6-dropdown" ref={ref}>
      <button
        className={`j6-dropdown-trigger ${open ? "open" : ""}`}
        onClick={() => setOpen(!open)}
      >
        Explore <ChevronDown />
      </button>
      <div className={`j6-dropdown-menu ${open ? "open" : ""}`}>
        {sections.map((s) => (
          <a
            key={s.href}
            className="j6-dropdown-item"
            href={s.href}
            onClick={() => setOpen(false)}
          >
            <span className="icon">{s.icon}</span>
            {s.label}
          </a>
        ))}
        <div className="j6-dropdown-sep" />
        <a className="j6-dropdown-item" href="#" onClick={() => setOpen(false)}>
          <span className="icon">↗</span>
          Open Studio
        </a>
      </div>
    </div>
  );
}

/* ── Hero Popover ─────────────────────── */
function HeroPopover() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div className="j6-popover" ref={ref}>
      <button
        className="j6-popover-trigger"
        onClick={() => setOpen(!open)}
      >
        Visual Effects
      </button>
      <div className={`j6-popover-content ${open ? "open" : ""}`}>
        <h4>8 Effect Types. Full Control.</h4>
        <p>
          Every effect ships with numeric controls for intensity, colour, speed, and spread.
          Not presets — proper design tools.
        </p>
        {[
          "Drop shadow with multi-layer x/y/blur/spread",
          "Neon glow with colour and intensity control",
          "Animated border beam with rotation speed",
          "Neumorphism with dual highlight/shadow layers",
          "Spotlight with directional light simulation",
        ].map((f) => (
          <div className="j6-popover-feat" key={f}>
            <div className="dot" />
            {f}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Mini Switch ─────────────────────── */
function MiniSwitch() {
  const [on, setOn] = useState(true);
  return (
    <div className="j6-switch" onClick={() => setOn(!on)}>
      <div className={`j6-switch-track ${on ? "on" : ""}`}>
        <div className="j6-switch-thumb" />
      </div>
      <span className="j6-switch-label">{on ? "Motion" : "Static"}</span>
    </div>
  );
}

/* ── Mini Tooltip ─────────────────────── */
function MiniTooltip() {
  const [show, setShow] = useState(false);
  return (
    <div className="j6-tooltip-wrap">
      <button
        className="j6-tooltip-trigger"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
        ⌘K
      </button>
      <div className={`j6-tooltip-bubble ${show ? "show" : ""}`}>
        Command palette
      </div>
    </div>
  );
}

/* ── Animated Progress ─────────────────────── */
function MiniProgress() {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setVal((v) => (v >= 100 ? 0 : v + 1)), 60);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="j6-progress">
      <div className="j6-progress-track">
        <div
          className="j6-progress-fill"
          style={{
            width: `${val}%`,
            background: `var(--showcase-bloom)`,
          }}
        />
      </div>
      <span className="j6-progress-label">{val}%</span>
    </div>
  );
}

/* ── Live Demo ─────────────────────── */
function LiveDemo() {
  const [color, setColor] = useState("#F5A623");
  const [radius, setRadius] = useState(8);
  const [intensity, setIntensity] = useState(24);
  const [effect, setEffect] = useState("glow");
  const [hovered, setHovered] = useState(false);
  const swatches = ["#F5A623", "#7C3AED", "#22D3EE", "#10B981", "#F43F5E", "#F472B6", "#FFFFFF", "#9A9AA3"];

  const btnStyle = (): CSSProperties => {
    const s: CSSProperties = {
      padding: "14px 36px",
      borderRadius: `${radius}px`,
      border: "none",
      cursor: "pointer",
      fontFamily: "var(--sans)",
      fontWeight: 700,
      fontSize: "16px",
      transition: "all 0.3s ease",
    };
    if (effect === "glow") {
      s.background = color;
      s.color = "#0A0A0B";
      s.boxShadow = hovered
        ? `0 0 ${intensity * 2}px ${color}80, 0 0 ${intensity * 4}px ${color}30`
        : `0 0 ${intensity}px ${color}50`;
    } else if (effect === "shadow") {
      s.background = color;
      s.color = "#0A0A0B";
      s.boxShadow = `${intensity / 4}px ${intensity / 4}px ${intensity}px rgba(0,0,0,0.6)`;
    } else {
      s.background = "var(--bg-elevated)";
      s.color = color;
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
              <div
                key={c}
                className={`sw ${color === c ? "on" : ""}`}
                style={{ background: c }}
                onClick={() => setColor(c)}
              />
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
          {([["glow", "Glow"], ["shadow", "Drop Shadow"], ["neu", "Neumorphism"]] as const).map(([v, l]) => (
            <div
              key={v}
              className="eopt"
              style={{
                color: effect === v ? "var(--brand-default)" : "var(--text-muted)",
                borderLeft: `2px solid ${effect === v ? "var(--brand-default)" : "transparent"}`,
              }}
              onClick={() => setEffect(v)}
            >
              {l}
            </div>
          ))}
        </div>
      </div>
      <div className="dcanvas">
        <button
          style={btnStyle()}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          Get Started
        </button>
        <div className="clabel">Hover to preview interaction</div>
      </div>
    </div>
  );
}

/* ── Effects Showcase Card ─────────────────────── */
function EffectsShowcaseCard() {
  const [activeIdx, setActiveIdx] = useState(0);

  const effects = [
    {
      name: "Drop Shadow",
      desc: "Multi-layer directional shadows with full x/y/blur/spread control",
      btnStyle: {
        background: "var(--brand-default)",
        color: "var(--text-inverse)",
        boxShadow: "8px 8px 32px rgba(245,166,35,0.4), 2px 2px 8px rgba(0,0,0,0.3)",
        border: "none",
      } as CSSProperties,
      cardBorder: "1px solid var(--border-strong)",
      cardShadow: "0 20px 60px rgba(0,0,0,0.5)",
    },
    {
      name: "Neon Glow",
      desc: "Ambient colour glow with intensity, colour and spread control",
      btnStyle: {
        background: "var(--showcase-electric)",
        color: "var(--text-inverse)",
        boxShadow: "0 0 20px rgba(34,211,238,0.6), 0 0 60px rgba(34,211,238,0.2)",
        border: "none",
      } as CSSProperties,
      cardBorder: "1px solid rgba(34,211,238,0.3)",
      cardShadow: "0 0 40px rgba(34,211,238,0.15)",
    },
    {
      name: "Neumorphism",
      desc: "Soft-UI depth with dual highlight and shadow layers",
      btnStyle: {
        background: "var(--bg-elevated)",
        color: "var(--text-primary)",
        boxShadow: "6px 6px 16px rgba(0,0,0,0.5), -4px -4px 12px rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.04)",
      } as CSSProperties,
      cardBorder: "1px solid rgba(255,255,255,0.06)",
      cardShadow: "8px 8px 24px rgba(0,0,0,0.4), -4px -4px 16px rgba(255,255,255,0.03)",
    },
    {
      name: "Gradient",
      desc: "Linear, radial, conic and mesh gradient editor",
      btnStyle: {
        background: "linear-gradient(135deg, var(--showcase-plasma), var(--showcase-bloom))",
        color: "#fff",
        boxShadow: "0 8px 32px rgba(129,140,248,0.3)",
        border: "none",
      } as CSSProperties,
      cardBorder: "1px solid rgba(129,140,248,0.3)",
      cardShadow: "0 12px 40px rgba(129,140,248,0.15)",
    },
    {
      name: "Spotlight",
      desc: "Directional light source simulated on components",
      btnStyle: {
        background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15), transparent 60%), var(--bg-elevated)",
        color: "var(--text-primary)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
        border: "1px solid rgba(255,255,255,0.1)",
      } as CSSProperties,
      cardBorder: "1px solid rgba(255,255,255,0.08)",
      cardShadow: "0 8px 32px rgba(0,0,0,0.4)",
    },
    {
      name: "Animated Border",
      desc: "CSS-powered rotating, pulsing and drawing borders",
      btnStyle: {
        background: "var(--bg-elevated)",
        color: "var(--showcase-spearmint)",
        boxShadow: "none",
        border: "2px solid var(--showcase-spearmint)",
        animation: "border-pulse 2s ease-in-out infinite",
      } as CSSProperties,
      cardBorder: "2px solid var(--showcase-spearmint)",
      cardShadow: "0 0 24px rgba(16,185,129,0.15)",
    },
    {
      name: "Inner Shadow",
      desc: "Inset shadow effects for pressed or embossed component states",
      btnStyle: {
        background: "var(--bg-surface)",
        color: "var(--text-secondary)",
        boxShadow: "inset 3px 3px 8px rgba(0,0,0,0.5), inset -2px -2px 6px rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.04)",
      } as CSSProperties,
      cardBorder: "1px solid rgba(255,255,255,0.06)",
      cardShadow: "inset 4px 4px 12px rgba(0,0,0,0.4), inset -3px -3px 10px rgba(255,255,255,0.03)",
    },
    {
      name: "Stroke",
      desc: "Borders with gradient and animated sweep variants",
      btnStyle: {
        background: "transparent",
        color: "var(--showcase-crimson)",
        boxShadow: "none",
        border: "2px solid var(--showcase-crimson)",
      } as CSSProperties,
      cardBorder: "2px solid var(--showcase-crimson)",
      cardShadow: "0 0 20px rgba(244,63,94,0.12)",
    },
  ];

  useEffect(() => {
    const t = setInterval(() => setActiveIdx((i) => (i + 1) % effects.length), 3000);
    return () => clearInterval(t);
  }, []);

  const fx = effects[activeIdx];

  return (
    <div
      className="fx-showcase"
      style={{
        border: fx.cardBorder,
        boxShadow: fx.cardShadow,
        transition: "border 0.6s ease, box-shadow 0.6s ease",
      }}
    >
      <div className="pcard-hdr">
        <div className="dot" style={{ background: "#FF5F57" }} />
        <div className="dot" style={{ background: "#FEBC2E" }} />
        <div className="dot" style={{ background: "#28C840" }} />
        <span className="pcard-lbl">Effect Preview</span>
      </div>
      <div className="fx-card-inner">
        <div className="fx-card-demo" style={fx.btnStyle}>
          Click me
        </div>
        <div className="fx-card-name">{fx.name}</div>
        <div className="fx-card-desc">{fx.desc}</div>
        <div className="fx-card-dots">
          {effects.map((_, i) => (
            <div
              key={i}
              className={`fx-card-dot ${i === activeIdx ? "active" : ""}`}
              onClick={() => setActiveIdx(i)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   MAIN PAGE
   ================================================================ */
export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [pColor, setPColor] = useState("#F5A623");
  const [pRadius, setPRadius] = useState("8px");

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  useEffect(() => {
    const C = ["#F5A623", "#7C3AED", "#22D3EE", "#F43F5E", "#10B981"];
    const R = ["8px", "24px", "4px", "16px", "50px"];
    let i = 0;
    const t = setInterval(() => {
      i = (i + 1) % C.length;
      setPColor(C[i]);
      setPRadius(R[i]);
    }, 2000);
    return () => clearInterval(t);
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
    "Drop Shadow", "Inner Shadow", "Glow Effects", "Spotlight", "Neumorphism",
    "Animated Borders", "Gradient Mesh", "Token System", "Tailwind Export", "CSS Export",
    "React Motion", "Entry & Exit", "Hover States", "Tap Interactions", "Typography Control", "Free to Start",
  ];

  return (
    <>
      <style>{CSS}</style>

      {/* ── Nav ─────────────────────────────────── */}
      <nav className={`nav ${scrolled ? "s" : ""}`}>
        <div className="nav-logo">
          J<em>6</em>
        </div>
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
            Design<br />
            <em>React</em><br />
            components.<br />
            Without guessing.
          </h1>
          <p className="hero-desc">
            J6 is a browser-based designer for React components. Build with interaction motions,
            deep effect controls, a full token system — then export clean CSS or Tailwind.
          </p>
          <div className="hero-actions">
            <button className="bp">
              Start for free <Arrow />
            </button>
            <button className="bs">Watch demo</button>
          </div>

          {/* ── Showcase components row ─────────────────────── */}
          <div className="hero-showcase">
            <HeroDropdown />
            <HeroPopover />
            <MiniSwitch />
            <span
              className="j6-badge"
              style={{
                background: "rgba(163,230,53,0.12)",
                color: "var(--showcase-acid)",
                border: "1px solid rgba(163,230,53,0.25)",
              }}
            >
              <span className="pulse" style={{ background: "var(--showcase-acid)" }} />
              Live preview
            </span>
            <MiniTooltip />
            <MiniProgress />
          </div>

          <div className="stats">
            <div>
              <div className="stat-n">22</div>
              <div className="stat-l">Components</div>
            </div>
            <div>
              <div className="stat-n">8</div>
              <div className="stat-l">Effect Types</div>
            </div>
            <div>
              <div className="stat-n">&infin;</div>
              <div className="stat-l">Token Combos</div>
            </div>
          </div>
        </div>
        <div className="hero-r">
          <div className="hcanvas">
            <div className="grid-bg" />
            <div className="ftag" style={{ top: "16%", left: "10%", animationDelay: "0s" }}>motion.tap</div>
            <div className="ftag" style={{ top: "20%", right: "8%", animationDelay: "1.2s" }}>glow: 24px</div>
            <div className="ftag" style={{ bottom: "28%", right: "6%", animationDelay: "0.6s" }}>border-radius</div>
            <div className="ftag" style={{ bottom: "20%", left: "8%", animationDelay: "1.8s" }}>--token-primary</div>
            <div className="pcard">
              <div className="pcard-hdr">
                <div className="dot" style={{ background: "#FF5F57" }} />
                <div className="dot" style={{ background: "#FFBD2E" }} />
                <div className="dot" style={{ background: "#28C840" }} />
                <span className="pcard-lbl">Button.jsx</span>
              </div>
              <div className="pcard-body">
                <button
                  className="pbtn"
                  style={{
                    background: pColor,
                    borderRadius: pRadius,
                    color: "#0A0A0B",
                    boxShadow: `0 0 28px ${pColor}60`,
                    transition: "all 0.8s cubic-bezier(0.34,1.56,0.64,1)",
                  }}
                >
                  Click me
                </button>
                <div className="pgrid">
                  <div className="pctrl">
                    <div className="pctrl-l">Effect</div>
                    <div className="pctrl-v" style={{ color: "var(--brand-default)" }}>Glow</div>
                  </div>
                  <div className="pctrl">
                    <div className="pctrl-l">Motion</div>
                    <div className="pctrl-v" style={{ color: "var(--brand-default)" }}>spring</div>
                  </div>
                  <div className="pctrl">
                    <div className="pctrl-l">Color</div>
                    <div className="pctrl-v" style={{ color: pColor, transition: "color 0.8s" }}>{pColor}</div>
                  </div>
                  <div className="pctrl">
                    <div className="pctrl-l">Radius</div>
                    <div className="pctrl-v" style={{ color: "var(--brand-default)" }}>{pRadius}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Marquee ─────────────────────────────────── */}
      <div className="strip">
        <div className="strip-i">
          {[...strip, ...strip].map((item, i) => (
            <span key={i} className="sitem">{item}</span>
          ))}
        </div>
      </div>

      {/* ── Bento Features ─────────────────────────────────── */}
      <section className="sec" id="how">
        <div className="wrap">
          <div className="bento-hdr">
            <div className="ol" style={{ justifyContent: "center" }}>Features</div>
            <h2 className="h2">
              Everything you need.<br />
              <em>Nothing you don't.</em>
            </h2>
            <p className="lead">
              From live preview to production export — J6 covers the entire component design workflow in one focused tool.
            </p>
          </div>

          <div className="bento-grid">
            {/* Card A — Live Editor */}
            <div className="bento-card c-a">
              <div className="bc-label">01</div>
              <div className="bc-title">Live Visual Editor & Preview</div>
              <div className="bc-desc">
                Design components in real-time on a configurable stage. Set your background to match your app,
                toggle grids, and see every change instantly.
              </div>
              <div className="bc-media">
                <div className="bc-media-inner" style={{ aspectRatio: "16/9" }}>
                  <div style={{
                    width: "100%", height: "100%", minHeight: 200,
                    background: "linear-gradient(135deg, var(--bg-elevated) 0%, var(--bg-subtle) 60%, rgba(245,166,35,0.06) 100%)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <img
                      src="/edit-component.gif"
                      alt="Live editor preview"
                      style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }}
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                    <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-muted)", position: "relative", zIndex: 1 }}>
                      edit-component.gif
                    </div>
                  </div>
                </div>
                <div className="bc-media-bar">
                  <div className="bc-media-dot" style={{ background: "#FF5F57" }} />
                  <div className="bc-media-dot" style={{ background: "#FEBC2E" }} />
                  <div className="bc-media-dot" style={{ background: "#28C840" }} />
                  <span className="bc-media-title">j6.app — Component Studio</span>
                </div>
              </div>
            </div>

            {/* Card B — Motion & Effects */}
            <div className="bento-card c-b">
              <div className="bc-label">02</div>
              <div className="bc-title">Premium Motion & Effects</div>
              <div className="bc-desc">
                Border beam, neon glow, tilt 3D, glare, spotlight — effects that take hours to hand-code, applied in one click.
              </div>
              <div className="bc-media">
                <div className="bc-media-inner" style={{ aspectRatio: "4/5" }}>
                  <div style={{
                    width: "100%", height: "100%", minHeight: 200,
                    background: "linear-gradient(160deg, var(--bg-subtle) 0%, var(--bg-elevated) 50%, rgba(124,58,237,0.08) 100%)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <img
                      src="/motion-control.gif"
                      alt="Motion controls"
                      style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }}
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                    <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-muted)", position: "relative", zIndex: 1 }}>
                      motion-control.gif
                    </div>
                  </div>
                </div>
                <div className="bc-media-bar">
                  <div className="bc-media-dot" style={{ background: "#FF5F57" }} />
                  <div className="bc-media-dot" style={{ background: "#FEBC2E" }} />
                  <div className="bc-media-dot" style={{ background: "#28C840" }} />
                  <span className="bc-media-title">Effects Panel</span>
                </div>
              </div>
            </div>

            {/* Card C — Export */}
            <div className="bento-card c-c">
              <div className="bc-label">03</div>
              <div className="bc-title">Multi-Format Code Export</div>
              <div className="bc-desc">
                Export as inline CSS, Tailwind utilities, or clean React with named props. Every animation keyframe and CSS variable is included.
              </div>
              <div className="bc-media">
                <div className="bc-media-inner" style={{ aspectRatio: "4/3" }}>
                  <div style={{
                    width: "100%", height: "100%", minHeight: 180,
                    background: "var(--bg-base)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <img
                      src="/export.gif"
                      alt="Code export"
                      style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", position: "absolute", inset: 0 }}
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                    <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-muted)", position: "relative", zIndex: 1 }}>
                      export.gif
                    </div>
                  </div>
                </div>
                <div className="bc-media-bar">
                  <div className="bc-media-dot" style={{ background: "#FF5F57" }} />
                  <div className="bc-media-dot" style={{ background: "#FEBC2E" }} />
                  <div className="bc-media-dot" style={{ background: "#28C840" }} />
                  <span className="bc-media-title">Export Panel</span>
                </div>
              </div>
            </div>

            {/* Card D — Token System */}
            <div className="bento-card c-d">
              <div className="bc-label">04</div>
              <div className="bc-title">Design Token System</div>
              <div className="bc-desc">
                Create colour palettes, apply them across 22+ components, and keep your design consistent.
                Tokens persist per-project and appear in every colour picker.
              </div>
              <div className="bc-media">
                <div className="bc-media-inner" style={{ aspectRatio: "4/3" }}>
                  <div style={{
                    width: "100%", height: "100%", minHeight: 180,
                    background: "linear-gradient(135deg, var(--bg-subtle) 0%, rgba(245,166,35,0.04) 100%)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <img
                      src="/token-system.gif"
                      alt="Token system"
                      style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }}
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                    <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-muted)", position: "relative", zIndex: 1 }}>
                      token-system.gif
                    </div>
                  </div>
                </div>
                <div className="bc-media-bar">
                  <div className="bc-media-dot" style={{ background: "#FF5F57" }} />
                  <div className="bc-media-dot" style={{ background: "#FEBC2E" }} />
                  <div className="bc-media-dot" style={{ background: "#28C840" }} />
                  <span className="bc-media-title">Token Studio</span>
                </div>
              </div>
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
              <h2 className="h2">
                Eight ways to<br />
                make it <em>yours.</em>
              </h2>
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
              <h2 className="h2">
                Every component<br />
                you <em>need.</em>
              </h2>
            </div>
            <p style={{ fontSize: "14px", color: "var(--text-muted)", maxWidth: "260px", fontFamily: "var(--mono)", lineHeight: "1.7" }}>
              Free plan includes all standard components. Pro unlocks the advanced ones.
            </p>
          </div>
          <div className="chips">
            {components.map(([name, isPro]) => (
              <div key={name} className={`chip ${isPro ? "pro" : ""}`}>{name}</div>
            ))}
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
                  <div className="tav">
                    {t.n.split(" ").map((x) => x[0]).join("")}
                  </div>
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

      {/* ── Pricing ─────────────────────────────────── */}
      <section className="sec" id="pricing">
        <div className="wrap">
          <div style={{ marginBottom: "64px" }}>
            <div className="ol">Pricing</div>
            <h2 className="h2">
              Start free.<br />
              <em>Go pro</em> when ready.
            </h2>
          </div>
          <div className="pgrid-layout">
            <div className="pcard2">
              <div className="ptier">Free</div>
              <div className="pamt"><sup>$</sup>0</div>
              <p className="pdesc">Everything you need to start building great components. No card required, no time limit.</p>
              <ul className="pfeats">
                {["All 16 standard components", "Drop shadow, stroke, gradient effects", "Basic token system", "CSS export", "Hover & tap motion", "Community support"].map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <button className="pcta pcta-f" style={{ border: "1px solid var(--border-strong)" }}>Start for free</button>
            </div>
            <div className="pcard2 ft">
              <div className="ptier">Pro</div>
              <div className="pamt"><sup>$</sup>12<sub>/mo</sub></div>
              <p className="pdesc">The full toolkit. Pro components, all effects, Tailwind export, and the complete token architecture system.</p>
              <ul className="pfeats">
                {[
                  "Everything in Free", "6 Pro components incl. Datatable", "All 8 effect types",
                  "Neumorphism & spotlight", "Animated border effects", "Full token system creator",
                  "Tailwind CSS export", "Entry & exit animations", "Priority support",
                ].map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <button className="pcta pcta-p">Start Pro Trial</button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────── */}
      <section className="final">
        <div className="wrap">
          <h2 className="ftitle">
            Stop guessing.<br />
            <em>Start building.</em>
          </h2>
          <p className="fdesc">Free forever for standard components. Pro for when you need everything.</p>
          <div className="faction">
            <button className="bp" style={{ fontSize: "15px", padding: "16px 40px" }}>
              Open J6 — it's free <Arrow />
            </button>
            <button className="bs" style={{ fontSize: "15px", padding: "16px 40px" }}>View on GitHub</button>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────── */}
      <footer className="footer">
        <div className="flogo">
          J<em>6</em>
        </div>
        <ul className="flinks">
          <li><a href="#">Docs</a></li>
          <li><a href="#">Components</a></li>
          <li><a href="#">GitHub</a></li>
          <li><a href="#">Privacy</a></li>
          <li><a href="#">Terms</a></li>
        </ul>
        <div className="fcopy">&copy; 2026 J6. All rights reserved.</div>
      </footer>
    </>
  );
}
