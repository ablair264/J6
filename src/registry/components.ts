import type { RegistryComponent } from './schema';
import { COMPONENTS } from '@/components/ui/ui-studio/constants';

// ---------------------------------------------------------------------------
// Raw source imports via Vite ?raw
// ---------------------------------------------------------------------------

import accordionRaw from '../components/ui/accordion.tsx?raw';
import alertRaw from '../components/ui/alert.tsx?raw';
import animatedTextRaw from '../components/ui/animated-text.tsx?raw';
import avatarRaw from '../components/ui/avatar.tsx?raw';
import badgeRaw from '../components/ui/badge.tsx?raw';
import buttonRaw from '../components/ui/button.tsx?raw';
import cardRaw from '../components/ui/card.tsx?raw';
import checkboxRaw from '../components/ui/checkbox.tsx?raw';
import dataTableRaw from '../components/ui/data-table.tsx?raw';
import dialogRaw from '../components/ui/dialog.tsx?raw';
import drawerRaw from '../components/ui/drawer.tsx?raw';
import dropdownMenuRaw from '../components/ui/dropdown-menu.tsx?raw';
import inputRaw from '../components/ui/input.tsx?raw';
import navigationMenuRaw from '../components/ui/navigation-menu.tsx?raw';
import popoverRaw from '../components/ui/popover.tsx?raw';
import progressRaw from '../components/ui/progress.tsx?raw';
import sliderRaw from '../components/ui/slider.tsx?raw';
import switchRaw from '../components/ui/switch.tsx?raw';
import tabsRaw from '../components/ui/tabs.tsx?raw';
import tooltipRaw from '../components/ui/tooltip.tsx?raw';
import statefulButtonRaw from '../components/ui/stateful-button.tsx?raw';

// Chart cards
import areaChartCardRaw from '../components/ui/cards/area-chart-card.tsx?raw';
import barChartCardRaw from '../components/ui/cards/bar-chart-card.tsx?raw';
import lineChartCardRaw from '../components/ui/cards/line-chart-card.tsx?raw';
import metricCardRaw from '../components/ui/cards/metric-card.tsx?raw';
import radialChartCardRaw from '../components/ui/cards/radial-chart-card.tsx?raw';
import roundedPieChartCardRaw from '../components/ui/cards/rounded-pie-chart-card.tsx?raw';
import dottedMultiLineChartCardRaw from '../components/ui/cards/dotted-multi-line-chart-card.tsx?raw';
import compactSmVariantsRaw from '../components/ui/cards/compact-sm-variants.tsx?raw';
import cardsDataContractsRaw from '../components/ui/cards/data-contracts.ts?raw';

// Shared lib
import formatRaw from '../lib/format.ts?raw';
import utilsRaw from '../lib/utils.ts?raw';

// ---------------------------------------------------------------------------
// SOURCE_MAP — maps component name → { filepath: rawSource }
// ---------------------------------------------------------------------------

export const SOURCE_MAP: Record<string, Record<string, string>> = {
  accordion: {
    'components/ui/accordion.tsx': accordionRaw,
  },
  alert: {
    'components/ui/alert.tsx': alertRaw,
  },
  'animated-text': {
    'components/ui/animated-text.tsx': animatedTextRaw,
  },
  avatar: {
    'components/ui/avatar.tsx': avatarRaw,
  },
  badge: {
    'components/ui/badge.tsx': badgeRaw,
  },
  button: {
    'components/ui/button.tsx': buttonRaw,
    'lib/utils.ts': utilsRaw,
  },
  card: {
    'components/ui/card.tsx': cardRaw,
  },
  checkbox: {
    'components/ui/checkbox.tsx': checkboxRaw,
  },
  'data-table': {
    'components/ui/data-table.tsx': dataTableRaw,
  },
  dialog: {
    'components/ui/dialog.tsx': dialogRaw,
  },
  drawer: {
    'components/ui/drawer.tsx': drawerRaw,
  },
  'dropdown-menu': {
    'components/ui/dropdown-menu.tsx': dropdownMenuRaw,
  },
  input: {
    'components/ui/input.tsx': inputRaw,
  },
  'navigation-menu': {
    'components/ui/navigation-menu.tsx': navigationMenuRaw,
  },
  popover: {
    'components/ui/popover.tsx': popoverRaw,
  },
  progress: {
    'components/ui/progress.tsx': progressRaw,
  },
  slider: {
    'components/ui/slider.tsx': sliderRaw,
  },
  switch: {
    'components/ui/switch.tsx': switchRaw,
  },
  tabs: {
    'components/ui/tabs.tsx': tabsRaw,
  },
  tooltip: {
    'components/ui/tooltip.tsx': tooltipRaw,
  },
  'stateful-button': {
    'components/ui/stateful-button.tsx': statefulButtonRaw,
  },
  'area-chart-card': {
    'components/ui/cards/area-chart-card.tsx': areaChartCardRaw,
    'components/ui/cards/data-contracts.ts': cardsDataContractsRaw,
    'lib/format.ts': formatRaw,
  },
  'bar-chart-card': {
    'components/ui/cards/bar-chart-card.tsx': barChartCardRaw,
    'components/ui/cards/data-contracts.ts': cardsDataContractsRaw,
    'lib/format.ts': formatRaw,
  },
  'line-chart-card': {
    'components/ui/cards/line-chart-card.tsx': lineChartCardRaw,
    'components/ui/cards/data-contracts.ts': cardsDataContractsRaw,
    'lib/format.ts': formatRaw,
  },
  'metric-card': {
    'components/ui/cards/metric-card.tsx': metricCardRaw,
    'lib/format.ts': formatRaw,
  },
  'radial-chart-card': {
    'components/ui/cards/radial-chart-card.tsx': radialChartCardRaw,
    'components/ui/cards/data-contracts.ts': cardsDataContractsRaw,
    'lib/format.ts': formatRaw,
  },
  'rounded-pie-chart-card': {
    'components/ui/cards/rounded-pie-chart-card.tsx': roundedPieChartCardRaw,
    'components/ui/cards/data-contracts.ts': cardsDataContractsRaw,
    'lib/format.ts': formatRaw,
  },
  'dotted-multi-line-chart-card': {
    'components/ui/cards/dotted-multi-line-chart-card.tsx': dottedMultiLineChartCardRaw,
    'components/ui/cards/data-contracts.ts': cardsDataContractsRaw,
    'lib/format.ts': formatRaw,
  },
  'compact-sm-variants': {
    'components/ui/cards/compact-sm-variants.tsx': compactSmVariantsRaw,
    'lib/format.ts': formatRaw,
  },
};

// ---------------------------------------------------------------------------
// REGISTRY — metadata for every component
// ---------------------------------------------------------------------------

export const REGISTRY: RegistryComponent[] = [
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

const BUILDER_KIND_TO_REGISTRY_NAME: Partial<Record<(typeof COMPONENTS)[number]['kind'], string>> = {
  dropdown: 'dropdown-menu',
  'stage-button': 'stateful-button',
};

const BUILDER_SUPPORTED_REGISTRY_NAMES = new Set(
  COMPONENTS
    .map(({ kind }) => BUILDER_KIND_TO_REGISTRY_NAME[kind] ?? kind)
    .filter((name) => REGISTRY.some((component) => component.name === name)),
);

export const BUILDER_REGISTRY: RegistryComponent[] = REGISTRY.filter((component) =>
  BUILDER_SUPPORTED_REGISTRY_NAMES.has(component.name),
);

const LIBRARY_ONLY_REGISTRY_NAMES = new Set([
  'area-chart-card',
  'bar-chart-card',
  'line-chart-card',
  'metric-card',
  'radial-chart-card',
  'rounded-pie-chart-card',
  'dotted-multi-line-chart-card',
  'compact-sm-variants',
]);

export const LIBRARY_REGISTRY: RegistryComponent[] = REGISTRY.filter((component) =>
  BUILDER_SUPPORTED_REGISTRY_NAMES.has(component.name) || LIBRARY_ONLY_REGISTRY_NAMES.has(component.name),
);

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------

export function getRegistryComponent(name: string): RegistryComponent | undefined {
  return REGISTRY.find((c) => c.name === name);
}

export function getBuilderRegistryComponent(name: string): RegistryComponent | undefined {
  return BUILDER_REGISTRY.find((c) => c.name === name);
}

export function getLibraryRegistryComponent(name: string): RegistryComponent | undefined {
  return LIBRARY_REGISTRY.find((c) => c.name === name);
}

export function getComponentSources(name: string): Record<string, string> | undefined {
  return SOURCE_MAP[name];
}
