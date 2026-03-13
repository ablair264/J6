/**
 * build-registry.ts
 *
 * Reads source files from src/ and writes public/registry.json.
 * Run with: pnpm run build-registry
 *
 * This is a Node script (tsx) — it reads files via fs, not Vite ?raw imports.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '..');
const SRC = resolve(ROOT, 'src');
const OUT = resolve(ROOT, 'public', 'registry.json');

// ---------------------------------------------------------------------------
// Registry metadata — mirrors src/registry/components.ts (without ?raw imports)
// ---------------------------------------------------------------------------

interface RegistryFile {
  path: string;
  target: string;
  type: 'component' | 'lib' | 'types' | 'css';
}

interface RegistryComponent {
  name: string;
  label: string;
  description: string;
  category: string;
  files: RegistryFile[];
  registryDependencies?: string[];
  npmDependencies?: Record<string, string>;
}

const REGISTRY: RegistryComponent[] = [
  // ── Primitives ─────────────────────────────────────────────────────────────
  {
    name: 'accordion',
    label: 'Accordion',
    description: 'Vertically stacked sections that expand and collapse with animated transitions.',
    category: 'primitives',
    files: [
      { path: 'components/ui/accordion.tsx', target: 'components/ui/accordion.tsx', type: 'component' },
    ],
    npmDependencies: { 'radix-ui': 'latest', 'motion': 'latest' },
  },
  {
    name: 'alert',
    label: 'Alert',
    description: 'Displays a callout for user attention with title and description variants.',
    category: 'primitives',
    files: [
      { path: 'components/ui/alert.tsx', target: 'components/ui/alert.tsx', type: 'component' },
    ],
  },
  {
    name: 'avatar',
    label: 'Avatar',
    description: 'Circular image component with fallback initials for representing users.',
    category: 'primitives',
    files: [
      { path: 'components/ui/avatar.tsx', target: 'components/ui/avatar.tsx', type: 'component' },
    ],
    npmDependencies: { 'radix-ui': 'latest' },
  },
  {
    name: 'badge',
    label: 'Badge',
    description: 'Small status indicator for labels, counts, and category tags.',
    category: 'primitives',
    files: [
      { path: 'components/ui/badge.tsx', target: 'components/ui/badge.tsx', type: 'component' },
    ],
  },
  {
    name: 'button',
    label: 'Button',
    description: 'Accessible button with multiple variants, sizes, and loading states.',
    category: 'primitives',
    files: [
      { path: 'components/ui/button.tsx', target: 'components/ui/button.tsx', type: 'component' },
      { path: 'lib/utils.ts', target: 'lib/utils.ts', type: 'lib' },
    ],
    npmDependencies: { 'class-variance-authority': 'latest' },
  },
  {
    name: 'card',
    label: 'Card',
    description: 'Flexible container with header, content, and footer sections.',
    category: 'primitives',
    files: [
      { path: 'components/ui/card.tsx', target: 'components/ui/card.tsx', type: 'component' },
    ],
  },
  {
    name: 'checkbox',
    label: 'Checkbox',
    description: 'Accessible checkbox input built on Radix UI primitives.',
    category: 'primitives',
    files: [
      { path: 'components/ui/checkbox.tsx', target: 'components/ui/checkbox.tsx', type: 'component' },
    ],
    npmDependencies: { 'radix-ui': 'latest' },
  },
  {
    name: 'input',
    label: 'Input',
    description: 'Styled text input with focus ring and error state support.',
    category: 'primitives',
    files: [
      { path: 'components/ui/input.tsx', target: 'components/ui/input.tsx', type: 'component' },
    ],
  },
  {
    name: 'progress',
    label: 'Progress',
    description: 'Linear progress bar that communicates operation status.',
    category: 'primitives',
    files: [
      { path: 'components/ui/progress.tsx', target: 'components/ui/progress.tsx', type: 'component' },
    ],
    npmDependencies: { 'radix-ui': 'latest' },
  },
  {
    name: 'slider',
    label: 'Slider',
    description: 'Range input slider with keyboard navigation and multi-thumb support.',
    category: 'primitives',
    files: [
      { path: 'components/ui/slider.tsx', target: 'components/ui/slider.tsx', type: 'component' },
    ],
    npmDependencies: { 'radix-ui': 'latest' },
  },
  {
    name: 'switch',
    label: 'Switch',
    description: 'Toggle switch for binary on/off states.',
    category: 'primitives',
    files: [
      { path: 'components/ui/switch.tsx', target: 'components/ui/switch.tsx', type: 'component' },
    ],
    npmDependencies: { 'radix-ui': 'latest' },
  },
  {
    name: 'tabs',
    label: 'Tabs',
    description: 'Tabbed navigation that organises content into separate panels.',
    category: 'primitives',
    files: [
      { path: 'components/ui/tabs.tsx', target: 'components/ui/tabs.tsx', type: 'component' },
    ],
    npmDependencies: { 'radix-ui': 'latest' },
  },

  // ── Data Display ────────────────────────────────────────────────────────────
  {
    name: 'data-table',
    label: 'Data Table',
    description: 'Feature-rich table with sorting, filtering, and pagination.',
    category: 'data-display',
    files: [
      { path: 'components/ui/data-table.tsx', target: 'components/ui/data-table.tsx', type: 'component' },
    ],
    npmDependencies: { '@tanstack/react-table': 'latest' },
  },
  {
    name: 'animated-text',
    label: 'Animated Text',
    description: 'Text with 7 entrance animation variants: typewriter, blur-in, split-entrance, and more.',
    category: 'data-display',
    files: [
      { path: 'components/ui/animated-text.tsx', target: 'components/ui/animated-text.tsx', type: 'component' },
    ],
    npmDependencies: { 'motion': 'latest' },
  },

  // ── Feedback ────────────────────────────────────────────────────────────────
  {
    name: 'stateful-button',
    label: 'Stateful Button',
    description: 'Button that transitions through idle → loading → success/failure states with animation.',
    category: 'feedback',
    files: [
      { path: 'components/ui/stateful-button.tsx', target: 'components/ui/stateful-button.tsx', type: 'component' },
    ],
    registryDependencies: ['button'],
    npmDependencies: { 'motion': 'latest', 'lucide-react': 'latest' },
  },

  // ── Overlay ─────────────────────────────────────────────────────────────────
  {
    name: 'dialog',
    label: 'Dialog',
    description: 'Modal dialog for confirmations, forms, and detailed information.',
    category: 'overlay',
    files: [
      { path: 'components/ui/dialog.tsx', target: 'components/ui/dialog.tsx', type: 'component' },
    ],
    npmDependencies: { 'radix-ui': 'latest' },
  },
  {
    name: 'drawer',
    label: 'Drawer',
    description: 'Slide-in panel from any edge of the screen for secondary content.',
    category: 'overlay',
    files: [
      { path: 'components/ui/drawer.tsx', target: 'components/ui/drawer.tsx', type: 'component' },
    ],
    npmDependencies: { 'vaul': 'latest' },
  },
  {
    name: 'popover',
    label: 'Popover',
    description: 'Floating panel anchored to a trigger for contextual information.',
    category: 'overlay',
    files: [
      { path: 'components/ui/popover.tsx', target: 'components/ui/popover.tsx', type: 'component' },
    ],
    npmDependencies: { 'radix-ui': 'latest' },
  },
  {
    name: 'tooltip',
    label: 'Tooltip',
    description: 'Lightweight floating label that appears on hover or focus.',
    category: 'overlay',
    files: [
      { path: 'components/ui/tooltip.tsx', target: 'components/ui/tooltip.tsx', type: 'component' },
    ],
    npmDependencies: { 'radix-ui': 'latest' },
  },

  // ── Navigation ──────────────────────────────────────────────────────────────
  {
    name: 'dropdown-menu',
    label: 'Dropdown Menu',
    description: 'Accessible dropdown with items, sub-menus, and keyboard navigation.',
    category: 'navigation',
    files: [
      { path: 'components/ui/dropdown-menu.tsx', target: 'components/ui/dropdown-menu.tsx', type: 'component' },
    ],
    npmDependencies: { 'radix-ui': 'latest' },
  },
  {
    name: 'navigation-menu',
    label: 'Navigation Menu',
    description: 'Horizontal navigation bar with animated flyout panels.',
    category: 'navigation',
    files: [
      { path: 'components/ui/navigation-menu.tsx', target: 'components/ui/navigation-menu.tsx', type: 'component' },
    ],
    npmDependencies: { 'radix-ui': 'latest' },
  },

  // ── Charts ──────────────────────────────────────────────────────────────────
  {
    name: 'area-chart-card',
    label: 'Area Chart Card',
    description: 'Card with an animated area chart for time-series data.',
    category: 'charts',
    files: [
      { path: 'components/ui/cards/area-chart-card.tsx', target: 'components/ui/cards/area-chart-card.tsx', type: 'component' },
      { path: 'components/ui/cards/data-contracts.ts', target: 'components/ui/cards/data-contracts.ts', type: 'types' },
      { path: 'lib/format.ts', target: 'lib/format.ts', type: 'lib' },
    ],
    registryDependencies: ['card'],
    npmDependencies: { 'recharts': 'latest', 'motion': 'latest' },
  },
  {
    name: 'bar-chart-card',
    label: 'Bar Chart Card',
    description: 'Card with an animated bar chart for categorical comparisons.',
    category: 'charts',
    files: [
      { path: 'components/ui/cards/bar-chart-card.tsx', target: 'components/ui/cards/bar-chart-card.tsx', type: 'component' },
      { path: 'components/ui/cards/data-contracts.ts', target: 'components/ui/cards/data-contracts.ts', type: 'types' },
      { path: 'lib/format.ts', target: 'lib/format.ts', type: 'lib' },
    ],
    registryDependencies: ['card'],
    npmDependencies: { 'recharts': 'latest', 'motion': 'latest' },
  },
  {
    name: 'line-chart-card',
    label: 'Line Chart Card',
    description: 'Card with an animated line chart for trend visualisation.',
    category: 'charts',
    files: [
      { path: 'components/ui/cards/line-chart-card.tsx', target: 'components/ui/cards/line-chart-card.tsx', type: 'component' },
      { path: 'components/ui/cards/data-contracts.ts', target: 'components/ui/cards/data-contracts.ts', type: 'types' },
      { path: 'lib/format.ts', target: 'lib/format.ts', type: 'lib' },
    ],
    registryDependencies: ['card'],
    npmDependencies: { 'recharts': 'latest', 'motion': 'latest' },
  },
  {
    name: 'metric-card',
    label: 'Metric Card',
    description: 'KPI card displaying a primary metric with trend indicator and sparkline.',
    category: 'charts',
    files: [
      { path: 'components/ui/cards/metric-card.tsx', target: 'components/ui/cards/metric-card.tsx', type: 'component' },
      { path: 'lib/format.ts', target: 'lib/format.ts', type: 'lib' },
    ],
    registryDependencies: ['card'],
    npmDependencies: { 'recharts': 'latest' },
  },
  {
    name: 'radial-chart-card',
    label: 'Radial Chart Card',
    description: 'Card with a radial/donut chart for part-to-whole relationships.',
    category: 'charts',
    files: [
      { path: 'components/ui/cards/radial-chart-card.tsx', target: 'components/ui/cards/radial-chart-card.tsx', type: 'component' },
      { path: 'components/ui/cards/data-contracts.ts', target: 'components/ui/cards/data-contracts.ts', type: 'types' },
      { path: 'lib/format.ts', target: 'lib/format.ts', type: 'lib' },
    ],
    registryDependencies: ['card'],
    npmDependencies: { 'recharts': 'latest', 'motion': 'latest' },
  },
  {
    name: 'rounded-pie-chart-card',
    label: 'Rounded Pie Chart Card',
    description: 'Card with a pie chart using rounded arc segments.',
    category: 'charts',
    files: [
      { path: 'components/ui/cards/rounded-pie-chart-card.tsx', target: 'components/ui/cards/rounded-pie-chart-card.tsx', type: 'component' },
      { path: 'components/ui/cards/data-contracts.ts', target: 'components/ui/cards/data-contracts.ts', type: 'types' },
      { path: 'lib/format.ts', target: 'lib/format.ts', type: 'lib' },
    ],
    registryDependencies: ['card'],
    npmDependencies: { 'recharts': 'latest' },
  },
  {
    name: 'dotted-multi-line-chart-card',
    label: 'Dotted Multi-Line Chart Card',
    description: 'Card with a multi-series dotted line chart for comparing trends.',
    category: 'charts',
    files: [
      { path: 'components/ui/cards/dotted-multi-line-chart-card.tsx', target: 'components/ui/cards/dotted-multi-line-chart-card.tsx', type: 'component' },
      { path: 'components/ui/cards/data-contracts.ts', target: 'components/ui/cards/data-contracts.ts', type: 'types' },
      { path: 'lib/format.ts', target: 'lib/format.ts', type: 'lib' },
    ],
    registryDependencies: ['card'],
    npmDependencies: { 'recharts': 'latest' },
  },

  // ── Compact ─────────────────────────────────────────────────────────────────
  {
    name: 'compact-sm-variants',
    label: 'Compact Cards',
    description: 'Small stat cards: live activity, next event, whos online, and spark stats.',
    category: 'compact',
    files: [
      { path: 'components/ui/cards/compact-sm-variants.tsx', target: 'components/ui/cards/compact-sm-variants.tsx', type: 'component' },
      { path: 'lib/format.ts', target: 'lib/format.ts', type: 'lib' },
    ],
    registryDependencies: ['card', 'avatar'],
    npmDependencies: { 'recharts': 'latest', 'lucide-react': 'latest' },
  },
];

// ---------------------------------------------------------------------------
// Build
// ---------------------------------------------------------------------------

function readSrc(filePath: string): string {
  const abs = resolve(SRC, filePath);
  if (!existsSync(abs)) {
    console.warn(`  WARNING: file not found: ${abs}`);
    return '';
  }
  return readFileSync(abs, 'utf-8');
}

interface OutputEntry {
  name: string;
  label: string;
  description: string;
  category: string;
  files: { path: string; target: string; content: string }[];
  registryDependencies?: string[];
  npmDependencies?: Record<string, string>;
}

const output: OutputEntry[] = REGISTRY.map((component) => {
  const files = component.files.map((f) => ({
    path: f.path,
    target: f.target,
    content: readSrc(f.path),
  }));

  const entry: OutputEntry = {
    name: component.name,
    label: component.label,
    description: component.description,
    category: component.category,
    files,
  };

  if (component.registryDependencies?.length) {
    entry.registryDependencies = component.registryDependencies;
  }
  if (component.npmDependencies && Object.keys(component.npmDependencies).length) {
    entry.npmDependencies = component.npmDependencies;
  }

  return entry;
});

// Ensure public/ exists
const publicDir = resolve(ROOT, 'public');
if (!existsSync(publicDir)) {
  mkdirSync(publicDir, { recursive: true });
}

writeFileSync(OUT, JSON.stringify(output, null, 2), 'utf-8');

const totalFiles = output.reduce((sum, c) => sum + c.files.length, 0);
console.log(`registry.json written to ${OUT}`);
console.log(`  ${output.length} components, ${totalFiles} files embedded`);
