# Component Library Redesign — ReUI-Style Docs + CLI Registry

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the Component Library page into a professional docs site with live previews, full source code, syntax highlighting, auto-generated props tables, and a custom `npx ui-studio add` CLI registry.

**Architecture:** Six phases — (1) Shiki CodeBlock infrastructure, (2) ComponentPreview + collapsible source, (3) Registry data model with `?raw` source imports, (4) Redesigned detail page layout, (5) Auto-generated props from TypeScript, (6) Custom CLI package. The registry is the central data model: it describes every component's metadata, source files, dependencies, props, and examples. The library page reads from it. The CLI reads from it.

**Tech Stack:** Shiki (syntax highlighting), ts-morph (props extraction), Vite `?raw` imports (source loading), React Router (existing), pnpm workspaces (CLI package)

---

## Phase 1: Shiki + CodeBlock Infrastructure

### Task 1: Install shiki

**Files:**
- Modify: `package.json`

**Step 1: Install shiki**

```bash
pnpm add shiki
```

**Step 2: Verify build**

```bash
pnpm run build
```
Expected: Clean build

**Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: add shiki for syntax highlighting"
```

---

### Task 2: Create CodeBlock component

**Files:**
- Create: `src/components/docs/CodeBlock.tsx`

This is the foundational code display component used everywhere.

**Step 1: Create the component**

```tsx
import { useEffect, useState, useRef } from 'react';
import { codeToHtml, type BundledTheme } from 'shiki';

interface CodeBlockProps {
  code: string;
  language?: string;
  theme?: BundledTheme;
  showLineNumbers?: boolean;
  maxHeight?: number;       // collapsed max-height in px
  collapsible?: boolean;    // show expand/collapse toggle
  title?: string;           // optional filename header
  className?: string;
}

export function CodeBlock({
  code,
  language = 'tsx',
  theme = 'github-dark-default',
  showLineNumbers = true,
  maxHeight = 300,
  collapsible = true,
  title,
  className,
}: CodeBlockProps) {
  const [html, setHtml] = useState('');
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const codeRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    codeToHtml(code.trim(), {
      lang: language,
      theme,
    }).then(setHtml);
  }, [code, language, theme]);

  useEffect(() => {
    if (codeRef.current && collapsible) {
      setIsOverflowing(codeRef.current.scrollHeight > maxHeight);
    }
  }, [html, maxHeight, collapsible]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className={className}>
      {/* Header bar */}
      {title && (
        <div className="flex items-center justify-between px-4 py-2 border-b"
          style={{
            background: 'rgba(255,255,255,0.03)',
            borderColor: 'rgba(255,255,255,0.08)',
          }}>
          <span className="text-xs font-mono text-[#9a9aa3]">{title}</span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-mono transition-colors hover:bg-white/5"
            style={{ color: '#9a9aa3' }}
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      )}

      {/* Code area */}
      <div className="relative group">
        {!title && (
          <button
            onClick={handleCopy}
            className="absolute top-2.5 right-2.5 z-10 px-2 py-1 rounded text-[11px] font-mono opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background: 'rgba(255,255,255,0.08)', color: '#9a9aa3' }}
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        )}

        <div
          ref={codeRef}
          className="overflow-hidden transition-[max-height] duration-300 [&_pre]:!m-0 [&_pre]:!rounded-none [&_pre]:!p-4 [&_pre]:text-[13px] [&_pre]:leading-relaxed [&_code]:!bg-transparent"
          style={{
            maxHeight: collapsible && !expanded && isOverflowing ? maxHeight : undefined,
          }}
          dangerouslySetInnerHTML={{ __html: html }}
        />

        {/* Expand/collapse overlay */}
        {collapsible && isOverflowing && !expanded && (
          <div
            className="absolute bottom-0 left-0 right-0 flex items-end justify-center pb-3 pt-12"
            style={{ background: 'linear-gradient(transparent, #111113 80%)' }}
          >
            <button
              onClick={() => setExpanded(true)}
              className="px-3 py-1 rounded-md text-[12px] font-medium transition-colors"
              style={{ background: 'rgba(255,255,255,0.08)', color: '#f0ede8' }}
            >
              Expand
            </button>
          </div>
        )}

        {collapsible && expanded && isOverflowing && (
          <div className="flex justify-center py-2" style={{ background: '#111113' }}>
            <button
              onClick={() => setExpanded(false)}
              className="px-3 py-1 rounded-md text-[12px] font-medium transition-colors"
              style={{ background: 'rgba(255,255,255,0.08)', color: '#9a9aa3' }}
            >
              Collapse
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
```

**Step 2: Verify build**

```bash
pnpm run build
```

**Step 3: Commit**

```bash
git add src/components/docs/CodeBlock.tsx
git commit -m "feat: add CodeBlock component with shiki syntax highlighting"
```

---

### Task 3: Create ComponentPreview component

**Files:**
- Create: `src/components/docs/ComponentPreview.tsx`

This combines a live preview area with a code toggle underneath (like ReUI's `<ComponentPreview />`).

**Step 1: Create the component**

```tsx
import { useState, type ReactNode } from 'react';
import { CodeBlock } from './CodeBlock';

interface ComponentPreviewProps {
  children: ReactNode;         // live preview
  code: string;                // usage code shown by default
  className?: string;
}

const T = {
  bg: '#0a0a0b',
  subtle: '#111113',
  surface: '#141416',
  elevated: '#1a1a1d',
  text: '#f0ede8',
  textSec: '#9a9aa3',
  textMuted: '#6b6b72',
  border: 'rgba(255,255,255,0.08)',
};

export function ComponentPreview({ children, code, className }: ComponentPreviewProps) {
  const [showCode, setShowCode] = useState(false);

  return (
    <div
      className={className}
      style={{ border: `1px solid ${T.border}`, borderRadius: 12, overflow: 'hidden' }}
    >
      {/* Preview area */}
      <div
        className="flex items-center justify-center p-10 min-h-[160px]"
        style={{ background: T.subtle }}
      >
        {children}
      </div>

      {/* Code area */}
      <div style={{ borderTop: `1px solid ${T.border}`, background: T.surface }}>
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono" style={{ color: T.textMuted }}>
              {showCode ? 'Code' : 'Preview'}
            </span>
          </div>
          <button
            onClick={() => setShowCode(!showCode)}
            className="px-2.5 py-1 rounded-md text-[12px] font-medium transition-colors"
            style={{
              background: showCode ? 'rgba(255,255,255,0.08)' : 'transparent',
              color: T.textSec,
              border: `1px solid ${T.border}`,
            }}
          >
            {showCode ? 'Hide Code' : 'View Code'}
          </button>
        </div>

        {/* Collapsible code block */}
        {showCode && (
          <CodeBlock
            code={code}
            language="tsx"
            collapsible={false}
            maxHeight={400}
          />
        )}
      </div>
    </div>
  );
}
```

**Step 2: Verify build**

```bash
pnpm run build
```

**Step 3: Commit**

```bash
git add src/components/docs/ComponentPreview.tsx
git commit -m "feat: add ComponentPreview component with code toggle"
```

---

### Task 4: Create ComponentSource component

**Files:**
- Create: `src/components/docs/ComponentSource.tsx`

Shows full source code of a component file, collapsed by default with "Expand" button (like ReUI's `<ComponentSource />`).

**Step 1: Create the component**

```tsx
import { CodeBlock } from './CodeBlock';

interface ComponentSourceProps {
  code: string;
  title: string;          // e.g. "components/ui/badge.tsx"
  language?: string;
  maxHeight?: number;
}

export function ComponentSource({
  code,
  title,
  language = 'tsx',
  maxHeight = 200,
}: ComponentSourceProps) {
  return (
    <div
      style={{
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 12,
        overflow: 'hidden',
      }}
    >
      <CodeBlock
        code={code}
        language={language}
        title={title}
        collapsible
        maxHeight={maxHeight}
      />
    </div>
  );
}
```

**Step 2: Create barrel export**

Create `src/components/docs/index.ts`:

```ts
export { CodeBlock } from './CodeBlock';
export { ComponentPreview } from './ComponentPreview';
export { ComponentSource } from './ComponentSource';
```

**Step 3: Verify build + commit**

```bash
pnpm run build
git add src/components/docs/
git commit -m "feat: add ComponentSource + docs barrel export"
```

---

## Phase 2: Component Registry Data Model

### Task 5: Define the registry schema

**Files:**
- Create: `src/registry/schema.ts`

This is the central type system for the registry. Every component is described by this schema.

**Step 1: Create the schema**

```ts
export interface RegistryComponent {
  /** URL-safe slug, e.g. "badge" */
  name: string;
  /** Human-readable name, e.g. "Badge" */
  label: string;
  /** One-line description */
  description: string;
  /** Category for sidebar grouping */
  category: 'primitives' | 'data-display' | 'feedback' | 'overlay' | 'navigation' | 'charts' | 'compact';
  /** Source files that make up this component (relative to src/) */
  files: RegistryFile[];
  /** Other registry components this depends on */
  registryDependencies?: string[];
  /** npm packages this requires */
  npmDependencies?: Record<string, string>;
  /** CSS variables that must exist in the user's theme */
  cssVars?: string[];
  /** Auto-generated props (populated by build script) */
  props?: RegistryProp[];
}

export interface RegistryFile {
  /** Path relative to src/, e.g. "components/ui/badge.tsx" */
  path: string;
  /** Target path in user project, e.g. "components/ui/badge.tsx" */
  target: string;
  /** File type for display */
  type: 'component' | 'lib' | 'types' | 'css';
}

export interface RegistryProp {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: string;
  description?: string;
}

export interface RegistryExample {
  title: string;
  /** Usage code string */
  code: string;
}
```

**Step 2: Verify build + commit**

```bash
pnpm run build
git add src/registry/schema.ts
git commit -m "feat: define component registry schema"
```

---

### Task 5B: Add Vite `?raw` type declarations

**Files:**
- Create: `src/vite-env-raw.d.ts`

Vite's `?raw` imports need TypeScript type declarations to avoid TS errors on `import ... from 'foo?raw'`.

**Step 1: Create the declaration file**

```ts
/// <reference types="vite/client" />

declare module '*?raw' {
  const content: string;
  export default content;
}
```

**Step 2: Verify build + commit**

```bash
pnpm run build
git add src/vite-env-raw.d.ts
git commit -m "chore: add TypeScript declaration for Vite ?raw imports"
```

---

### Task 6: Create the registry index with raw source imports

**Files:**
- Create: `src/registry/components.ts`

This is the big one — registers every component with its metadata and raw source.

**Step 1: Create the registry**

For each component, we import the source via `?raw` and define the metadata. The file will be ~400-600 lines. Here's the structure:

```ts
import type { RegistryComponent, RegistryExample } from './schema';
import { type ReactNode } from 'react';

// --- Raw source imports (Vite ?raw) ---
import accordionSource from '@/components/ui/accordion.tsx?raw';
import alertSource from '@/components/ui/alert.tsx?raw';
import animatedTextSource from '@/components/ui/animated-text.tsx?raw';
import avatarSource from '@/components/ui/avatar.tsx?raw';
import badgeSource from '@/components/ui/badge.tsx?raw';
import buttonSource from '@/components/ui/button.tsx?raw';
import cardSource from '@/components/ui/card.tsx?raw';
import checkboxSource from '@/components/ui/checkbox.tsx?raw';
import dataTableSource from '@/components/ui/data-table.tsx?raw';
import dialogSource from '@/components/ui/dialog.tsx?raw';
import drawerSource from '@/components/ui/drawer.tsx?raw';
import dropdownMenuSource from '@/components/ui/dropdown-menu.tsx?raw';
import inputSource from '@/components/ui/input.tsx?raw';
import navigationMenuSource from '@/components/ui/navigation-menu.tsx?raw';
import popoverSource from '@/components/ui/popover.tsx?raw';
import progressSource from '@/components/ui/progress.tsx?raw';
import sliderSource from '@/components/ui/slider.tsx?raw';
import switchSource from '@/components/ui/switch.tsx?raw';
import tabsSource from '@/components/ui/tabs.tsx?raw';
import tooltipSource from '@/components/ui/tooltip.tsx?raw';
// Cards
import chartSource from '@/components/ui/chart.tsx?raw';
import formatSource from '@/lib/format.ts?raw';
import dataContractsSource from '@/components/ui/cards/data-contracts.ts?raw';
import areaChartCardSource from '@/components/ui/cards/area-chart-card.tsx?raw';
import barChartCardSource from '@/components/ui/cards/bar-chart-card.tsx?raw';
import lineChartCardSource from '@/components/ui/cards/line-chart-card.tsx?raw';
import metricCardSource from '@/components/ui/cards/metric-card.tsx?raw';
import radialChartCardSource from '@/components/ui/cards/radial-chart-card.tsx?raw';
import roundedPieChartCardSource from '@/components/ui/cards/rounded-pie-chart-card.tsx?raw';
import dottedMultiLineChartCardSource from '@/components/ui/cards/dotted-multi-line-chart-card.tsx?raw';
import compactSmVariantsSource from '@/components/ui/cards/compact-sm-variants.tsx?raw';

/** Map of component name → raw source string(s) */
export const SOURCE_MAP: Record<string, Record<string, string>> = {
  accordion: { 'components/ui/accordion.tsx': accordionSource },
  alert: { 'components/ui/alert.tsx': alertSource },
  'animated-text': { 'components/ui/animated-text.tsx': animatedTextSource },
  avatar: { 'components/ui/avatar.tsx': avatarSource },
  badge: { 'components/ui/badge.tsx': badgeSource },
  button: { 'components/ui/button.tsx': buttonSource },
  card: { 'components/ui/card.tsx': cardSource },
  checkbox: { 'components/ui/checkbox.tsx': checkboxSource },
  'data-table': { 'components/ui/data-table.tsx': dataTableSource },
  dialog: { 'components/ui/dialog.tsx': dialogSource },
  drawer: { 'components/ui/drawer.tsx': drawerSource },
  'dropdown-menu': { 'components/ui/dropdown-menu.tsx': dropdownMenuSource },
  input: { 'components/ui/input.tsx': inputSource },
  'navigation-menu': { 'components/ui/navigation-menu.tsx': navigationMenuSource },
  popover: { 'components/ui/popover.tsx': popoverSource },
  progress: { 'components/ui/progress.tsx': progressSource },
  slider: { 'components/ui/slider.tsx': sliderSource },
  switch: { 'components/ui/switch.tsx': switchSource },
  tabs: { 'components/ui/tabs.tsx': tabsSource },
  tooltip: { 'components/ui/tooltip.tsx': tooltipSource },
  // Chart cards — include shared deps
  'area-chart-card': {
    'components/ui/cards/area-chart-card.tsx': areaChartCardSource,
    'components/ui/chart.tsx': chartSource,
    'lib/format.ts': formatSource,
    'components/ui/cards/data-contracts.ts': dataContractsSource,
  },
  'bar-chart-card': {
    'components/ui/cards/bar-chart-card.tsx': barChartCardSource,
    'components/ui/chart.tsx': chartSource,
    'lib/format.ts': formatSource,
    'components/ui/cards/data-contracts.ts': dataContractsSource,
  },
  'line-chart-card': {
    'components/ui/cards/line-chart-card.tsx': lineChartCardSource,
    'components/ui/chart.tsx': chartSource,
    'lib/format.ts': formatSource,
  },
  'metric-card': {
    'components/ui/cards/metric-card.tsx': metricCardSource,
    'components/ui/chart.tsx': chartSource,
    'lib/format.ts': formatSource,
  },
  'radial-chart-card': {
    'components/ui/cards/radial-chart-card.tsx': radialChartCardSource,
    'components/ui/chart.tsx': chartSource,
    'lib/format.ts': formatSource,
    'components/ui/cards/data-contracts.ts': dataContractsSource,
  },
  'rounded-pie-chart-card': {
    'components/ui/cards/rounded-pie-chart-card.tsx': roundedPieChartCardSource,
    'components/ui/chart.tsx': chartSource,
    'lib/format.ts': formatSource,
  },
  'dotted-multi-line-chart-card': {
    'components/ui/cards/dotted-multi-line-chart-card.tsx': dottedMultiLineChartCardSource,
    'components/ui/chart.tsx': chartSource,
    'lib/format.ts': formatSource,
  },
  'compact-cards': {
    'components/ui/cards/compact-sm-variants.tsx': compactSmVariantsSource,
    'components/ui/chart.tsx': chartSource,
    'lib/format.ts': formatSource,
  },
};

/** Full registry — metadata for every component */
export const REGISTRY: RegistryComponent[] = [
  // --- Primitives ---
  {
    name: 'accordion',
    label: 'Accordion',
    description: 'Collapsible content sections for FAQs, settings, and grouped information.',
    category: 'primitives',
    files: [{ path: 'components/ui/accordion.tsx', target: 'components/ui/accordion.tsx', type: 'component' }],
    npmDependencies: { 'radix-ui': '^1.4.3', 'motion': '^12.0.0' },
  },
  {
    name: 'alert',
    label: 'Alert',
    description: 'Contextual feedback messages for user actions with status variants.',
    category: 'feedback',
    files: [{ path: 'components/ui/alert.tsx', target: 'components/ui/alert.tsx', type: 'component' }],
    npmDependencies: { 'class-variance-authority': '^0.7.0' },
  },
  {
    name: 'animated-text',
    label: 'Animated Text',
    description: 'Text with entrance animations: typewriter, blur-in, split-entrance, counting-number, decrypt, gradient-sweep, and more.',
    category: 'feedback',
    files: [{ path: 'components/ui/animated-text.tsx', target: 'components/ui/animated-text.tsx', type: 'component' }],
    npmDependencies: { 'motion': '^12.0.0' },
  },
  {
    name: 'avatar',
    label: 'Avatar',
    description: 'User representations with images, fallback initials, status badges, and group stacking.',
    category: 'data-display',
    files: [{ path: 'components/ui/avatar.tsx', target: 'components/ui/avatar.tsx', type: 'component' }],
    npmDependencies: { 'radix-ui': '^1.4.3' },
  },
  {
    name: 'badge',
    label: 'Badge',
    description: 'Small status indicators, labels, and tags for categorization.',
    category: 'data-display',
    files: [{ path: 'components/ui/badge.tsx', target: 'components/ui/badge.tsx', type: 'component' }],
    npmDependencies: { 'class-variance-authority': '^0.7.0' },
  },
  {
    name: 'button',
    label: 'Button',
    description: 'Interactive controls for actions with multiple variants, sizes, and states.',
    category: 'primitives',
    files: [{ path: 'components/ui/button.tsx', target: 'components/ui/button.tsx', type: 'component' }],
    npmDependencies: { 'class-variance-authority': '^0.7.0', 'radix-ui': '^1.4.3' },
  },
  {
    name: 'card',
    label: 'Card',
    description: 'Surface containers for grouping related content with multiple elevation levels.',
    category: 'data-display',
    files: [{ path: 'components/ui/card.tsx', target: 'components/ui/card.tsx', type: 'component' }],
    npmDependencies: { 'class-variance-authority': '^0.7.0' },
  },
  {
    name: 'checkbox',
    label: 'Checkbox',
    description: 'Toggle controls for binary choices with custom selection icons.',
    category: 'primitives',
    files: [{ path: 'components/ui/checkbox.tsx', target: 'components/ui/checkbox.tsx', type: 'component' }],
    npmDependencies: { 'radix-ui': '^1.4.3' },
  },
  {
    name: 'data-table',
    label: 'Data Table',
    description: 'Sortable, styled tables for structured data with badge-colored status columns.',
    category: 'data-display',
    files: [{ path: 'components/ui/data-table.tsx', target: 'components/ui/data-table.tsx', type: 'component' }],
    npmDependencies: { 'lucide-react': '^0.460.0' },
  },
  {
    name: 'dialog',
    label: 'Dialog',
    description: 'Modal overlays for confirmations, forms, and focused interactions.',
    category: 'overlay',
    files: [{ path: 'components/ui/dialog.tsx', target: 'components/ui/dialog.tsx', type: 'component' }],
    npmDependencies: { 'radix-ui': '^1.4.3' },
  },
  {
    name: 'drawer',
    label: 'Drawer',
    description: 'Slide-in panels from any edge for secondary content and actions.',
    category: 'overlay',
    files: [{ path: 'components/ui/drawer.tsx', target: 'components/ui/drawer.tsx', type: 'component' }],
    npmDependencies: { 'radix-ui': '^1.4.3', 'motion': '^12.0.0' },
  },
  {
    name: 'dropdown-menu',
    label: 'Dropdown Menu',
    description: 'Contextual menus with items, separators, and keyboard shortcuts.',
    category: 'navigation',
    files: [{ path: 'components/ui/dropdown-menu.tsx', target: 'components/ui/dropdown-menu.tsx', type: 'component' }],
    npmDependencies: { 'radix-ui': '^1.4.3' },
  },
  {
    name: 'input',
    label: 'Input',
    description: 'Text input fields with prefix/suffix support and focus styles.',
    category: 'primitives',
    files: [{ path: 'components/ui/input.tsx', target: 'components/ui/input.tsx', type: 'component' }],
  },
  {
    name: 'navigation-menu',
    label: 'Navigation Menu',
    description: 'Horizontal or vertical navigation with nested content panels.',
    category: 'navigation',
    files: [{ path: 'components/ui/navigation-menu.tsx', target: 'components/ui/navigation-menu.tsx', type: 'component' }],
    npmDependencies: { 'radix-ui': '^1.4.3' },
  },
  {
    name: 'popover',
    label: 'Popover',
    description: 'Floating content panels triggered by clicks or hovers.',
    category: 'overlay',
    files: [{ path: 'components/ui/popover.tsx', target: 'components/ui/popover.tsx', type: 'component' }],
    npmDependencies: { 'radix-ui': '^1.4.3' },
  },
  {
    name: 'progress',
    label: 'Progress',
    description: 'Linear and circular progress indicators for loading and completion states.',
    category: 'feedback',
    files: [{ path: 'components/ui/progress.tsx', target: 'components/ui/progress.tsx', type: 'component' }],
    npmDependencies: { 'radix-ui': '^1.4.3' },
  },
  {
    name: 'slider',
    label: 'Slider',
    description: 'Range selection controls with single or dual thumbs.',
    category: 'primitives',
    files: [{ path: 'components/ui/slider.tsx', target: 'components/ui/slider.tsx', type: 'component' }],
    npmDependencies: { 'radix-ui': '^1.4.3' },
  },
  {
    name: 'switch',
    label: 'Switch',
    description: 'Toggle controls for on/off states with customizable track and thumb colors.',
    category: 'primitives',
    files: [{ path: 'components/ui/switch.tsx', target: 'components/ui/switch.tsx', type: 'component' }],
    npmDependencies: { 'radix-ui': '^1.4.3' },
  },
  {
    name: 'tabs',
    label: 'Tabs',
    description: 'Tabbed interfaces with default, line, pill, and segment variants.',
    category: 'navigation',
    files: [{ path: 'components/ui/tabs.tsx', target: 'components/ui/tabs.tsx', type: 'component' }],
    npmDependencies: { 'radix-ui': '^1.4.3' },
  },
  {
    name: 'tooltip',
    label: 'Tooltip',
    description: 'Contextual hover hints with configurable placement and delay.',
    category: 'overlay',
    files: [{ path: 'components/ui/tooltip.tsx', target: 'components/ui/tooltip.tsx', type: 'component' }],
    npmDependencies: { 'radix-ui': '^1.4.3' },
  },
  // --- Chart Cards ---
  {
    name: 'area-chart-card',
    label: 'Area Chart Card',
    description: 'Interactive area sparkline card with clip-path reveal animation and spring-animated cursor tracking.',
    category: 'charts',
    files: [
      { path: 'components/ui/cards/area-chart-card.tsx', target: 'components/ui/cards/area-chart-card.tsx', type: 'component' },
      { path: 'components/ui/chart.tsx', target: 'components/ui/chart.tsx', type: 'component' },
      { path: 'lib/format.ts', target: 'lib/format.ts', type: 'lib' },
      { path: 'components/ui/cards/data-contracts.ts', target: 'components/ui/cards/data-contracts.ts', type: 'types' },
    ],
    registryDependencies: ['card', 'skeleton'],
    npmDependencies: { 'recharts': '^3.0.0', 'motion': '^12.0.0' },
  },
  {
    name: 'bar-chart-card',
    label: 'Bar Chart Card',
    description: 'Bar chart with highlight strategies (max, last, hover) and animated reference line.',
    category: 'charts',
    files: [
      { path: 'components/ui/cards/bar-chart-card.tsx', target: 'components/ui/cards/bar-chart-card.tsx', type: 'component' },
      { path: 'components/ui/chart.tsx', target: 'components/ui/chart.tsx', type: 'component' },
      { path: 'lib/format.ts', target: 'lib/format.ts', type: 'lib' },
      { path: 'components/ui/cards/data-contracts.ts', target: 'components/ui/cards/data-contracts.ts', type: 'types' },
    ],
    registryDependencies: ['card', 'skeleton'],
    npmDependencies: { 'recharts': '^3.0.0', 'motion': '^12.0.0' },
  },
  {
    name: 'line-chart-card',
    label: 'Line Chart Card',
    description: 'Line chart with SVG glow filter and configurable curve types.',
    category: 'charts',
    files: [
      { path: 'components/ui/cards/line-chart-card.tsx', target: 'components/ui/cards/line-chart-card.tsx', type: 'component' },
      { path: 'components/ui/chart.tsx', target: 'components/ui/chart.tsx', type: 'component' },
      { path: 'lib/format.ts', target: 'lib/format.ts', type: 'lib' },
    ],
    registryDependencies: ['card', 'skeleton'],
    npmDependencies: { 'recharts': '^3.0.0' },
  },
  {
    name: 'metric-card',
    label: 'Metric Card',
    description: 'KPI cards in 3 sizes (sm/md/lg) with inline sparklines, CountUp animations, and trend badges.',
    category: 'charts',
    files: [
      { path: 'components/ui/cards/metric-card.tsx', target: 'components/ui/cards/metric-card.tsx', type: 'component' },
      { path: 'components/ui/chart.tsx', target: 'components/ui/chart.tsx', type: 'component' },
      { path: 'lib/format.ts', target: 'lib/format.ts', type: 'lib' },
    ],
    registryDependencies: ['card', 'skeleton'],
    npmDependencies: { 'recharts': '^3.0.0', 'react-countup': '^6.5.0' },
  },
  {
    name: 'radial-chart-card',
    label: 'Radial Chart Card',
    description: 'Radial bar chart with per-segment glow filter on hover and side legend.',
    category: 'charts',
    files: [
      { path: 'components/ui/cards/radial-chart-card.tsx', target: 'components/ui/cards/radial-chart-card.tsx', type: 'component' },
      { path: 'components/ui/chart.tsx', target: 'components/ui/chart.tsx', type: 'component' },
      { path: 'lib/format.ts', target: 'lib/format.ts', type: 'lib' },
      { path: 'components/ui/cards/data-contracts.ts', target: 'components/ui/cards/data-contracts.ts', type: 'types' },
    ],
    registryDependencies: ['card', 'skeleton'],
    npmDependencies: { 'recharts': '^3.0.0' },
  },
  {
    name: 'rounded-pie-chart-card',
    label: 'Rounded Pie Chart Card',
    description: 'Pie chart with rounded corners, hover sector expansion, and debounced interactions.',
    category: 'charts',
    files: [
      { path: 'components/ui/cards/rounded-pie-chart-card.tsx', target: 'components/ui/cards/rounded-pie-chart-card.tsx', type: 'component' },
      { path: 'components/ui/chart.tsx', target: 'components/ui/chart.tsx', type: 'component' },
      { path: 'lib/format.ts', target: 'lib/format.ts', type: 'lib' },
    ],
    registryDependencies: ['card', 'skeleton'],
    npmDependencies: { 'recharts': '^3.0.0' },
  },
  {
    name: 'dotted-multi-line-chart-card',
    label: 'Multi-Line Chart Card',
    description: 'Dual line chart with dashed primary and solid secondary lines.',
    category: 'charts',
    files: [
      { path: 'components/ui/cards/dotted-multi-line-chart-card.tsx', target: 'components/ui/cards/dotted-multi-line-chart-card.tsx', type: 'component' },
      { path: 'components/ui/chart.tsx', target: 'components/ui/chart.tsx', type: 'component' },
      { path: 'lib/format.ts', target: 'lib/format.ts', type: 'lib' },
    ],
    registryDependencies: ['card', 'skeleton'],
    npmDependencies: { 'recharts': '^3.0.0' },
  },
  {
    name: 'compact-cards',
    label: 'Compact Cards',
    description: 'Four specialized compact cards: LiveActivity, NextEvent, WhosOnline, SparkStats.',
    category: 'compact',
    files: [
      { path: 'components/ui/cards/compact-sm-variants.tsx', target: 'components/ui/cards/compact-sm-variants.tsx', type: 'component' },
      { path: 'components/ui/chart.tsx', target: 'components/ui/chart.tsx', type: 'component' },
      { path: 'lib/format.ts', target: 'lib/format.ts', type: 'lib' },
    ],
    registryDependencies: ['card', 'avatar', 'skeleton'],
    npmDependencies: { 'recharts': '^3.0.0' },
  },
];

/** Lookup a registry entry by name */
export function getRegistryComponent(name: string): RegistryComponent | undefined {
  return REGISTRY.find((c) => c.name === name);
}

/** Get source files for a component */
export function getComponentSources(name: string): Record<string, string> {
  return SOURCE_MAP[name] ?? {};
}
```

**Step 2: Create barrel export**

Create `src/registry/index.ts`:

```ts
export type { RegistryComponent, RegistryFile, RegistryProp, RegistryExample } from './schema';
export { REGISTRY, SOURCE_MAP, getRegistryComponent, getComponentSources } from './components';
```

**Step 3: Verify build + commit**

```bash
pnpm run build
git add src/registry/
git commit -m "feat: add component registry with raw source imports"
```

---

## Phase 3: Auto-Generated Props

### Task 7: Install ts-morph and create props extraction script

**Files:**
- Modify: `package.json` (devDependency)
- Create: `scripts/extract-props.ts`
- Create: `src/registry/generated-props.ts` (output)

**Step 1: Install ts-morph**

```bash
pnpm add -D ts-morph
```

**Step 2: Create the extraction script**

Create `scripts/extract-props.ts`:

```ts
/**
 * Extracts exported TypeScript interface props from component files
 * and writes them to src/registry/generated-props.ts
 *
 * Run: npx tsx scripts/extract-props.ts
 */
import { Project, SyntaxKind } from 'ts-morph';
import { writeFileSync } from 'fs';
import { resolve } from 'path';

const ROOT = resolve(import.meta.dirname, '..');

// Map of component name → file path → interface name patterns
const TARGETS: Record<string, { file: string; patterns: string[] }> = {
  accordion: { file: 'src/components/ui/accordion.tsx', patterns: ['AccordionProps'] },
  alert: { file: 'src/components/ui/alert.tsx', patterns: ['AlertProps'] },
  'animated-text': { file: 'src/components/ui/animated-text.tsx', patterns: ['AnimatedTextProps'] },
  avatar: { file: 'src/components/ui/avatar.tsx', patterns: ['AvatarProps'] },
  badge: { file: 'src/components/ui/badge.tsx', patterns: ['BadgeProps'] },
  button: { file: 'src/components/ui/button.tsx', patterns: ['ButtonProps'] },
  card: { file: 'src/components/ui/card.tsx', patterns: ['CardProps'] },
  checkbox: { file: 'src/components/ui/checkbox.tsx', patterns: ['CheckboxProps'] },
  'data-table': { file: 'src/components/ui/data-table.tsx', patterns: ['DataTableProps', 'DataTableColumn'] },
  dialog: { file: 'src/components/ui/dialog.tsx', patterns: ['DialogProps'] },
  drawer: { file: 'src/components/ui/drawer.tsx', patterns: ['DrawerContentProps'] },
  'dropdown-menu': { file: 'src/components/ui/dropdown-menu.tsx', patterns: ['DropdownMenuProps'] },
  input: { file: 'src/components/ui/input.tsx', patterns: ['InputProps'] },
  'navigation-menu': { file: 'src/components/ui/navigation-menu.tsx', patterns: ['NavigationMenuProps'] },
  popover: { file: 'src/components/ui/popover.tsx', patterns: ['PopoverProps'] },
  progress: { file: 'src/components/ui/progress.tsx', patterns: ['ProgressProps'] },
  slider: { file: 'src/components/ui/slider.tsx', patterns: ['SliderProps'] },
  switch: { file: 'src/components/ui/switch.tsx', patterns: ['SwitchProps'] },
  tabs: { file: 'src/components/ui/tabs.tsx', patterns: ['TabsProps'] },
  tooltip: { file: 'src/components/ui/tooltip.tsx', patterns: ['TooltipProps', 'TooltipContentProps'] },
  // Chart cards
  'area-chart-card': { file: 'src/components/ui/cards/area-chart-card.tsx', patterns: ['AreaChartCardProps'] },
  'bar-chart-card': { file: 'src/components/ui/cards/bar-chart-card.tsx', patterns: ['BarChartCardProps'] },
  'line-chart-card': { file: 'src/components/ui/cards/line-chart-card.tsx', patterns: ['LineChartCardProps'] },
  'metric-card': { file: 'src/components/ui/cards/metric-card.tsx', patterns: ['MetricCardProps'] },
  'radial-chart-card': { file: 'src/components/ui/cards/radial-chart-card.tsx', patterns: ['RadialChartCardProps'] },
  'rounded-pie-chart-card': { file: 'src/components/ui/cards/rounded-pie-chart-card.tsx', patterns: ['RoundedPieChartCardProps'] },
  'dotted-multi-line-chart-card': { file: 'src/components/ui/cards/dotted-multi-line-chart-card.tsx', patterns: ['DottedMultiLineChartCardProps'] },
};

interface ExtractedProp {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: string;
  description?: string;
}

function extractProps(): Record<string, ExtractedProp[]> {
  const project = new Project({
    tsConfigFilePath: resolve(ROOT, 'tsconfig.json'),
    skipAddingFilesFromTsConfig: true,
  });

  const result: Record<string, ExtractedProp[]> = {};

  for (const [componentName, { file, patterns }] of Object.entries(TARGETS)) {
    const filePath = resolve(ROOT, file);
    const sourceFile = project.addSourceFileAtPath(filePath);
    const props: ExtractedProp[] = [];

    for (const pattern of patterns) {
      // Try interfaces first
      const iface = sourceFile.getInterface(pattern);
      if (iface) {
        for (const prop of iface.getProperties()) {
          const jsDoc = prop.getJsDocs()[0];
          props.push({
            name: prop.getName(),
            type: prop.getType().getText(prop),
            required: !prop.hasQuestionToken(),
            description: jsDoc?.getDescription()?.trim(),
          });
        }
        continue;
      }

      // Try type aliases
      const typeAlias = sourceFile.getTypeAlias(pattern);
      if (typeAlias) {
        const typeNode = typeAlias.getTypeNode();
        if (typeNode?.getKind() === SyntaxKind.TypeLiteral) {
          for (const member of typeNode.asKindOrThrow(SyntaxKind.TypeLiteral).getMembers()) {
            if (member.getKind() === SyntaxKind.PropertySignature) {
              const propSig = member.asKindOrThrow(SyntaxKind.PropertySignature);
              props.push({
                name: propSig.getName(),
                type: propSig.getType().getText(propSig),
                required: !propSig.hasQuestionToken(),
              });
            }
          }
        }
      }
    }

    if (props.length > 0) {
      result[componentName] = props;
    }
  }

  return result;
}

// Run extraction
const allProps = extractProps();

// Generate output file
const output = `// AUTO-GENERATED — do not edit manually
// Run: npx tsx scripts/extract-props.ts

import type { RegistryProp } from './schema';

export const GENERATED_PROPS: Record<string, RegistryProp[]> = ${JSON.stringify(allProps, null, 2)};
`;

const outPath = resolve(ROOT, 'src/registry/generated-props.ts');
writeFileSync(outPath, output);
console.log(`Wrote props for ${Object.keys(allProps).length} components to ${outPath}`);
```

**Step 3: Add npm script**

Add to `package.json` scripts:
```json
"extract-props": "tsx scripts/extract-props.ts"
```

**Step 4: Run it**

```bash
pnpm run extract-props
```

**Step 5: Verify build + commit**

```bash
pnpm run build
git add scripts/extract-props.ts src/registry/generated-props.ts package.json pnpm-lock.yaml
git commit -m "feat: add auto-generated props extraction from TypeScript types"
```

---

## Phase 4: Redesigned Component Library Page

### Task 8: Rewrite ComponentLibrary.tsx with new layout

**Files:**
- Rewrite: `src/pages/ComponentLibrary.tsx`

This is the major rewrite. The new page uses the registry data model, docs components, and generated props.

**Structure of the new detail page:**

```
┌─────────────────────────────────────────────────────┐
│  ComponentName                                       │
│  Description text                                    │
│                                                      │
│  ┌────────────────────────────────────────────────┐  │
│  │          Live Preview                          │  │
│  ├────────────────────────────────────────────────┤  │
│  │  import { Badge } from "@/components/ui/badge" │  │
│  │  <Badge>Badge</Badge>                     [👁]  │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
│  ## Installation                                     │
│                                                      │
│  [CLI]  [Manual]                                     │
│                                                      │
│  CLI:   npx ui-studio add badge                      │
│                                                      │
│  Manual:                                             │
│    1. Install dependencies                           │
│    2. Copy component source  [Expand]                │
│    3. Update import paths                            │
│                                                      │
│  ## Usage                                            │
│    import { Badge } from "@/components/ui/badge"     │
│    <Badge>Badge</Badge>                              │
│                                                      │
│  ## Examples                                         │
│    ### Secondary                                     │
│    [ComponentPreview]                                │
│    ### Destructive                                   │
│    [ComponentPreview]                                │
│                                                      │
│  ## API Reference                                    │
│    | Prop    | Type     | Default  |                 │
│    |---------|----------|----------|                 │
│    | variant | string   | default  |                 │
│                                                      │
└─────────────────────────────────────────────────────┘
```

The full implementation of this page is the largest single task. Key decisions:

1. The `buildComponents()` function is replaced by the registry + a new `buildExamples()` that returns the live preview ReactNodes (those can't be serialized in the registry).
2. Examples are defined inline (preview JSX + code string) grouped by component slug.
3. The sidebar groups components by `category` from the registry.
4. The index grid uses the first example's preview as the thumbnail.

**Step 1:** Create `src/pages/component-library/PropsTable.tsx`

```tsx
import type { RegistryProp } from '@/registry/schema';

const T = {
  bg: '#0a0a0b',
  subtle: '#111113',
  surface: '#141416',
  text: '#f0ede8',
  textSec: '#9a9aa3',
  textMuted: '#6b6b72',
  brand: '#F5A623',
  border: 'rgba(255,255,255,0.08)',
};

interface PropsTableProps {
  props: RegistryProp[];
}

export function PropsTable({ props }: PropsTableProps) {
  if (props.length === 0) return null;

  return (
    <div style={{ border: `1px solid ${T.border}`, borderRadius: 12, overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, fontFamily: "'Space Mono', monospace" }}>
        <thead>
          <tr style={{ background: T.surface, borderBottom: `1px solid ${T.border}` }}>
            <th style={{ textAlign: 'left', padding: '10px 16px', color: T.textMuted, fontWeight: 500, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Prop</th>
            <th style={{ textAlign: 'left', padding: '10px 16px', color: T.textMuted, fontWeight: 500, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Type</th>
            <th style={{ textAlign: 'left', padding: '10px 16px', color: T.textMuted, fontWeight: 500, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Default</th>
            <th style={{ textAlign: 'left', padding: '10px 16px', color: T.textMuted, fontWeight: 500, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Description</th>
          </tr>
        </thead>
        <tbody>
          {props.map((prop) => (
            <tr key={prop.name} style={{ borderBottom: `1px solid ${T.border}` }}>
              <td style={{ padding: '10px 16px', color: T.text, fontWeight: 600 }}>
                {prop.name}
                {prop.required && <span style={{ color: T.brand, marginLeft: 2 }}>*</span>}
              </td>
              <td style={{ padding: '10px 16px', color: '#818CF8' }}>{prop.type}</td>
              <td style={{ padding: '10px 16px', color: T.textMuted }}>{prop.defaultValue ?? '—'}</td>
              <td style={{ padding: '10px 16px', color: T.textSec, fontFamily: "'Satoshi', system-ui, sans-serif" }}>{prop.description ?? ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

**Step 2:** Create `src/pages/component-library/InstallationSection.tsx`

```tsx
import { useState } from 'react';
import { CodeBlock } from '@/components/docs/CodeBlock';
import { ComponentSource } from '@/components/docs/ComponentSource';
import type { RegistryComponent } from '@/registry/schema';
import { getComponentSources } from '@/registry';

const T = {
  surface: '#141416',
  text: '#f0ede8',
  textSec: '#9a9aa3',
  textMuted: '#6b6b72',
  brand: '#F5A623',
  border: 'rgba(255,255,255,0.08)',
};

interface InstallationSectionProps {
  component: RegistryComponent;
}

export function InstallationSection({ component }: InstallationSectionProps) {
  const [tab, setTab] = useState<'cli' | 'manual'>('cli');
  const sources = getComponentSources(component.name);
  const sourceEntries = Object.entries(sources);

  const npmDeps = component.npmDependencies
    ? Object.entries(component.npmDependencies).map(([pkg, ver]) => `${pkg}@${ver}`).join(' ')
    : null;

  return (
    <div>
      {/* Tab buttons */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 16, borderBottom: `1px solid ${T.border}` }}>
        {(['cli', 'manual'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 12,
              letterSpacing: '0.04em',
              padding: '10px 20px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              color: tab === t ? T.brand : T.textMuted,
              borderBottom: `2px solid ${tab === t ? T.brand : 'transparent'}`,
              background: 'transparent',
              border: 'none',
              borderBottomWidth: 2,
              borderBottomStyle: 'solid',
              borderBottomColor: tab === t ? T.brand : 'transparent',
              textTransform: 'uppercase' as const,
            }}
          >
            {t === 'cli' ? 'CLI' : 'Manual'}
          </button>
        ))}
      </div>

      {tab === 'cli' ? (
        <CodeBlock
          code={`npx ui-studio add ${component.name}`}
          language="bash"
          collapsible={false}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Step 1: Install dependencies */}
          {npmDeps && (
            <div>
              <h4 style={{ fontFamily: "'Satoshi', system-ui", fontSize: 14, fontWeight: 600, color: T.text, marginBottom: 8 }}>
                1. Install dependencies
              </h4>
              <CodeBlock code={`pnpm add ${npmDeps}`} language="bash" collapsible={false} />
            </div>
          )}

          {/* Step 2: Copy component source */}
          <div>
            <h4 style={{ fontFamily: "'Satoshi', system-ui", fontSize: 14, fontWeight: 600, color: T.text, marginBottom: 8 }}>
              {npmDeps ? '2' : '1'}. Copy component source
            </h4>
            {sourceEntries.map(([path, code]) => (
              <div key={path} style={{ marginBottom: 12 }}>
                <ComponentSource code={code} title={path} maxHeight={200} />
              </div>
            ))}
          </div>

          {/* Step 3: Update imports */}
          <div>
            <h4 style={{ fontFamily: "'Satoshi', system-ui", fontSize: 14, fontWeight: 600, color: T.textSec, marginBottom: 4 }}>
              {npmDeps ? '3' : '2'}. Update import paths to match your project structure.
            </h4>
          </div>
        </div>
      )}
    </div>
  );
}
```

**Step 3:** Create `src/pages/component-library/DetailPage.tsx`

This renders the full detail view for a single component: Preview, Installation, Usage, Examples, API Reference.

```tsx
import { useParams, useNavigate } from 'react-router-dom';
import { ComponentPreview } from '@/components/docs';
import { CodeBlock } from '@/components/docs/CodeBlock';
import { getRegistryComponent, getComponentSources } from '@/registry';
import { GENERATED_PROPS } from '@/registry/generated-props';
import { EXAMPLES } from './examples';
import { PropsTable } from './PropsTable';
import { InstallationSection } from './InstallationSection';

const T = {
  bg: '#0a0a0b',
  subtle: '#111113',
  text: '#f0ede8',
  textSec: '#9a9aa3',
  textMuted: '#6b6b72',
  brand: '#F5A623',
  border: 'rgba(255,255,255,0.08)',
};

export function DetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const component = slug ? getRegistryComponent(slug) : undefined;
  const examples = slug ? EXAMPLES[slug] ?? [] : [];
  const props = slug ? GENERATED_PROPS[slug] ?? [] : [];
  const sources = slug ? getComponentSources(slug) : {};
  const mainFile = component?.files[0];

  if (!component) {
    return (
      <div style={{ padding: 48, textAlign: 'center', color: T.textMuted }}>
        Component not found.{' '}
        <button onClick={() => navigate('/library')} style={{ color: T.brand, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
          Back to library
        </button>
      </div>
    );
  }

  const usageCode = mainFile
    ? `import { ${component.label} } from "@/components/ui/${component.name}"\n\n<${component.label} />`
    : '';

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '48px 24px' }}>
      {/* Back link */}
      <button
        onClick={() => navigate('/library')}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          color: T.textMuted, background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 13, fontFamily: "'Satoshi', system-ui", marginBottom: 32,
        }}
      >
        &larr; All Components
      </button>

      {/* Header */}
      <h1 style={{
        fontFamily: "'Cabinet Grotesk', system-ui", fontSize: 36, fontWeight: 900,
        letterSpacing: '-0.02em', color: T.text, marginBottom: 8,
      }}>
        {component.label}
      </h1>
      <p style={{ fontSize: 16, color: T.textSec, lineHeight: 1.6, marginBottom: 40 }}>
        {component.description}
      </p>

      {/* Default preview */}
      {examples.length > 0 && (
        <div style={{ marginBottom: 48 }}>
          <ComponentPreview code={examples[0].code}>
            {examples[0].preview}
          </ComponentPreview>
        </div>
      )}

      {/* Installation */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontFamily: "'Cabinet Grotesk', system-ui", fontSize: 24, fontWeight: 800, color: T.text, marginBottom: 20 }}>
          Installation
        </h2>
        <InstallationSection component={component} />
      </section>

      {/* Usage */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontFamily: "'Cabinet Grotesk', system-ui", fontSize: 24, fontWeight: 800, color: T.text, marginBottom: 20 }}>
          Usage
        </h2>
        <CodeBlock code={usageCode} language="tsx" collapsible={false} />
      </section>

      {/* Examples (skip first — already shown as default preview) */}
      {examples.length > 1 && (
        <section style={{ marginBottom: 48 }}>
          <h2 style={{ fontFamily: "'Cabinet Grotesk', system-ui", fontSize: 24, fontWeight: 800, color: T.text, marginBottom: 20 }}>
            Examples
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {examples.slice(1).map((ex) => (
              <div key={ex.title}>
                <h3 style={{ fontFamily: "'Satoshi', system-ui", fontSize: 16, fontWeight: 600, color: T.text, marginBottom: 12 }}>
                  {ex.title}
                </h3>
                <ComponentPreview code={ex.code}>
                  {ex.preview}
                </ComponentPreview>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* API Reference */}
      {props.length > 0 && (
        <section style={{ marginBottom: 48 }}>
          <h2 style={{ fontFamily: "'Cabinet Grotesk', system-ui", fontSize: 24, fontWeight: 800, color: T.text, marginBottom: 20 }}>
            API Reference
          </h2>
          <PropsTable props={props} />
        </section>
      )}
    </div>
  );
}
```

**Step 4:** Create `src/pages/component-library/examples.tsx`

This file contains all live preview JSX and code strings for every component. **Migrate all existing examples from the current `ComponentLibrary.tsx`'s `buildComponents()` function.** The structure is:

```tsx
import type { ReactNode } from 'react';

// Import all components used in previews
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
// ... import all other components needed for previews

export interface LibraryExample {
  title: string;
  preview: ReactNode;
  code: string;
}

/**
 * Examples for every component, keyed by registry slug.
 * The first example is used as the default preview on the detail page.
 * All subsequent examples appear in the "Examples" section.
 *
 * IMPORTANT: Migrate all examples from the existing ComponentLibrary.tsx
 * buildComponents() function. Each component should have at least 2 examples.
 * For chart cards, create example data inline.
 */
export const EXAMPLES: Record<string, LibraryExample[]> = {
  badge: [
    {
      title: 'Default',
      preview: <Badge>Badge</Badge>,
      code: `import { Badge } from "@/components/ui/badge"

<Badge>Badge</Badge>`,
    },
    {
      title: 'Secondary',
      preview: <Badge variant="secondary">Secondary</Badge>,
      code: `<Badge variant="secondary">Secondary</Badge>`,
    },
    {
      title: 'Destructive',
      preview: <Badge variant="destructive">Destructive</Badge>,
      code: `<Badge variant="destructive">Destructive</Badge>`,
    },
    {
      title: 'Outline',
      preview: <Badge variant="outline">Outline</Badge>,
      code: `<Badge variant="outline">Outline</Badge>`,
    },
  ],

  button: [
    {
      title: 'Default',
      preview: <Button>Button</Button>,
      code: `import { Button } from "@/components/ui/button"

<Button>Button</Button>`,
    },
    {
      title: 'Variants',
      preview: (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Button variant="default">Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>
      ),
      code: `<Button variant="default">Default</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>`,
    },
    {
      title: 'Sizes',
      preview: (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
        </div>
      ),
      code: `<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>`,
    },
  ],

  // ... Continue for ALL components. Each component must have at least 2 examples.
  // Copy the preview JSX and code strings from the current ComponentLibrary.tsx
  // buildComponents() function for: accordion, alert, animated-text, avatar,
  // card, checkbox, data-table, dialog, drawer, dropdown-menu, input,
  // navigation-menu, popover, progress, slider, switch, tabs, tooltip.
  //
  // For chart cards, create example data like:
  // 'area-chart-card': [{ title: 'Default', preview: <AreaChartCard ... />, code: '...' }],
};
```

> **CRITICAL FOR IMPLEMENTER**: The existing `ComponentLibrary.tsx` has ~1500 lines with all the example previews in the `buildComponents()` function. Extract every `{ title, preview, code }` triple from each component's `examples` array in that function and migrate them here. Do not invent new examples — copy the existing ones. Add chart card examples with simple inline data.

**Step 5:** Rewrite `src/pages/ComponentLibrary.tsx` as the router/layout

```tsx
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { REGISTRY } from '@/registry';
import { EXAMPLES } from './component-library/examples';
import { DetailPage } from './component-library/DetailPage';

const T = {
  bg: '#0a0a0b',
  subtle: '#111113',
  surface: '#141416',
  elevated: '#1a1a1d',
  text: '#f0ede8',
  textSec: '#9a9aa3',
  textMuted: '#6b6b72',
  brand: '#F5A623',
  border: 'rgba(255,255,255,0.08)',
  borderStrong: 'rgba(255,255,255,0.18)',
};

const CATEGORY_ORDER = ['primitives', 'data-display', 'feedback', 'overlay', 'navigation', 'charts', 'compact'] as const;
const CATEGORY_LABELS: Record<string, string> = {
  primitives: 'Primitives',
  'data-display': 'Data Display',
  feedback: 'Feedback',
  overlay: 'Overlay',
  navigation: 'Navigation',
  charts: 'Charts',
  compact: 'Compact',
};

/* ── Sidebar ─────────────────────── */
function Sidebar() {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();

  return (
    <aside style={{
      width: 240, flexShrink: 0, borderRight: `1px solid ${T.border}`,
      padding: '24px 0', height: '100vh', position: 'sticky', top: 0,
      overflowY: 'auto', background: T.bg,
    }}>
      <div
        onClick={() => navigate('/library')}
        style={{
          padding: '8px 20px', fontSize: 14, fontWeight: 700,
          color: T.brand, cursor: 'pointer', fontFamily: "'Cabinet Grotesk', system-ui",
          marginBottom: 16,
        }}
      >
        Components
      </div>
      {CATEGORY_ORDER.map((cat) => {
        const items = REGISTRY.filter((c) => c.category === cat);
        if (items.length === 0) return null;
        return (
          <div key={cat} style={{ marginBottom: 16 }}>
            <div style={{
              padding: '4px 20px', fontSize: 11, fontWeight: 500,
              color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em',
              fontFamily: "'Space Mono', monospace",
            }}>
              {CATEGORY_LABELS[cat] ?? cat}
            </div>
            {items.map((c) => (
              <div
                key={c.name}
                onClick={() => navigate(`/library/${c.name}`)}
                style={{
                  padding: '6px 20px 6px 28px', fontSize: 13, cursor: 'pointer',
                  color: slug === c.name ? T.text : T.textSec,
                  background: slug === c.name ? T.surface : 'transparent',
                  borderLeft: slug === c.name ? `2px solid ${T.brand}` : '2px solid transparent',
                  fontFamily: "'Satoshi', system-ui",
                  transition: 'all 0.15s',
                }}
              >
                {c.label}
              </div>
            ))}
          </div>
        );
      })}
    </aside>
  );
}

/* ── Index Grid ─────────────────────── */
function IndexGrid() {
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '48px 24px' }}>
      <h1 style={{
        fontFamily: "'Cabinet Grotesk', system-ui", fontSize: 40, fontWeight: 900,
        letterSpacing: '-0.02em', color: T.text, marginBottom: 8,
      }}>
        Components
      </h1>
      <p style={{ fontSize: 16, color: T.textSec, lineHeight: 1.6, marginBottom: 40 }}>
        Browse all {REGISTRY.length} components with live previews, source code, and copy-paste installation.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
        {REGISTRY.map((c) => (
          <div
            key={c.name}
            onClick={() => navigate(`/library/${c.name}`)}
            style={{
              padding: 20, background: T.elevated, border: `1px solid ${T.border}`,
              borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = T.borderStrong;
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = T.border;
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{
              fontFamily: "'Space Mono', monospace", fontSize: 10,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              color: T.brand, marginBottom: 10,
            }}>
              {CATEGORY_LABELS[c.category] ?? c.category}
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, color: T.text, marginBottom: 4 }}>{c.label}</div>
            <div style={{ fontSize: 13, color: T.textMuted, lineHeight: 1.5 }}>{c.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Main ─────────────────────── */
export default function ComponentLibrary() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: T.bg, color: T.text }}>
      <Sidebar />
      <main style={{ flex: 1, minWidth: 0 }}>
        <Routes>
          <Route index element={<IndexGrid />} />
          <Route path=":slug" element={<DetailPage />} />
        </Routes>
      </main>
    </div>
  );
}
```

**Step 6:** Verify build + commit

```bash
pnpm run build
git add src/pages/
git commit -m "feat: redesign component library with ReUI-style docs layout"
```

---

## Phase 5: Custom CLI

### Task 9: Set up CLI package

**Files:**
- Create: `packages/cli/package.json`
- Create: `packages/cli/src/index.ts`
- Create: `packages/cli/src/commands/add.ts`
- Create: `packages/cli/src/registry.ts`
- Create: `packages/cli/tsconfig.json`
- Modify: `package.json` (root — add workspaces)

The CLI is a separate package in a pnpm workspace. It fetches registry data from a hosted JSON endpoint (or GitHub raw URL) and copies component files into the user's project.

**Step 1: Set up pnpm workspace**

Create `pnpm-workspace.yaml`:

```yaml
packages:
  - 'packages/*'
```

**Step 2: Create CLI package**

Create `packages/cli/package.json`:

```json
{
  "name": "ui-studio",
  "version": "0.1.0",
  "description": "CLI for installing UI Studio components",
  "type": "module",
  "bin": {
    "ui-studio": "./dist/index.js"
  },
  "scripts": {
    "build": "tsup src/index.ts --format esm --dts",
    "dev": "tsup src/index.ts --format esm --watch"
  },
  "dependencies": {
    "commander": "^12.0.0",
    "chalk": "^5.3.0",
    "ora": "^8.0.0",
    "prompts": "^2.4.2",
    "fs-extra": "^11.2.0"
  },
  "devDependencies": {
    "@types/fs-extra": "^11.0.0",
    "@types/prompts": "^2.4.0",
    "tsup": "^8.0.0",
    "typescript": "^5.3.0"
  }
}
```

**Step 3: Create the CLI entry point**

Create `packages/cli/src/index.ts`:

```ts
#!/usr/bin/env node
import { Command } from 'commander';
import { add } from './commands/add.js';

const program = new Command()
  .name('ui-studio')
  .description('Install UI Studio components into your project')
  .version('0.1.0');

program
  .command('add')
  .description('Add a component to your project')
  .argument('<components...>', 'Component names to install')
  .option('-d, --dir <dir>', 'Target directory', 'src')
  .option('-o, --overwrite', 'Overwrite existing files', false)
  .option('--dry-run', 'Show what would be installed without writing files', false)
  .action(add);

program.parse();
```

**Step 4: Create registry fetcher**

Create `packages/cli/src/registry.ts`:

```ts
import chalk from 'chalk';

const REGISTRY_URL = 'https://raw.githubusercontent.com/<owner>/ui-studio-oss/main/public/registry.json';

export interface RegistryEntry {
  name: string;
  label: string;
  description: string;
  files: { path: string; target: string; content: string }[];
  registryDependencies?: string[];
  npmDependencies?: Record<string, string>;
}

let cachedRegistry: RegistryEntry[] | null = null;

export async function fetchRegistry(): Promise<RegistryEntry[]> {
  if (cachedRegistry) return cachedRegistry;

  try {
    const res = await fetch(REGISTRY_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    cachedRegistry = await res.json();
    return cachedRegistry!;
  } catch (e) {
    console.error(chalk.red(`Failed to fetch registry: ${e}`));
    process.exit(1);
  }
}

export async function resolveComponent(name: string): Promise<RegistryEntry | undefined> {
  const registry = await fetchRegistry();
  return registry.find((c) => c.name === name);
}

export async function resolveDependencies(name: string): Promise<string[]> {
  const component = await resolveComponent(name);
  if (!component) return [];
  const deps = component.registryDependencies ?? [];
  const allDeps: string[] = [];
  for (const dep of deps) {
    allDeps.push(dep, ...(await resolveDependencies(dep)));
  }
  return [...new Set(allDeps)];
}
```

**Step 5: Create the add command**

Create `packages/cli/src/commands/add.ts`:

```ts
import { resolve, dirname } from 'path';
import { existsSync } from 'fs';
import fse from 'fs-extra';
import chalk from 'chalk';
import ora from 'ora';
import { resolveComponent, resolveDependencies } from '../registry.js';

interface AddOptions {
  dir: string;
  overwrite: boolean;
  dryRun: boolean;
}

export async function add(components: string[], options: AddOptions) {
  const spinner = ora('Resolving components...').start();

  // Resolve all components + dependencies
  const toInstall = new Set<string>();
  for (const name of components) {
    toInstall.add(name);
    const deps = await resolveDependencies(name);
    deps.forEach((d) => toInstall.add(d));
  }

  spinner.text = `Installing ${toInstall.size} component(s)...`;

  const allNpmDeps: Record<string, string> = {};
  const written: string[] = [];
  const skipped: string[] = [];

  for (const name of toInstall) {
    const component = await resolveComponent(name);
    if (!component) {
      spinner.warn(chalk.yellow(`Component "${name}" not found in registry`));
      continue;
    }

    // Collect npm deps
    if (component.npmDependencies) {
      Object.assign(allNpmDeps, component.npmDependencies);
    }

    // Write files
    for (const file of component.files) {
      const targetPath = resolve(process.cwd(), options.dir, file.target);

      if (existsSync(targetPath) && !options.overwrite) {
        skipped.push(file.target);
        continue;
      }

      if (!options.dryRun) {
        await fse.ensureDir(dirname(targetPath));
        await fse.writeFile(targetPath, file.content);
      }
      written.push(file.target);
    }
  }

  spinner.succeed('Done!');

  // Report
  if (written.length > 0) {
    console.log(chalk.green(`\n  Created ${written.length} file(s):`));
    written.forEach((f) => console.log(chalk.dim(`    ${f}`)));
  }
  if (skipped.length > 0) {
    console.log(chalk.yellow(`\n  Skipped ${skipped.length} existing file(s) (use --overwrite):`));
    skipped.forEach((f) => console.log(chalk.dim(`    ${f}`)));
  }

  // npm deps
  const depsToInstall = Object.entries(allNpmDeps);
  if (depsToInstall.length > 0) {
    console.log(chalk.cyan('\n  Required dependencies:'));
    const installCmd = depsToInstall.map(([pkg, ver]) => `${pkg}@${ver}`).join(' ');
    console.log(chalk.dim(`    pnpm add ${installCmd}\n`));
  }
}
```

**Step 6: Build the registry JSON for hosting**

Create a build script `scripts/build-registry.ts` that reads `src/registry/components.ts` and the raw source files, then outputs `public/registry.json` with the file contents embedded:

```ts
/**
 * Builds public/registry.json from the registry metadata + raw component source files.
 * The CLI fetches this JSON to install components.
 *
 * Run: npx tsx scripts/build-registry.ts
 */
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const ROOT = resolve(import.meta.dirname, '..');
const SRC = resolve(ROOT, 'src');

// We import the compiled registry types, but read files from disk (not Vite ?raw)
// This duplicates the REGISTRY array here to avoid needing a build step first.
// In a more sophisticated setup, you'd compile src/registry/components.ts first.

interface RegistryFile {
  path: string;
  target: string;
  type: string;
}

interface RegistryEntry {
  name: string;
  label: string;
  description: string;
  category: string;
  files: RegistryFile[];
  registryDependencies?: string[];
  npmDependencies?: Record<string, string>;
}

interface RegistryJsonEntry {
  name: string;
  label: string;
  description: string;
  files: { path: string; target: string; content: string }[];
  registryDependencies?: string[];
  npmDependencies?: Record<string, string>;
}

// Read the registry source file and extract REGISTRY array via simple parsing
// Alternatively, we import it dynamically. For simplicity, we read file paths
// from a known list that mirrors src/registry/components.ts.

// Known component list with their source file paths (mirrors REGISTRY + SOURCE_MAP)
const COMPONENTS: RegistryEntry[] = [
  { name: 'accordion', label: 'Accordion', description: 'Collapsible content sections', category: 'primitives', files: [{ path: 'components/ui/accordion.tsx', target: 'components/ui/accordion.tsx', type: 'component' }], npmDependencies: { 'radix-ui': '^1.4.3', 'motion': '^12.0.0' } },
  { name: 'alert', label: 'Alert', description: 'Contextual feedback messages', category: 'feedback', files: [{ path: 'components/ui/alert.tsx', target: 'components/ui/alert.tsx', type: 'component' }], npmDependencies: { 'class-variance-authority': '^0.7.0' } },
  { name: 'animated-text', label: 'Animated Text', description: 'Text with entrance animations', category: 'feedback', files: [{ path: 'components/ui/animated-text.tsx', target: 'components/ui/animated-text.tsx', type: 'component' }], npmDependencies: { 'motion': '^12.0.0' } },
  { name: 'avatar', label: 'Avatar', description: 'User representations', category: 'data-display', files: [{ path: 'components/ui/avatar.tsx', target: 'components/ui/avatar.tsx', type: 'component' }], npmDependencies: { 'radix-ui': '^1.4.3' } },
  { name: 'badge', label: 'Badge', description: 'Small status indicators', category: 'data-display', files: [{ path: 'components/ui/badge.tsx', target: 'components/ui/badge.tsx', type: 'component' }], npmDependencies: { 'class-variance-authority': '^0.7.0' } },
  { name: 'button', label: 'Button', description: 'Interactive controls for actions', category: 'primitives', files: [{ path: 'components/ui/button.tsx', target: 'components/ui/button.tsx', type: 'component' }], npmDependencies: { 'class-variance-authority': '^0.7.0', 'radix-ui': '^1.4.3' } },
  { name: 'card', label: 'Card', description: 'Surface containers', category: 'data-display', files: [{ path: 'components/ui/card.tsx', target: 'components/ui/card.tsx', type: 'component' }], npmDependencies: { 'class-variance-authority': '^0.7.0' } },
  { name: 'checkbox', label: 'Checkbox', description: 'Toggle controls', category: 'primitives', files: [{ path: 'components/ui/checkbox.tsx', target: 'components/ui/checkbox.tsx', type: 'component' }], npmDependencies: { 'radix-ui': '^1.4.3' } },
  { name: 'data-table', label: 'Data Table', description: 'Sortable, styled tables', category: 'data-display', files: [{ path: 'components/ui/data-table.tsx', target: 'components/ui/data-table.tsx', type: 'component' }], npmDependencies: { 'lucide-react': '^0.460.0' } },
  { name: 'dialog', label: 'Dialog', description: 'Modal overlays', category: 'overlay', files: [{ path: 'components/ui/dialog.tsx', target: 'components/ui/dialog.tsx', type: 'component' }], npmDependencies: { 'radix-ui': '^1.4.3' } },
  { name: 'drawer', label: 'Drawer', description: 'Slide-in panels', category: 'overlay', files: [{ path: 'components/ui/drawer.tsx', target: 'components/ui/drawer.tsx', type: 'component' }], npmDependencies: { 'radix-ui': '^1.4.3', 'motion': '^12.0.0' } },
  { name: 'dropdown-menu', label: 'Dropdown Menu', description: 'Contextual menus', category: 'navigation', files: [{ path: 'components/ui/dropdown-menu.tsx', target: 'components/ui/dropdown-menu.tsx', type: 'component' }], npmDependencies: { 'radix-ui': '^1.4.3' } },
  { name: 'input', label: 'Input', description: 'Text input fields', category: 'primitives', files: [{ path: 'components/ui/input.tsx', target: 'components/ui/input.tsx', type: 'component' }] },
  { name: 'navigation-menu', label: 'Navigation Menu', description: 'Horizontal navigation', category: 'navigation', files: [{ path: 'components/ui/navigation-menu.tsx', target: 'components/ui/navigation-menu.tsx', type: 'component' }], npmDependencies: { 'radix-ui': '^1.4.3' } },
  { name: 'popover', label: 'Popover', description: 'Floating content panels', category: 'overlay', files: [{ path: 'components/ui/popover.tsx', target: 'components/ui/popover.tsx', type: 'component' }], npmDependencies: { 'radix-ui': '^1.4.3' } },
  { name: 'progress', label: 'Progress', description: 'Progress indicators', category: 'feedback', files: [{ path: 'components/ui/progress.tsx', target: 'components/ui/progress.tsx', type: 'component' }], npmDependencies: { 'radix-ui': '^1.4.3' } },
  { name: 'slider', label: 'Slider', description: 'Range selection controls', category: 'primitives', files: [{ path: 'components/ui/slider.tsx', target: 'components/ui/slider.tsx', type: 'component' }], npmDependencies: { 'radix-ui': '^1.4.3' } },
  { name: 'switch', label: 'Switch', description: 'Toggle controls for on/off', category: 'primitives', files: [{ path: 'components/ui/switch.tsx', target: 'components/ui/switch.tsx', type: 'component' }], npmDependencies: { 'radix-ui': '^1.4.3' } },
  { name: 'tabs', label: 'Tabs', description: 'Tabbed interfaces', category: 'navigation', files: [{ path: 'components/ui/tabs.tsx', target: 'components/ui/tabs.tsx', type: 'component' }], npmDependencies: { 'radix-ui': '^1.4.3' } },
  { name: 'tooltip', label: 'Tooltip', description: 'Contextual hover hints', category: 'overlay', files: [{ path: 'components/ui/tooltip.tsx', target: 'components/ui/tooltip.tsx', type: 'component' }], npmDependencies: { 'radix-ui': '^1.4.3' } },
];

function buildRegistry(): RegistryJsonEntry[] {
  return COMPONENTS.map((comp) => {
    const files = comp.files.map((f) => {
      const absPath = resolve(SRC, f.path);
      if (!existsSync(absPath)) {
        console.warn(`  WARN: Missing file ${absPath} for component ${comp.name}`);
        return { path: f.path, target: f.target, content: `// File not found: ${f.path}` };
      }
      return {
        path: f.path,
        target: f.target,
        content: readFileSync(absPath, 'utf-8'),
      };
    });

    return {
      name: comp.name,
      label: comp.label,
      description: comp.description,
      files,
      registryDependencies: comp.registryDependencies,
      npmDependencies: comp.npmDependencies,
    };
  });
}

const registry = buildRegistry();
const outPath = resolve(ROOT, 'public', 'registry.json');
writeFileSync(outPath, JSON.stringify(registry, null, 2));
console.log(`Built registry with ${registry.length} components → ${outPath}`);
```

**Step 7: Add scripts to root package.json**

```json
"build-registry": "tsx scripts/build-registry.ts",
"prebuild": "tsx scripts/extract-props.ts"
```

**Step 8: Verify + commit**

```bash
cd packages/cli && pnpm install && pnpm run build
cd ../..
pnpm run build-registry
git add packages/cli/ scripts/build-registry.ts pnpm-workspace.yaml public/registry.json
git commit -m "feat: add ui-studio CLI package with add command"
```

---

## Phase 6: Retrofit All Components

### Task 10: Define examples for all 28 components

**Files:**
- Create/Modify: `src/pages/component-library/examples.tsx`

This is the example data — every component gets at least 2 examples with live preview JSX and usage code strings. The existing examples from the current ComponentLibrary.tsx are migrated here, organized by component slug.

The structure is:

```ts
export interface LibraryExample {
  title: string;
  preview: ReactNode;
  code: string;
}

export const EXAMPLES: Record<string, LibraryExample[]> = {
  accordion: [
    { title: 'Default', preview: <AccordionDefault />, code: '...' },
    { title: 'Bordered', preview: <AccordionBordered />, code: '...' },
  ],
  // ... all 28 components
};
```

This task migrates ALL existing examples from the current `buildComponents()` function and adds examples for the chart/metric/compact cards.

**Step 1:** Extract all example JSX from current ComponentLibrary.tsx into the new file.

**Step 2:** Add examples for chart cards (area, bar, line, radial, pie, multi-line, metric, compact).

**Step 3:** Verify build + commit.

---

### Task 11: Wire everything together and verify

**Step 1:** Ensure the registry, examples, generated props, and docs components all integrate cleanly.

**Step 2:** Run full build:

```bash
pnpm run extract-props
pnpm run build-registry
pnpm run build
```

**Step 3:** Manual verification:
- Visit `/library` — index grid shows all components grouped by category
- Click into any component — see Installation (CLI/Manual), Usage, Examples, API Reference
- Code blocks have shiki syntax highlighting
- Source code is collapsible with Expand/Collapse
- Copy button works
- Props table renders auto-generated data
- Chart cards show their dependency files in tabbed view

**Step 4:** Commit

```bash
git add -A
git commit -m "feat: complete component library redesign with docs, registry, and CLI"
```

---

## Execution Summary

| Phase | Tasks | Key Deliverable |
|-------|-------|----------------|
| 1 — Shiki + CodeBlock | Tasks 1-4 | CodeBlock, ComponentPreview, ComponentSource |
| 2 — Registry | Tasks 5-6 | Schema, component registry, ?raw imports |
| 3 — Props | Task 7 | ts-morph script, generated-props.ts |
| 4 — Page Redesign | Task 8 | New ComponentLibrary layout |
| 5 — CLI | Task 9 | `npx ui-studio add` command |
| 6 — Retrofit | Tasks 10-11 | All 28 components with full docs |
