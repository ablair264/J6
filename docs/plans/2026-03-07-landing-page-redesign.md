# Landing Page Redesign — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign the landing page to use asymmetric bento layouts, real product components, and kill the generic AI landing page aesthetic. No fake testimonials. Show the tool's actual output.

**Architecture:** Replace the current 1370-line inline-styled monolith with a Tailwind-based page using the app's existing theme tokens (`--site-*`, `--accent-*` from index.css). Use `motion` (v12) for entrance animations. Break sections into separate files under `src/pages/landing/`. Use the MergedShape bento patterns the user provided for feature and showcase sections.

**Tech Stack:** React 18, Tailwind v4, motion v12, Lucide React, existing CSS variable system from `src/index.css`.

---

## Design Decisions

### Branding
- Name: **J6** (keep — it's short, punchy, and already used throughout)
- Accent: `#e8540a` (orange), Pro: `#7c3aed` (purple)
- Fonts: Space Grotesk (headings), Manrope (body) — already loaded in index.css

### Layout Philosophy
- **Asymmetric bento grids** for feature/showcase sections (from user's MergedShape patterns)
- **No uniform card grids** — every section has a distinct visual rhythm
- **Negative space is intentional** — gaps between shapes create visual breathing room
- **Content lives inside the shapes** — each bento cell contains real UI or real copy

### What's Being Removed
- `DotGrid` canvas background (performance cost, generic feel)
- Fake testimonials ("Alex Mercer · Stripe" etc.)
- Static `AppMockup` (replaced with real product screenshots or live components)
- All inline styles (replaced with Tailwind)
- Self-contained `ThemeContext` (use app's existing CSS variable system)

### What's Being Added
- Bento layout components based on user's MergedShape patterns
- Real rendered components from the app as interactive demos
- "How It Works" workflow section (Pick → Style → Export)
- Scroll-triggered entrance animations via `motion`
- Proper responsive breakpoints

---

## File Structure

```
src/pages/
├── LandingPage.tsx              ← Slim orchestrator (imports sections)
└── landing/
    ├── theme.ts                 ← Color tokens + theme hook
    ├── BentoLayout.tsx          ← Reusable bento grid components (4 layouts)
    ├── NavBar.tsx               ← Floating nav
    ├── Hero.tsx                 ← Headline + product screenshot
    ├── BentoFeatures.tsx        ← Asymmetric feature grid (Layout 1)
    ├── LiveDemo.tsx             ← Real component showcase (Layout 3)
    ├── HowItWorks.tsx           ← 3-step workflow (Layout 2)
    ├── Pricing.tsx              ← Free vs Pro (Layout 4)
    ├── FAQ.tsx                  ← Split layout accordion (keep)
    ├── FinalCTA.tsx             ← Bottom CTA
    └── Footer.tsx               ← Footer
```

---

## Task 1: Scaffold file structure and theme system

**Files:**
- Create: `src/pages/landing/theme.ts`
- Create: `src/pages/landing/BentoLayout.tsx`

**Step 1: Create theme.ts**

Centralise the color tokens into a hook that reads from CSS variables (already defined in `src/index.css`) with fallback hex values. This replaces the inline `light`/`dark` objects in the current LandingPage.

```ts
// src/pages/landing/theme.ts
import { useState, useEffect, createContext, useContext } from 'react';

// Direct color values (not CSS var references) so they work in inline styles too
export const palette = {
  light: {
    bg: '#f8f8f5',
    bgAlt: '#f0f0ec',
    bgCard: '#ffffff',
    bgCardHover: '#fafafa',
    border: 'rgba(0,0,0,0.08)',
    borderHover: 'rgba(0,0,0,0.18)',
    text: '#111110',
    textMid: '#444440',
    textMuted: '#888880',
    accent: '#e8540a',
    accentSoft: 'rgba(232,84,10,0.08)',
    accentBorder: 'rgba(232,84,10,0.25)',
    pro: '#7c3aed',
    proSoft: 'rgba(124,58,237,0.08)',
    proBorder: 'rgba(124,58,237,0.2)',
  },
  dark: {
    bg: '#0e0e0c',
    bgAlt: '#141412',
    bgCard: '#1a1a17',
    bgCardHover: '#1f1f1c',
    border: 'rgba(255,255,255,0.07)',
    borderHover: 'rgba(255,255,255,0.14)',
    text: '#f0f0ec',
    textMid: '#b0b0ac',
    textMuted: '#585854',
    accent: '#e8540a',
    accentSoft: 'rgba(232,84,10,0.1)',
    accentBorder: 'rgba(232,84,10,0.3)',
    pro: '#a78bfa',
    proSoft: 'rgba(167,139,250,0.1)',
    proBorder: 'rgba(167,139,250,0.25)',
  },
} as const;

export type Theme = typeof palette.dark;

export const ThemeContext = createContext<{
  dark: boolean;
  toggle: () => void;
  t: Theme;
}>({
  dark: true,
  toggle: () => {},
  t: palette.dark,
});

export const useTheme = () => useContext(ThemeContext);
```

**Step 2: Create BentoLayout.tsx**

Adapt the 4 MergedShape patterns into responsive Tailwind components. Each layout is a named export. Use CSS Grid with explicit `grid-template-areas` for responsiveness — on mobile, all cells stack vertically.

The shapes should use the theme's `bgCard` for fill, with `border` for edges, and `rounded-lg` (8px matches the user's borderRadius).

```tsx
// src/pages/landing/BentoLayout.tsx
// 4 bento layout variants adapted from MergedShape patterns
// Each accepts children as an array — one child per cell
// Responsive: asymmetric grid on desktop, stacked on mobile

import React from 'react';
import { useTheme } from './theme';

interface BentoProps {
  children: React.ReactNode[];
  className?: string;
}

// Layout 1: 4-cell asymmetric with bridge (Features)
// Shape 4 (left tall) | Shape 1 (center tall) | Shape 3 (right top) + Shape 2 (right bottom, extends under center)
export function BentoA({ children, className = '' }: BentoProps) {
  return (
    <div className={`grid gap-3 ${className}`}
      style={{
        gridTemplateColumns: '310fr 200fr 310fr',
        gridTemplateRows: '210fr 150fr',
        gridTemplateAreas: `
          "left center right-top"
          "left center right-bottom"
        `,
      }}
    >
      <div className="rounded-lg" style={{ gridArea: 'left' }}>{children[0]}</div>
      <div className="rounded-lg" style={{ gridArea: 'center' }}>{children[1]}</div>
      <div className="rounded-lg" style={{ gridArea: 'right-top' }}>{children[2]}</div>
      <div className="rounded-lg" style={{ gridArea: 'right-bottom' }}>{children[3]}</div>
    </div>
  );
}

// Layout 2: 4-cell with narrow center divider (How It Works)
// Shape 3 (left top) | Shape 1 (center full) | Shape 4 (right bottom)
// Shape 2 (left bottom) |                    |
export function BentoB({ children, className = '' }: BentoProps) {
  return (
    <div className={`grid gap-3 ${className}`}
      style={{
        gridTemplateColumns: '310fr 130fr 310fr',
        gridTemplateRows: '200fr 150fr',
        gridTemplateAreas: `
          "left-top    center  right-empty"
          "left-bottom center  right-bottom"
        `,
      }}
    >
      <div className="rounded-lg" style={{ gridArea: 'left-top' }}>{children[0]}</div>
      <div className="rounded-lg" style={{ gridArea: 'center' }}>{children[1]}</div>
      <div className="rounded-lg" style={{ gridArea: 'left-bottom' }}>{children[2]}</div>
      <div className="rounded-lg" style={{ gridArea: 'right-bottom' }}>{children[3]}</div>
    </div>
  );
}

// Layout 3: 3-cell — two stacked left, one tall right (Live Demo)
export function BentoC({ children, className = '' }: BentoProps) {
  return (
    <div className={`grid gap-3 ${className}`}
      style={{
        gridTemplateColumns: '310fr 450fr',
        gridTemplateRows: '200fr 150fr',
        gridTemplateAreas: `
          "left-top    right"
          "left-bottom right"
        `,
      }}
    >
      <div className="rounded-lg" style={{ gridArea: 'left-top' }}>{children[0]}</div>
      <div className="rounded-lg" style={{ gridArea: 'left-bottom' }}>{children[1]}</div>
      <div className="rounded-lg" style={{ gridArea: 'right' }}>{children[2]}</div>
    </div>
  );
}

// Layout 4: 2-cell — wide bottom left, tall right overlapping (Pricing)
export function BentoD({ children, className = '' }: BentoProps) {
  return (
    <div className={`grid gap-3 ${className}`}
      style={{
        gridTemplateColumns: '460fr 340fr',
        gridTemplateRows: '210fr 150fr',
        gridTemplateAreas: `
          "empty  right"
          "bottom right"
        `,
      }}
    >
      <div className="rounded-lg" style={{ gridArea: 'bottom' }}>{children[0]}</div>
      <div className="rounded-lg" style={{ gridArea: 'right' }}>{children[1]}</div>
    </div>
  );
}
```

**Step 3: Verify files compile**

Run: `cd /Users/blair/Desktop/Development/ui-studio-oss && npx tsc --noEmit --pretty 2>&1 | head -30`
Expected: No errors related to the new files.

**Step 4: Commit**

```bash
git add src/pages/landing/theme.ts src/pages/landing/BentoLayout.tsx
git commit -m "feat(landing): scaffold theme system and bento layout components"
```

---

## Task 2: Extract NavBar into its own file

**Files:**
- Create: `src/pages/landing/NavBar.tsx`

**Step 1: Build NavBar with Tailwind**

Port the existing NavBar logic but use Tailwind classes instead of inline styles. Keep: floating nav on scroll, theme toggle, logo, CTA button. Link "Get started free" to `/register` and nav links to section anchors.

Key changes from current:
- Use Tailwind classes for all styling
- Import `useTheme` from `./theme`
- Use `motion` for subtle entrance animation
- Link to real routes (`/register`, `/login`)

```tsx
// src/pages/landing/NavBar.tsx
import React, { useEffect, useState } from 'react';
import { Layers, Sun, Moon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from './theme';

export function NavBar() {
  const { dark: isDark, toggle, t } = useTheme();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Use inline styles for dynamic theme colors that Tailwind can't handle
  // Use Tailwind for layout, spacing, transitions
  return (
    <header className="fixed top-0 left-0 right-0 z-[100] transition-all duration-300">
      <div
        className="transition-all duration-350 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{
          margin: scrolled ? '8px 16px' : '16px 24px',
          background: scrolled
            ? isDark ? 'rgba(14,14,12,0.92)' : 'rgba(248,248,245,0.92)'
            : 'transparent',
          backdropFilter: scrolled ? 'blur(16px)' : 'none',
          border: `1px solid ${scrolled ? t.border : 'transparent'}`,
          borderRadius: 14,
          boxShadow: scrolled ? '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06)' : 'none',
        }}
      >
        <nav className="flex items-center justify-between px-5 py-3">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 no-underline">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${t.accent}, #ff7c3a)` }}
            >
              <Layers size={16} color="#fff" />
            </div>
            <span className="text-[17px] font-bold tracking-tight" style={{ color: t.text }}>
              J6
            </span>
          </Link>

          {/* Nav links — hidden on mobile */}
          <div className="hidden md:flex items-center gap-1">
            {['Features', 'Components', 'Pricing'].map(item => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="px-3 py-1.5 rounded-lg text-[13px] font-medium no-underline transition-colors duration-150 hover:opacity-80"
                style={{ color: t.textMid }}
              >
                {item}
              </a>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggle}
              className="w-[34px] h-[34px] rounded-lg flex items-center justify-center cursor-pointer transition-all duration-150"
              style={{
                border: `1px solid ${t.border}`,
                background: 'transparent',
                color: t.textMid,
              }}
            >
              {isDark ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            <Link
              to="/register"
              className="px-4 py-[7px] rounded-lg text-[13px] font-semibold no-underline transition-opacity duration-150 hover:opacity-85"
              style={{ background: t.accent, color: '#fff' }}
            >
              Get started free
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
```

**Step 2: Verify compilation**

Run: `npx tsc --noEmit 2>&1 | grep -i "NavBar" | head -5`
Expected: No errors.

**Step 3: Commit**

```bash
git add src/pages/landing/NavBar.tsx
git commit -m "feat(landing): extract NavBar with Tailwind styling"
```

---

## Task 3: Build the Hero section

**Files:**
- Create: `src/pages/landing/Hero.tsx`

**Step 1: Build Hero**

The hero should:
- Drop the DotGrid canvas (performance hog, generic feel)
- Use a subtle radial gradient background instead
- Keep the headline structure ("Design components. Ship production code.")
- Keep the social proof bar
- Add `motion` entrance animations (blur-fade in)
- Replace `<a href="#">` CTAs with real `<Link to="/register">`
- Add a product screenshot or browser-frame preview below the fold hint

Use `motion` (v12) for entrance:
```tsx
import { motion } from 'motion/react';
```

The hero badge should link to `#components`. Social proof stats should reflect actual numbers.

```tsx
// Key animation pattern for all sections:
<motion.div
  initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
  whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
  viewport={{ once: true, margin: '-100px' }}
  transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
>
```

**Step 2: Verify compilation**

Run: `npx tsc --noEmit 2>&1 | grep -i "Hero" | head -5`

**Step 3: Commit**

```bash
git add src/pages/landing/Hero.tsx
git commit -m "feat(landing): hero section with motion entrance animations"
```

---

## Task 4: Build BentoFeatures section (Layout A)

**Files:**
- Create: `src/pages/landing/BentoFeatures.tsx`

**Step 1: Build the asymmetric feature grid**

Use BentoA layout (4-cell asymmetric). Instead of 6 identical feature cards, use 4 cells with different visual weights:

- **Cell 1 (left, tall):** "Visual Component Customisation" — large, with a mini illustration showing inspector sliders/color pickers. This is the hero feature.
- **Cell 2 (center, tall):** "Motion & Animation" — vertical cell showing a stacked sequence of motion preset names (blur-fade, slide-scale, drop-in) with subtle animation.
- **Cell 3 (right top):** "CSS & Tailwind Export" — code snippet preview showing actual exported Tailwind output.
- **Cell 4 (right bottom):** "22 Production Components" — compact grid of tiny component icons.

Each cell has:
- Background: `t.bgCard` with `t.border` border
- Rounded corners: `rounded-xl` (12px)
- Padding: `p-6` to `p-8`
- Hover: subtle border color shift

Use `motion` for scroll-triggered stagger:
```tsx
transition={{ delay: index * 0.1 }}
```

**Step 2: Verify compilation and visual check**

Run: `npx tsc --noEmit`

**Step 3: Commit**

```bash
git add src/pages/landing/BentoFeatures.tsx
git commit -m "feat(landing): asymmetric bento feature grid"
```

---

## Task 5: Build LiveDemo section (Layout C)

**Files:**
- Create: `src/pages/landing/LiveDemo.tsx`

**Step 1: Build the live component showcase**

Use BentoC layout (2 stacked left + 1 tall right). This is the "show, don't tell" section.

- **Cell 1 (left top):** A rendered Button component in 3-4 variants (default, outline, ghost, gradient) — show actual styled buttons.
- **Cell 2 (left bottom):** A rendered Badge + Switch side-by-side — show actual components with different color configs.
- **Cell 3 (right, tall):** A rendered Card component — show a real styled card with icon, title, subtitle, badge, feature tags, action buttons. This demonstrates the card builder you just enhanced.

These should be actual React components from the app's library (`src/components/ui/button.tsx`, `src/components/ui/badge.tsx`, etc.), styled with inline styles or Tailwind to look like what users would create in the studio.

Section header: "See what you'll build" or "Real components. Real output."

**Step 2: Verify**

Run: `npx tsc --noEmit`

**Step 3: Commit**

```bash
git add src/pages/landing/LiveDemo.tsx
git commit -m "feat(landing): live component demo with real rendered components"
```

---

## Task 6: Build HowItWorks section (Layout B)

**Files:**
- Create: `src/pages/landing/HowItWorks.tsx`

**Step 1: Build the 3-step workflow**

Use BentoB layout (4 cells with narrow center divider). This replaces the fake testimonials.

- **Cell 1 (left top):** Step 1 — "Pick a component" with a mini sidebar showing component names + icons (like the studio's actual sidebar).
- **Cell 2 (center, full height):** The arrow/flow indicator — a vertical "→" sequence or numbered steps (1, 2, 3) stacked vertically. Narrow column acts as visual connector.
- **Cell 3 (left bottom):** Step 2 — "Style it visually" with a mini inspector panel showing sliders and color pickers.
- **Cell 4 (right bottom):** Step 3 — "Export clean code" with a code block showing a Tailwind snippet.

The empty top-right cell in BentoB creates intentional negative space — this is a feature, not a bug. It gives the layout visual asymmetry and breathing room.

**Step 2: Verify**

Run: `npx tsc --noEmit`

**Step 3: Commit**

```bash
git add src/pages/landing/HowItWorks.tsx
git commit -m "feat(landing): how-it-works workflow with bento layout"
```

---

## Task 7: Port Pricing section

**Files:**
- Create: `src/pages/landing/Pricing.tsx`

**Step 1: Convert pricing to Tailwind**

Keep the existing Free vs Pro tier layout — it works well. Convert from inline styles to Tailwind. Key changes:

- Use `useTheme()` instead of local ThemeContext
- Replace inline styles with Tailwind utilities where possible
- Keep the "Most popular" badge on Pro
- Link CTAs to `/register`
- Use `motion` for entrance animation

Don't use a bento layout here — the two-column pricing comparison is a proven pattern and doesn't need disruption. Keep it clean.

**Step 2: Verify**

Run: `npx tsc --noEmit`

**Step 3: Commit**

```bash
git add src/pages/landing/Pricing.tsx
git commit -m "feat(landing): pricing section with Tailwind"
```

---

## Task 8: Port FAQ section

**Files:**
- Create: `src/pages/landing/FAQ.tsx`

**Step 1: Convert FAQ to Tailwind**

The split-layout FAQ (sticky left label + right accordion) is well-designed. Keep the structure, convert to Tailwind. Update the FAQ content:

- Remove any outdated information
- Ensure component counts match reality (21 components currently, update free/pro split)
- Use `useTheme()` hook
- Add `motion` entrance animation
- Use Lucide `Plus`/`Minus` icons (already imported)

**Step 2: Verify**

Run: `npx tsc --noEmit`

**Step 3: Commit**

```bash
git add src/pages/landing/FAQ.tsx
git commit -m "feat(landing): FAQ section with Tailwind"
```

---

## Task 9: Build FinalCTA and Footer

**Files:**
- Create: `src/pages/landing/FinalCTA.tsx`
- Create: `src/pages/landing/Footer.tsx`

**Step 1: Convert FinalCTA**

Keep the existing CTA structure — gradient accent line, badge, headline, two buttons. Convert to Tailwind. Link to `/register`.

**Step 2: Convert Footer**

Keep the 4-column footer layout. Convert to Tailwind. Update links — remove non-existent pages (API Reference, Blog, etc.) or keep them as `#` placeholders but mark with a comment.

**Step 3: Verify both**

Run: `npx tsc --noEmit`

**Step 4: Commit**

```bash
git add src/pages/landing/FinalCTA.tsx src/pages/landing/Footer.tsx
git commit -m "feat(landing): final CTA and footer sections"
```

---

## Task 10: Rewire LandingPage.tsx as orchestrator

**Files:**
- Modify: `src/pages/LandingPage.tsx` (full rewrite)

**Step 1: Replace entire file**

The new LandingPage.tsx becomes a slim orchestrator that imports all sections and wraps them in the ThemeContext provider.

```tsx
import React, { useState, useEffect } from 'react';
import { ThemeContext, palette } from './landing/theme';
import { NavBar } from './landing/NavBar';
import { Hero } from './landing/Hero';
import { BentoFeatures } from './landing/BentoFeatures';
import { LiveDemo } from './landing/LiveDemo';
import { HowItWorks } from './landing/HowItWorks';
import { Pricing } from './landing/Pricing';
import { FAQ } from './landing/FAQ';
import { FinalCTA } from './landing/FinalCTA';
import { Footer } from './landing/Footer';

const LandingPage: React.FC = () => {
  const [isDark, setIsDark] = useState(true);
  const t = isDark ? palette.dark : palette.light;

  useEffect(() => {
    document.body.style.background = t.bg;
    document.body.style.transition = 'background 0.3s';
    document.body.style.margin = '0';
  }, [t.bg]);

  return (
    <ThemeContext.Provider value={{ dark: isDark, toggle: () => setIsDark(d => !d), t }}>
      <div
        className="antialiased"
        style={{
          fontFamily: "'Space Grotesk', 'Manrope', system-ui, sans-serif",
          background: t.bg,
          color: t.text,
        }}
      >
        <NavBar />
        <main>
          <Hero />
          <BentoFeatures />
          <LiveDemo />
          <HowItWorks />
          <Pricing />
          <FAQ />
          <FinalCTA />
        </main>
        <Footer />
      </div>
    </ThemeContext.Provider>
  );
};

export default LandingPage;
```

**Step 2: Verify full compilation**

Run: `npx tsc --noEmit`

**Step 3: Verify dev server**

Run: `pnpm dev` and check `http://localhost:5173/` renders the new landing page.

**Step 4: Commit**

```bash
git add src/pages/LandingPage.tsx
git commit -m "feat(landing): rewire as orchestrator importing all sections"
```

---

## Task 11: Responsive pass

**Files:**
- Modify: `src/pages/landing/BentoLayout.tsx`
- Modify: Various section files as needed

**Step 1: Add mobile breakpoints to bento layouts**

All bento layouts should collapse to single-column stacks on mobile (`< 768px`). Use Tailwind's responsive grid:

```tsx
// Example: BentoA on mobile becomes stacked
<div className="grid gap-3 grid-cols-1 md:grid-cols-[310fr_200fr_310fr]" ...>
```

For the `grid-template-areas`, use a media query approach — either inline style with `window.innerWidth` check, or a Tailwind `@container` approach.

Simpler approach: use Tailwind grid utilities for mobile and only apply the custom `gridTemplateAreas` via inline style at `md:` and above. On mobile, each cell gets `gridArea: 'auto'`.

**Step 2: Test at 375px, 768px, 1024px, 1440px**

Check each breakpoint visually.

**Step 3: Commit**

```bash
git add -A src/pages/landing/
git commit -m "feat(landing): responsive breakpoints for bento layouts"
```

---

## Task 12: Final cleanup and visual polish

**Files:**
- Modify: Various files in `src/pages/landing/`

**Step 1: Visual audit**

Check against the pre-delivery checklist:
- [ ] No emojis used as icons
- [ ] All icons from Lucide (consistent set)
- [ ] Hover states don't cause layout shift
- [ ] All clickable elements have `cursor-pointer`
- [ ] Transitions are smooth (150-300ms)
- [ ] Light/dark mode both look correct
- [ ] Text contrast meets 4.5:1 minimum
- [ ] No horizontal scroll on mobile
- [ ] Entrance animations respect `prefers-reduced-motion`

**Step 2: Add reduced-motion support**

```tsx
// In each section using motion:
<motion.div
  initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
  ...
>
```

Or use motion's built-in `useReducedMotion()` hook.

**Step 3: Delete old DotGrid and unused code**

If any old components (DotGrid, AppMockup, Testimonials) are still referenced, remove them.

**Step 4: Final commit**

```bash
git add -A
git commit -m "feat(landing): polish, a11y, and reduced-motion support"
```

---

## Section Flow Summary

| # | Section | Layout | Key Content |
|---|---------|--------|-------------|
| 1 | NavBar | Floating | Logo, links, theme toggle, CTA |
| 2 | Hero | Centered | Headline, subtitle, stats bar, scroll cue |
| 3 | BentoFeatures | **BentoA** (4-cell asymmetric) | 4 features with visual weight variation |
| 4 | LiveDemo | **BentoC** (2+1) | Real rendered Button/Badge/Card components |
| 5 | HowItWorks | **BentoB** (4-cell + divider) | Pick → Style → Export workflow |
| 6 | Pricing | Standard 2-col | Free vs Pro tiers |
| 7 | FAQ | Split (1/3 + 2/3) | Sticky label + accordion |
| 8 | FinalCTA | Centered card | CTA with gradient accent |
| 9 | Footer | 4-column grid | Links + brand |
