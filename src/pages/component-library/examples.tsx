import type { CSSProperties, ReactNode } from 'react';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Variation component imports
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
import { AlertInfo, AlertSuccess, AlertWarningDismissible, AlertError, AlertEntryBlurFade, AlertEntryScaleUp } from './examples/alert-variations';
import { BadgeSolidDestructive, BadgeOutline, BadgePillSky, BadgeGrainBell, BadgeGrainPlain, BadgeGrainIconOnly, BadgeStatusSuccess, BadgeStatusWarning, BadgeStatusError, BadgeStatusInfo, BadgeEntryBlurFade, BadgeTapSpring } from './examples/badge-variations';
import { ButtonPrimaryHero, ButtonOutlineHover, ButtonGradientSlide, ButtonAnimatedBorder, ButtonRippleFill, ButtonShineBorder, ButtonPulseRing, ButtonGlass, ButtonBorderBeam, ButtonBorderBeamCompact, ButtonDarkMinimal, ButtonDestructive } from './examples/button-variations';
import { CardDefault, CardElevatedAction, CardGlass, CardHoverLift, CardEntryScaleUp, CardBorderBeam } from './examples/card-variations';
import { DataTableDarkStriped, DataTableAmberCompact, DataTableEntryBlurFade } from './examples/datatable-variations';
import { DrawerTriggerRight, DrawerTriggerSettings } from './examples/drawer-variations';
import { DropdownMenuTriggerDark, DropdownMenuTriggerAmber, DropdownMenuTriggerEffect } from './examples/dropdown-menu-variations';
import { InputDark, InputLight, InputEntryBlurFade, InputVioletFocus } from './examples/input-variations';
import { ProgressLinearAmber, ProgressLinearWithLabel, ProgressCircularViolet, ProgressCircularSmall, ProgressEntryBlurFade } from './examples/progress-variations';
import { SliderDark, SliderRange, SliderEntryBlurFade } from './examples/slider-variations';
import { SwitchAmber, SwitchEmerald, SwitchVioletSmall, SwitchHoverScale } from './examples/switch-variations';
import { TabsDefaultDark, TabsLineViolet, TabsPillEmerald, TabsSegmentEntry } from './examples/tabs-variations';
import { TooltipDefault, TooltipInverse, TooltipNoArrow } from './examples/tooltip-variations';
import { SYSTEM_TOKEN_SET } from '@/components/ui/token-sets';
import { DEFAULT_STYLE, normalizeStyleConfig } from '@/components/ui/ui-studio/constants';
import { buildNamedSnippetForInstance } from '@/components/ui/ui-studio/export/code-generators';
import { renderPreview } from '@/components/ui/ui-studio/preview/render-preview';
import type { ComponentInstance, ComponentStyleConfig, UIComponentKind } from '@/components/ui/ui-studio.types';
import { buildPreviewPresentation, getComponentVisualPreset } from '@/components/ui/ui-studio/utilities';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Chart card imports (kept for inline examples)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
import { AreaChartCard } from '@/components/ui/cards/area-chart-card';
import { BarChartCard } from '@/components/ui/cards/bar-chart-card';
import { LineChartCard } from '@/components/ui/cards/line-chart-card';
import { MetricCard } from '@/components/ui/cards/metric-card';
import { RadialChartCard } from '@/components/ui/cards/radial-chart-card';
import { RoundedPieChartCard } from '@/components/ui/cards/rounded-pie-chart-card';
import { DottedMultiLineChartCard } from '@/components/ui/cards/dotted-multi-line-chart-card';
import { LiveActivityCompactCard, NextEventCompactCard, WhosOnlineCompactCard, SparkStatsCompactCard } from '@/components/ui/cards/compact-sm-variants';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Types
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export interface LibraryExample {
    title: string;
    preview: ReactNode;
    code: string;
    frameClassName?: string;
    previewClassName?: string;
    previewStyle?: CSSProperties;
}

interface BuilderExampleConfig {
    title: string;
    kind: UIComponentKind;
    presetId: string;
    overrides?: Partial<ComponentStyleConfig>;
    pinOverlayOpen?: boolean;
    frameClassName?: string;
    previewClassName?: string;
    previewStyle?: CSSProperties;
}

function buildExampleId(kind: UIComponentKind, presetId: string, title: string): string {
    return `library-${kind}-${presetId}-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
}

function createBuilderInstance({ kind, presetId, title, overrides }: BuilderExampleConfig): ComponentInstance {
    const preset = getComponentVisualPreset(kind, presetId);
    const style = normalizeStyleConfig({
        ...DEFAULT_STYLE,
        ...(preset?.values ?? {}),
        ...(overrides ?? {}),
        componentPreset: preset?.values.componentPreset ?? presetId,
    });

    return {
        id: buildExampleId(kind, presetId, title),
        kind,
        name: title,
        style,
    };
}

function createBuilderExample(config: BuilderExampleConfig): LibraryExample {
    const instance = createBuilderInstance(config);
    const presentation = buildPreviewPresentation(instance);

    return {
        title: config.title,
        preview: renderPreview(
            instance,
            presentation.style,
            presentation.motionClassName,
            config.pinOverlayOpen ? { pinOverlayOpen: true } : undefined,
        ),
        code: buildNamedSnippetForInstance(instance, 'inline', SYSTEM_TOKEN_SET),
        frameClassName: config.frameClassName,
        previewClassName: config.previewClassName,
        previewStyle: config.previewStyle,
    };
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Chart data
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const CHART_DEMO_DATA = [
    { name: 'Jan', value: 186 }, { name: 'Feb', value: 305 }, { name: 'Mar', value: 237 },
    { name: 'Apr', value: 73 }, { name: 'May', value: 209 }, { name: 'Jun', value: 214 },
    { name: 'Jul', value: 320 },
];
const CHART_PIE_DATA = [
    { name: 'Desktop', value: 450 }, { name: 'Mobile', value: 320 },
    { name: 'Tablet', value: 180 }, { name: 'Other', value: 50 },
];
const CHART_MULTI_LINE_DATA = [
    { name: 'Mon', primary: 186, secondary: 80 }, { name: 'Tue', primary: 305, secondary: 200 },
    { name: 'Wed', primary: 237, secondary: 120 }, { name: 'Thu', primary: 73, secondary: 190 },
    { name: 'Fri', primary: 209, secondary: 130 }, { name: 'Sat', primary: 214, secondary: 140 },
];
const METRIC_SPARK_DATA = [
    { name: 'W1', value: 40 }, { name: 'W2', value: 65 }, { name: 'W3', value: 50 },
    { name: 'W4', value: 85 }, { name: 'W5', value: 70 }, { name: 'W6', value: 95 },
];
const COMPACT_SPARK_POINTS = [
    { name: '1', value: 40 }, { name: '2', value: 55 }, { name: '3', value: 48 },
    { name: '4', value: 70 }, { name: '5', value: 62 }, { name: '6', value: 85 },
    { name: '7', value: 78 }, { name: '8', value: 92 },
];
const COMPACT_DEMO_USERS = [
    { name: 'Ava Chen', role: 'Engineer' },
    { name: 'Kai Nakamura', role: 'Designer' },
    { name: 'Zara Osei', role: 'PM' },
    { name: 'Liam Torres', role: 'Backend Dev' },
    { name: 'Maya Singh', role: 'QA' },
];

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   EXAMPLES registry
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export const EXAMPLES: Record<string, LibraryExample[]> = {

    /* ── Accordion ── */
    accordion: [
        createBuilderExample({
            title: 'Editorial FAQ',
            kind: 'accordion',
            presetId: 'default',
            overrides: {
                customWidth: 636,
                fillColor: '#151317',
                fillOpacity: 100,
                strokeColor: '#312820',
                strokeWeight: 1,
                strokeOpacity: 100,
                cornerRadius: 20,
                fontColor: '#f3eee7',
                accordionDividerColor: '#bd8a33',
                accordionDividerWeight: 1,
                accordionShowIcons: false,
                accordionPaddingH: 18,
                accordionPaddingW: 22,
                accordionTriggerFontSize: 16,
                accordionTriggerFontWeight: 600,
                accordionContentFontColor: '#b1a692',
                accordionContentFontSize: 13,
                accordionItemCount: 3,
                accordionItems: [
                    {
                        id: 'frameworks',
                        title: 'What frameworks are supported?',
                        subtitle: 'React-ready output',
                        content: 'UI Studio exports clean React components with Tailwind classes that slot directly into Vite, Next.js, and Remix codebases.',
                    },
                    {
                        id: 'motion-system',
                        title: 'How does the motion system work?',
                        subtitle: 'Preset-driven animation',
                        content: 'Entry, hover, tap, and exit treatments are expressed as straightforward motion wrappers instead of hidden runtime magic.',
                    },
                    {
                        id: 'export-code',
                        title: 'Can I customize the exported code?',
                        subtitle: 'Edit the output freely',
                        content: 'Everything ships as ordinary React and Tailwind code, so you can refactor structure, naming, and styling without working around proprietary abstractions.',
                    },
                ],
            },
            previewClassName: 'justify-center overflow-visible px-8 py-10 min-h-[250px]',
        }),
        createBuilderExample({
            title: 'Foundation Notes',
            kind: 'accordion',
            presetId: 'collapse-minimal',
            overrides: {
                customWidth: 620,
                fillColor: '#10141c',
                fillOpacity: 100,
                strokeColor: '#273245',
                strokeWeight: 1,
                strokeOpacity: 100,
                cornerRadius: 20,
                fontColor: '#edf2f7',
                accordionSpacing: 0,
                accordionDividerEnabled: true,
                accordionDividerColor: '#253144',
                accordionDividerWeight: 1,
                accordionShowIcons: false,
                accordionPaddingH: 15,
                accordionPaddingW: 18,
                accordionTriggerFontSize: 15,
                accordionTriggerFontWeight: 550,
                accordionContentFontColor: '#97a3b6',
                accordionContentFontSize: 13,
                accordionItemCount: 3,
                accordionItems: [
                    {
                        id: 'tokens',
                        title: 'Design tokens and theming',
                        subtitle: 'Brand-level overrides',
                        content: 'Use shared tokens for color, spacing, and type so product-wide refinements happen once instead of being patched screen by screen.',
                    },
                    {
                        id: 'a11y',
                        title: 'Accessibility and keyboard navigation',
                        subtitle: 'Built on reliable primitives',
                        content: 'The accordion inherits keyboard navigation, semantics, and focus behavior from the production component instead of a docs-only wrapper.',
                    },
                    {
                        id: 'effects',
                        title: 'Component variants and effects',
                        subtitle: 'Motion and style stay aligned',
                        content: 'Motion, borders, and surface treatments stay aligned because the examples are rendered through the same component model used by export.',
                    },
                ],
            },
            previewClassName: 'justify-center overflow-visible px-8 py-10 min-h-[250px]',
        }),
        createBuilderExample({
            title: 'Multiple Open',
            kind: 'accordion',
            presetId: 'default',
            overrides: {
                customWidth: 640,
                accordionAllowMultiple: true,
                accordionDividerColor: '#7c3aed',
                accordionDividerWeight: 1,
                fillColor: '#130d1e',
                fillOpacity: 100,
                strokeColor: '#6d28d9',
                strokeWeight: 1,
                strokeOpacity: 34,
                cornerRadius: 20,
                fontColor: '#f3efff',
                accordionPaddingH: 15,
                accordionPaddingW: 18,
                accordionTriggerFontWeight: 600,
                accordionContentFontColor: '#b9b2cc',
                accordionTriggerFontSize: 15,
                accordionContentFontSize: 13,
                accordionItemCount: 3,
                accordionItems: [
                    {
                        id: 'presets',
                        title: 'Entry and exit presets',
                        subtitle: 'Configurable motion',
                        content: 'Choose from blur-fade, slide-scale, drop-in, expand-x, and expand-y, then tune timing without rewriting the component.',
                    },
                    {
                        id: 'borders',
                        title: 'Border and outline effects',
                        subtitle: 'Exportable treatments',
                        content: 'Border beam, shine border, neon glow, and pulse ring effects are applied with exportable styles instead of ad hoc docs code.',
                    },
                    {
                        id: 'interactions',
                        title: 'Advanced hover interactions',
                        subtitle: 'Interaction without drift',
                        content: 'Hover treatments stay localized so the interface feels stable and the examples read like production UI, not a demo reel.',
                    },
                ],
            },
            previewClassName: 'justify-center overflow-visible px-8 py-10 min-h-[280px]',
        }),
    ],

    /* ── Alert ── */
    alert: [
        {
            title: 'Info',
            preview: <AlertInfo />,
            code: `<Alert variant="info">
  <AlertTitle>Information</AlertTitle>
  <AlertDescription>This is an informational alert.</AlertDescription>
</Alert>`,
        },
        {
            title: 'Success',
            preview: <AlertSuccess />,
            code: `<Alert variant="success">
  <AlertTitle>Success</AlertTitle>
  <AlertDescription>Operation completed successfully.</AlertDescription>
</Alert>`,
        },
        {
            title: 'Warning Dismissible',
            preview: <AlertWarningDismissible />,
            code: `<Alert variant="warning" dismissible>
  <AlertTitle>Warning</AlertTitle>
  <AlertDescription>Please review before proceeding.</AlertDescription>
</Alert>`,
        },
        {
            title: 'Error',
            preview: <AlertError />,
            code: `<Alert variant="error">
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>Something went wrong. Please try again.</AlertDescription>
</Alert>`,
        },
        {
            title: 'Entry Blur Fade',
            preview: <AlertEntryBlurFade />,
            code: `<motion.div
  initial={{ filter: 'blur(4px)', opacity: 0 }}
  animate={{ filter: 'blur(0px)', opacity: 1 }}
  transition={{ duration: 0.55, ease: 'easeInOut' }}
>
  <Alert variant="info">
    <AlertTitle>New feature</AlertTitle>
    <AlertDescription>Motion animations are now available.</AlertDescription>
  </Alert>
</motion.div>`,
        },
        {
            title: 'Entry Scale Up',
            preview: <AlertEntryScaleUp />,
            code: `<motion.div
  initial={{ scale: 0.92, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  transition={{ duration: 0.45, ease: 'easeOut' }}
>
  <Alert variant="success">
    <AlertTitle>Deployed</AlertTitle>
    <AlertDescription>Your changes are now live.</AlertDescription>
  </Alert>
</motion.div>`,
        },
    ],

    /* ── Animated Text ── */
    'animated-text': [
        createBuilderExample({
            title: 'Blur In',
            kind: 'animated-text',
            presetId: 'default',
            overrides: { animatedTextContent: 'Design components visually' },
            previewClassName: 'min-h-[180px]',
        }),
        createBuilderExample({
            title: 'Typewriter',
            kind: 'animated-text',
            presetId: 'typewriter',
            overrides: { animatedTextContent: 'Shipping polished UI faster' },
            previewClassName: 'min-h-[180px]',
        }),
        createBuilderExample({
            title: 'Decrypt',
            kind: 'animated-text',
            presetId: 'decrypt',
            overrides: { animatedTextContent: 'SYSTEM ONLINE' },
            previewClassName: 'min-h-[180px]',
        }),
        createBuilderExample({
            title: 'Gradient Sweep',
            kind: 'animated-text',
            presetId: 'gradient',
            overrides: { animatedTextContent: 'Builder-backed previews' },
            previewClassName: 'min-h-[180px]',
        }),
        createBuilderExample({
            title: 'Shiny',
            kind: 'animated-text',
            presetId: 'shiny',
            overrides: { animatedTextContent: 'Premium component defaults' },
            previewClassName: 'min-h-[180px]',
        }),
        createBuilderExample({
            title: 'Word Rotate',
            kind: 'animated-text',
            presetId: 'word-rotate',
            overrides: { animatedTextContent: 'Consistent,Precise,Exportable,Interactive' },
            previewClassName: 'min-h-[180px]',
        }),
        createBuilderExample({
            title: 'Fade Up',
            kind: 'animated-text',
            presetId: 'fade-up',
            overrides: { animatedTextContent: 'Motion that reads cleanly' },
            previewClassName: 'min-h-[180px]',
        }),
        createBuilderExample({
            title: 'Letters Pull Up',
            kind: 'animated-text',
            presetId: 'letters-pull-up',
            overrides: { animatedTextContent: 'Professional typography' },
            previewClassName: 'min-h-[180px]',
        }),
        createBuilderExample({
            title: 'Bounce',
            kind: 'animated-text',
            presetId: 'bounce',
            overrides: { animatedTextContent: 'Interactive feedback' },
            previewClassName: 'min-h-[180px]',
        }),
        createBuilderExample({
            title: 'Bubble',
            kind: 'animated-text',
            presetId: 'bubble',
            overrides: { animatedTextContent: 'Soft emphasis' },
            previewClassName: 'min-h-[180px]',
        }),
        createBuilderExample({
            title: 'Disperse',
            kind: 'animated-text',
            presetId: 'disperse',
            overrides: { animatedTextContent: 'Exit with intention' },
            previewClassName: 'min-h-[180px]',
        }),
        createBuilderExample({
            title: 'Pattern',
            kind: 'animated-text',
            presetId: 'pattern',
            overrides: { animatedTextContent: 'UI' },
            previewClassName: 'min-h-[220px]',
        }),
    ],

    /* ── Avatar ── */
    avatar: [
        createBuilderExample({
            title: 'Hover Profile',
            kind: 'avatar',
            presetId: 'circle',
            overrides: {
                avatarFallbackText: 'JD',
                avatarCustomSize: 56,
                avatarBgMode: 'gradient',
                avatarBgColor: '#3424b9',
                avatarBgColorTo: '#4338ca',
                avatarStrokeWeight: 1,
                avatarStrokeColor: '#4b3dd4',
                avatarStrokeOpacity: 100,
                avatarFontSize: 20,
                avatarFontBold: true,
                avatarFontColor: '#f8fafc',
                avatarPopoverEnabled: true,
                avatarPopoverDelay: 90,
                avatarPopoverWidth: 280,
                avatarPopoverPadding: 18,
                avatarPopoverRadius: 22,
                avatarPopoverBgMode: 'gradient',
                avatarPopoverBgColor: '#2c1d98',
                avatarPopoverBgColorTo: '#251784',
                avatarPopoverBgOpacity: 100,
                avatarPopoverStrokeWeight: 1,
                avatarPopoverStrokeColor: '#4538cc',
                avatarPopoverStrokeOpacity: 100,
                avatarPopoverFontColor: '#f8fafc',
                avatarPopoverFontSize: 14,
                avatarPopoverIconColor: '#b9b5de',
            },
            previewClassName: 'overflow-visible px-8 pt-28 pb-10 min-h-[300px]',
        }),
        createBuilderExample({
            title: 'Team Stack',
            kind: 'avatar-group',
            presetId: 'overlap',
            overrides: {
                avatarCustomSize: 48,
                avatarGroupSpacing: -10,
                avatarBgMode: 'solid',
                avatarBgColor: '#f79a3e',
                avatarStrokeWeight: 2,
                avatarStrokeColor: '#f7c96a',
                avatarStrokeOpacity: 100,
                avatarFontSize: 18,
                avatarFontBold: true,
                avatarFontColor: '#fff7ed',
                avatarPopoverEnabled: true,
                avatarPopoverDelay: 90,
                avatarPopoverWidth: 280,
                avatarPopoverPadding: 18,
                avatarPopoverRadius: 22,
                avatarPopoverBgMode: 'gradient',
                avatarPopoverBgColor: '#1d1d22',
                avatarPopoverBgColorTo: '#15161a',
                avatarPopoverBgOpacity: 100,
                avatarPopoverStrokeWeight: 1,
                avatarPopoverStrokeColor: '#3a3a42',
                avatarPopoverStrokeOpacity: 100,
                avatarPopoverFontColor: '#f5f5f5',
                avatarPopoverFontSize: 14,
                avatarPopoverIconColor: '#9ca3af',
                avatarGroupCount: 4,
                avatarGroupItems: [
                    { id: 'avatar-casey', name: 'Casey North', initials: 'CN', role: 'Design' },
                    { id: 'avatar-lara', name: 'Lara Reed', initials: 'LR', role: 'Engineering' },
                    { id: 'avatar-evan', name: 'Evan Ross', initials: 'ER', role: 'Product' },
                    { id: 'avatar-nia', name: 'Nia Holt', initials: 'NH', role: 'Marketing' },
                ],
            },
            previewClassName: 'overflow-visible px-8 pt-28 pb-10 min-h-[300px]',
        }),
    ],

    /* ── Badge ── */
    badge: [
        {
            title: 'Solid Destructive',
            preview: <BadgeSolidDestructive />,
            code: `<Badge
  className="rounded-md min-h-[24px] px-2 text-[11px] font-medium"
  style={{ background: 'rgba(239, 68, 68, 1)' }}
>
  <Ban size={12} /> Badge token
</Badge>`,
        },
        {
            title: 'Outline',
            preview: <BadgeOutline />,
            code: `<Badge
  className="border border-solid rounded-md min-h-[22px] px-2 text-[11px]"
  style={{ borderColor: 'rgba(203, 213, 225, 1)' }}
>
  Badge token
</Badge>`,
        },
        {
            title: 'Pill Sky',
            preview: <BadgePillSky />,
            code: `<Badge className="rounded-full min-h-[28px] px-3.5 bg-[var(--j6-accent-sky-light)] text-xs">
  Badge token
</Badge>`,
        },
        {
            title: 'Grain Bell',
            preview: <BadgeGrainBell />,
            code: `<Badge
  className="rounded-full min-h-[28px] px-3.5 ui-studio-effect-grain bg-[var(--j6-accent-sky-light)]"
  style={{ '--ui-effect-grain-opacity': '0.25', '--ui-effect-grain-size': '200' }}
>
  <Bell size={11} /> Badge token
</Badge>`,
        },
        {
            title: 'Grain Plain',
            preview: <BadgeGrainPlain />,
            code: `<Badge
  className="rounded-full min-h-[24px] px-2.5 text-[11px] ui-studio-effect-grain bg-[var(--j6-accent-sky-light)]"
  style={{ '--ui-effect-grain-opacity': '0.25', '--ui-effect-grain-size': '200' }}
>
  Badge token
</Badge>`,
        },
        {
            title: 'Grain Icon Only',
            preview: <BadgeGrainIconOnly />,
            code: `<Badge
  className="rounded-full min-h-[24px] px-2 text-[11px] ui-studio-effect-grain bg-[var(--j6-accent-sky-light)]"
  style={{ '--ui-effect-grain-opacity': '0.25' }}
>
  <Search size={11} />
</Badge>`,
        },
        {
            title: 'Status Success',
            preview: <BadgeStatusSuccess />,
            code: `<Badge
  className="border border-[#059669]/30 rounded-md min-h-[24px] px-2.5 text-[11px]"
  style={{ background: 'rgba(236, 253, 245, 1)', color: 'rgba(6, 95, 70, 1)' }}
>
  <Check size={10} /> Badge token
</Badge>`,
        },
        {
            title: 'Status Warning',
            preview: <BadgeStatusWarning />,
            code: `<Badge
  className="border border-[#ca8a04]/30 rounded-md min-h-[26px] px-3"
  style={{ background: 'rgba(254, 252, 232, 1)', color: 'rgba(133, 77, 14, 1)' }}
>
  <Shield size={13} /> Badge token
</Badge>`,
        },
        {
            title: 'Status Error',
            preview: <BadgeStatusError />,
            code: `<Badge
  className="border border-[#dc2626]/20 rounded-md min-h-[24px] px-2.5 text-[11px]"
  style={{ background: 'rgba(254, 242, 242, 1)', color: 'rgba(153, 27, 27, 1)' }}
>
  <X size={12} /> Badge token
</Badge>`,
        },
        {
            title: 'Status Info',
            preview: <BadgeStatusInfo />,
            code: `<Badge
  className="border border-[#3b82f6]/30 rounded-md min-h-[26px] px-3"
  style={{ background: 'rgba(239, 246, 255, 1)', color: 'rgba(30, 58, 138, 1)' }}
>
  <Bookmark size={12} /> Badge token
</Badge>`,
        },
        {
            title: 'Entry Blur Fade',
            preview: <BadgeEntryBlurFade />,
            code: `<motion.div
  initial={{ filter: 'blur(4px)' }}
  animate={{ filter: 'blur(0px)' }}
  transition={{ duration: 0.65, ease: 'easeInOut' }}
>
  <Badge className="border border-[#3b82f6]/30 rounded-md">
    <Bookmark size={12} /> Badge token
  </Badge>
</motion.div>`,
        },
        {
            title: 'Tap Spring',
            preview: <BadgeTapSpring />,
            code: `<motion.div
  whileTap={{ scale: 0.96, transition: { type: 'spring', stiffness: 420, damping: 30 } }}
>
  <Badge className="border border-[#3b82f6]/30 rounded-md">
    <Bookmark size={12} /> Badge token
  </Badge>
</motion.div>`,
        },
    ],

    /* ── Button ── */
    button: [
        {
            title: 'Primary Hero',
            preview: <ButtonPrimaryHero />,
            code: `<motion.div
  initial={{ scale: 0.9, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
  whileHover={{ y: -2, scale: 1.03 }}
>
  <Button className="rounded-xl h-12 px-7 bg-gradient-to-b from-[#f5a623] to-[#e8940c] hover:bg-transparent text-[#1a1a1d]">
    Get Started <ArrowRight size={18} />
  </Button>
</motion.div>`,
        },
        {
            title: 'Outline Hover',
            preview: <ButtonOutlineHover />,
            code: `<motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
  <Button variant="outline"
    className="rounded-lg h-9 px-4 border-white/10 text-[#e2e8f0] hover:bg-white/[0.04]">
    Learn More
  </Button>
</motion.div>`,
        },
        {
            title: 'Gradient Slide',
            preview: <ButtonGradientSlide />,
            code: `<Button
  className="ui-studio-effect-gradient-slide rounded-xl h-10 px-5 bg-[#7c3aed] hover:bg-[#7c3aed] text-white"
  style={{
    '--ui-motion-gradient-from': '#4f46e5',
    '--ui-motion-gradient-to': '#9f72ff',
    '--ui-effect-gs-speed': '0.35s',
  }}
>
  <Zap size={16} /> Activate
</Button>`,
        },
        {
            title: 'Border Beam',
            preview: <ButtonBorderBeam />,
            code: `<Button
  className="ui-studio-effect-border-beam rounded-xl h-[46px] px-7 bg-[#0f0f11] hover:bg-[#0f0f11] text-[#f0ede8]"
  style={{
    '--ui-effect-beam-speed': '5s',
    '--ui-effect-beam-from': '#f472b6',
    '--ui-effect-beam-to': '#ec4899',
  }}
>
  <Sparkles size={18} /> Premium Plan
</Button>`,
        },
        {
            title: 'Animated Border',
            preview: <ButtonAnimatedBorder />,
            code: `<Button
  className="ui-studio-effect-animated-border rounded-lg h-9 px-4 border-2 bg-[#7c3aed] hover:bg-[#7c3aed] text-white"
  style={{
    '--ui-effect-border-speed': '3s',
    '--ui-effect-fill-base': '#7c3aed',
    '--ui-effect-border-1': '#8b5cf6',
    '--ui-effect-border-2': '#6d28d9',
    '--ui-effect-border-3': '#a78bfa',
  }}
>
  <Star size={15} /> Upgrade
</Button>`,
        },
        {
            title: 'Ripple Fill',
            preview: <ButtonRippleFill />,
            code: `<Button
  className="ui-studio-effect-ripple-fill rounded-lg h-10 px-5 bg-[#059669] hover:bg-[#059669] text-white"
  style={{ '--ui-motion-ripple-color': '#047857', '--ui-effect-ripple-speed': '0.5s' }}
>
  <Download size={16} /> Download
</Button>`,
        },
        {
            title: 'Shine Border',
            preview: <ButtonShineBorder />,
            code: `<Button
  className="ui-studio-effect-shine-border rounded-lg h-8 px-4 bg-[#4338ca] hover:bg-[#4338ca] text-white text-xs"
  style={{ '--ui-effect-shine-speed': '3.5s', '--ui-effect-shine-color': '#ffffff' }}
>
  <Shield size={13} /> Secure
</Button>`,
        },
        {
            title: 'Pulse Ring',
            preview: <ButtonPulseRing />,
            code: `<motion.div
  initial={{ opacity: 0, y: 8 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ type: 'spring', stiffness: 200, damping: 18 }}
>
  <Button
    className="ui-studio-effect-pulse-ring rounded-xl h-10 px-5 bg-[#0284c7] hover:bg-[#0284c7] text-white"
    style={{ '--ui-effect-pulse-speed': '1.8s', '--ui-effect-pulse-color': '#38bdf8' }}
  >
    <Rocket size={16} /> Launch
  </Button>
</motion.div>`,
        },
        {
            title: 'Glass',
            preview: <ButtonGlass />,
            code: `<motion.div whileHover={{ y: -2, scale: 1.03 }} whileTap={{ scale: 0.97 }}>
  <Button className="rounded-xl h-10 px-5 bg-white/[0.06] hover:bg-white/[0.06] text-[#f0ede8] border border-white/[0.12] backdrop-blur-xl">
    <Heart size={15} /> Favourite
  </Button>
</motion.div>`,
        },
        {
            title: 'Dark Minimal',
            preview: <ButtonDarkMinimal />,
            code: `<motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.94 }}>
  <Button variant="ghost" className="rounded-md h-7 px-3 text-xs text-[#9a9aa3] hover:text-[#f0ede8]">
    <Plus size={13} /> Add
  </Button>
</motion.div>`,
        },
        {
            title: 'Destructive',
            preview: <ButtonDestructive />,
            code: `<motion.div
  initial={{ filter: 'blur(4px)', opacity: 0 }}
  animate={{ filter: 'blur(0px)', opacity: 1 }}
  whileHover={{ scale: 1.02 }}
>
  <Button variant="destructive" className="rounded-lg h-9 px-4 bg-[#e11d48] text-white">
    Delete Project
  </Button>
</motion.div>`,
        },
        {
            title: 'Border Beam Compact',
            preview: <ButtonBorderBeamCompact />,
            code: `<Button
  className="ui-studio-effect-border-beam rounded-lg h-7 px-3.5 bg-[#0f0f11] hover:bg-[#0f0f11] text-[#e2e8f0] text-[11px]"
  style={{ '--ui-effect-beam-speed': '4s', '--ui-effect-beam-from': '#22d3ee', '--ui-effect-beam-to': '#06b6d4' }}
>
  <Send size={12} /> Send
</Button>`,
        },
    ],

    /* ── Card ── */
    card: [
        {
            title: 'Default',
            preview: <CardDefault />,
            code: `<Card className="bg-[var(--j6-neutral-600-dark)] border border-[#5a5a64] rounded-lg">
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>A short description.</CardDescription>
  </CardHeader>
  <CardContent><p>Card body content goes here.</p></CardContent>
</Card>`,
        },
        {
            title: 'Elevated Action',
            preview: <CardElevatedAction />,
            code: `<Card variant="elevated" className="bg-[var(--j6-neutral-700-light)] shadow-lg rounded-lg">
  <CardHeader>
    <CardTitle>Elevated Card</CardTitle>
    <CardDescription>Enhanced depth with shadow.</CardDescription>
  </CardHeader>
  <CardContent><p>Content with a CTA below.</p></CardContent>
  <CardFooter><Button size="sm">Action</Button></CardFooter>
</Card>`,
        },
        {
            title: 'Glass',
            preview: <CardGlass />,
            code: `<Card variant="glass"
  className="bg-[#000000]/0 border border-[#ffffff]/20 rounded-lg backdrop-[blur(40px)]"
>
  <CardHeader>
    <CardTitle>Glass Card</CardTitle>
    <CardDescription>Frosted glass effect.</CardDescription>
  </CardHeader>
  <CardContent><p>Transparent with backdrop blur.</p></CardContent>
</Card>`,
        },
        {
            title: 'Hover Lift',
            preview: <CardHoverLift />,
            code: `<motion.div
  whileHover={{ y: -4, scale: 1.02, transition: { type: 'spring', stiffness: 400, damping: 25 } }}
>
  <Card className="bg-[var(--j6-neutral-600-dark)] border border-[#5a5a64] rounded-lg">
    <CardHeader><CardTitle>Hover Card</CardTitle></CardHeader>
    <CardContent><p>Spring-animated hover interaction.</p></CardContent>
  </Card>
</motion.div>`,
        },
        {
            title: 'Entry Scale Up',
            preview: <CardEntryScaleUp />,
            code: `<motion.div
  initial={{ scale: 0.92, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  transition={{ duration: 0.5, ease: 'easeOut' }}
>
  <Card className="bg-[var(--j6-neutral-600-dark)] rounded-lg">
    <CardHeader><CardTitle>Animated Card</CardTitle></CardHeader>
    <CardContent><p>Smooth entry animation.</p></CardContent>
  </Card>
</motion.div>`,
        },
        {
            title: 'Border Beam',
            preview: <CardBorderBeam />,
            code: `<Card
  className="ui-studio-effect-border-beam bg-[var(--j6-neutral-600-dark)] rounded-lg"
  style={{
    '--ui-effect-beam-speed': '6s',
    '--ui-effect-beam-from': '#9f72ff',
    '--ui-effect-beam-to': '#6d28d9',
  }}
>
  <CardHeader><CardTitle>Premium Card</CardTitle></CardHeader>
  <CardContent><p>Violet border beam effect.</p></CardContent>
</Card>`,
        },
    ],

    /* ── Checkbox ── */
    checkbox: [
        createBuilderExample({
            title: 'Basic',
            kind: 'checkbox',
            presetId: 'basic',
            overrides: {
                checkboxLabel: 'Enable notifications',
                checkboxState: 'checked',
                fontColor: '#f4f4f5',
            },
            previewClassName: 'min-h-[180px]',
        }),
        createBuilderExample({
            title: 'Dark',
            kind: 'checkbox',
            presetId: 'dark',
            overrides: {
                checkboxLabel: 'Marketing emails',
                checkboxState: 'checked',
                fontColor: '#f4f4f5',
            },
            previewClassName: 'min-h-[180px]',
        }),
        createBuilderExample({
            title: 'Rounded',
            kind: 'checkbox',
            presetId: 'rounded',
            overrides: {
                checkboxLabel: 'Push notifications',
                checkboxState: 'checked',
                fontColor: '#f4f4f5',
            },
            previewClassName: 'min-h-[180px]',
        }),
        createBuilderExample({
            title: 'Disabled',
            kind: 'checkbox',
            presetId: 'pill',
            overrides: {
                checkboxLabel: 'SMS alerts',
                checkboxState: 'unchecked',
                checkboxDisabled: true,
                fontColor: '#a1a1aa',
            },
            previewClassName: 'min-h-[180px]',
        }),
    ],

    /* ── Data Table ── */
    'data-table': [
        {
            title: 'Dark Striped',
            preview: <DataTableDarkStriped />,
            code: `<DataTable
  columns={columns}
  data={data}
  sortable
  striped
  headerBg="#2a2a2e"
  rowBg="#3a3a3f"
  stripedBg="#2a2a2e"
  textColor="#e2e8f0"
  borderColor="#5a5a64"
/>`,
        },
        {
            title: 'Amber Compact',
            preview: <DataTableAmberCompact />,
            code: `<DataTable
  columns={columns}
  data={data}
  sortable
  size="sm"
  headerBg="var(--j6-amber-400-light)"
  headerTextColor="var(--j6-neutral-600-dark)"
  textColor="var(--j6-neutral-400-light)"
/>`,
        },
        {
            title: 'Entry Blur Fade',
            preview: <DataTableEntryBlurFade />,
            code: `<motion.div
  initial={{ filter: 'blur(4px)', opacity: 0 }}
  animate={{ filter: 'blur(0px)', opacity: 1 }}
  transition={{ duration: 0.65, ease: 'easeInOut' }}
>
  <DataTable columns={columns} data={data} sortable striped />
</motion.div>`,
        },
    ],

    /* ── Dialog ── */
    dialog: [
        createBuilderExample({
            title: 'Publish Dialog',
            kind: 'dialog',
            presetId: 'contrast',
            overrides: {
                dialogTitleText: 'Publish changes',
                dialogBodyText: 'Version 2.1 will replace the current draft and notify subscribers as soon as the release goes live.',
                dialogActionButtonText: 'Publish',
                dialogShowActionButton: true,
                dialogShowCloseIcon: true,
                panelCornerRadius: 24,
                panelFillColor: '#141416',
                panelFillOpacity: 100,
                panelStrokeColor: '#303035',
                panelStrokeOpacity: 100,
                panelFontColor: '#f0ede8',
            },
            pinOverlayOpen: true,
            previewClassName: 'overflow-hidden p-0 min-h-[420px]',
        }),
        createBuilderExample({
            title: 'Migration Confirm',
            kind: 'dialog',
            presetId: 'brand',
            overrides: {
                dialogTitleText: 'Start migration?',
                dialogBodyText: 'Queue the release, apply the token rename, and notify the team once the final pass is complete.',
                dialogActionButtonText: 'Start migration',
                dialogShowActionButton: true,
                panelCornerRadius: 24,
                panelFillColor: '#171109',
                panelFillOpacity: 98,
                panelStrokeColor: '#8a5a14',
                panelStrokeOpacity: 84,
                dialogTitleColor: '#f8ecd8',
                dialogBodyColor: '#d7c6ac',
            },
            pinOverlayOpen: true,
            previewClassName: 'overflow-hidden p-0 min-h-[420px]',
        }),
        createBuilderExample({
            title: 'Destructive Confirm',
            kind: 'dialog',
            presetId: 'sunset',
            overrides: {
                dialogTitleText: 'Delete this workspace?',
                dialogBodyText: 'This action is irreversible. All component drafts, comments, and export history will be removed.',
                dialogActionButtonText: 'Delete forever',
                dialogShowActionButton: true,
                panelCornerRadius: 24,
                panelFillColor: '#160c10',
                panelFillOpacity: 100,
                panelStrokeColor: '#fb7185',
                panelStrokeOpacity: 26,
                dialogTitleColor: '#ffe4ea',
                dialogBodyColor: '#fecdd3',
            },
            pinOverlayOpen: true,
            previewClassName: 'overflow-hidden p-0 min-h-[420px]',
        }),
    ],

    /* ── Drawer ── */
    drawer: [
        {
            title: 'Project Drawer',
            preview: <DrawerTriggerRight />,
            code: `<Drawer>
  <DrawerTrigger asChild>
    <Button className="bg-[#1e1e22] hover:bg-[#1e1e22] border border-[#303035] text-[#e2e8f0]">
      Open Drawer
    </Button>
  </DrawerTrigger>
  <DrawerContent side="right" className="border-l border-white/10 bg-[#141416] text-[#f0ede8]">
    <DrawerHeader>
      <DrawerTitle>Project details</DrawerTitle>
      <DrawerDescription>Quick access to launch settings and release notes.</DrawerDescription>
    </DrawerHeader>
  </DrawerContent>
</Drawer>`,
        },
        {
            title: 'Settings Drawer',
            preview: <DrawerTriggerSettings />,
            code: `<Drawer>
  <DrawerTrigger asChild>
    <Button className="bg-[#f5a623] hover:bg-[#ffba4a] text-[#1a1a1d]">
      Settings
    </Button>
  </DrawerTrigger>
  <DrawerContent side="left" className="border-r border-[#f5a623]/20 bg-[#120f0f] text-[#f7efe4]">
    <DrawerHeader>
      <DrawerTitle>Workspace settings</DrawerTitle>
      <DrawerDescription>Tune access and notification preferences.</DrawerDescription>
    </DrawerHeader>
  </DrawerContent>
</Drawer>`,
        },
    ],

    /* ── Dropdown Menu ── */
    'dropdown-menu': [
        {
            title: 'Project Actions',
            preview: <DropdownMenuTriggerDark />,
            code: `<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button className="bg-[#1e1e22] hover:bg-[#1e1e22] border border-[#303035] text-[#e2e8f0]">
      Options <ChevronDown size={14} />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent className="w-56 border-white/10 bg-[#141416] text-[#f0ede8]">
    <DropdownMenuItem>Export build</DropdownMenuItem>
    <DropdownMenuItem>Duplicate</DropdownMenuItem>
    <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>`,
        },
        {
            title: 'Quick Actions',
            preview: <DropdownMenuTriggerAmber />,
            code: `<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button className="bg-[#f5a623] hover:bg-[#ffba4a] text-[#1a1a1d]">
      Actions <ChevronDown size={14} />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent className="w-52 border-[#f5a623]/25 bg-[#1a1510] text-[#fff1d6]">
    <DropdownMenuItem>Promote draft</DropdownMenuItem>
    <DropdownMenuItem>Share preview</DropdownMenuItem>
    <DropdownMenuItem variant="destructive">Archive</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>`,
        },
        {
            title: 'Submenu',
            preview: <DropdownMenuTriggerEffect />,
            code: `<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button className="ui-studio-effect-gradient-slide bg-[#7c3aed] hover:bg-[#7c3aed] text-white">
      Menu <ChevronDown size={14} />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent className="w-56 border-[#8b5cf6]/25 bg-[#120d1d] text-white">
    <DropdownMenuItem>Clone style</DropdownMenuItem>
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>Share</DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
        <DropdownMenuItem>Copy link</DropdownMenuItem>
        <DropdownMenuItem>Invite team</DropdownMenuItem>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  </DropdownMenuContent>
</DropdownMenu>`,
        },
    ],

    /* ── Input ── */
    input: [
        {
            title: 'Dark',
            preview: <InputDark />,
            code: `<div className="flex flex-col gap-2">
  <Label>Email</Label>
  <Input
    type="email"
    placeholder="name@example.com"
    className="bg-[var(--j6-neutral-600-dark)] border border-[#5a5a64] rounded-sm"
  />
</div>`,
        },
        {
            title: 'Light',
            preview: <InputLight />,
            code: `<div className="flex flex-col gap-2">
  <Label>Username</Label>
  <Input
    type="text"
    placeholder="Enter username"
    className="bg-[var(--j6-neutral-0-light)] border border-[#1f2937]/20 rounded-sm"
  />
</div>`,
        },
        {
            title: 'Entry Blur Fade',
            preview: <InputEntryBlurFade />,
            code: `<motion.div
  initial={{ filter: 'blur(4px)', opacity: 0 }}
  animate={{ filter: 'blur(0px)', opacity: 1 }}
  transition={{ duration: 0.55, ease: 'easeInOut' }}
>
  <Label>Search</Label>
  <Input type="search" placeholder="Search components..." />
</motion.div>`,
        },
        {
            title: 'Violet Focus',
            preview: <InputVioletFocus />,
            code: `<div className="flex flex-col gap-2">
  <Label>Password</Label>
  <Input
    type="password"
    placeholder="Enter password"
    className="bg-[var(--j6-neutral-700-light)] border-[var(--j6-violet-500-light)]/30
      focus:border-[var(--j6-violet-400)] focus:ring-[var(--j6-violet-400)]/20"
  />
</div>`,
        },
    ],

    /* ── Navigation Menu ── */
    'navigation-menu': [
        createBuilderExample({
            title: 'Branded',
            kind: 'navigation-menu',
            presetId: 'branded',
            overrides: {
                customWidth: 760,
                navMenuItemCount: 3,
                navMenuItems: [
                    { id: 'overview', label: 'Overview' },
                    { id: 'resources', label: 'Resources' },
                    { id: 'pricing', label: 'Pricing' },
                ],
                fillColor: '#05060a',
                fillOpacity: 100,
                strokeWeight: 0,
                fontColor: '#f4f4f5',
                fontSize: 16,
                cornerRadius: 14,
            },
            previewClassName: 'items-start overflow-visible px-8 pt-10 pb-24 min-h-[280px]',
        }),
        createBuilderExample({
            title: 'Dropdown + Brand',
            kind: 'navigation-menu',
            presetId: 'dropdown-branded',
            overrides: {
                customWidth: 760,
                navMenuItemCount: 3,
                navMenuItems: [
                    { id: 'overview', label: 'Overview' },
                    { id: 'resources', label: 'Resources' },
                    { id: 'pricing', label: 'Pricing' },
                ],
                fillColor: '#05060a',
                fillOpacity: 100,
                strokeWeight: 0,
                fontColor: '#f4f4f5',
                fontSize: 16,
                cornerRadius: 14,
            },
            previewClassName: 'items-start overflow-visible px-8 pt-10 pb-28 min-h-[320px]',
        }),
        createBuilderExample({
            title: 'Vertical',
            kind: 'navigation-menu',
            presetId: 'vertical',
            overrides: {
                navMenuItemCount: 3,
                navMenuItems: [
                    { id: 'dashboard', label: 'Dashboard' },
                    { id: 'settings', label: 'Settings' },
                    { id: 'billing', label: 'Billing' },
                ],
                navMenuHoverBg: '#113227',
                navMenuHoverText: '#d1fae5',
                navMenuActiveBg: '#1d4f3f',
                navMenuActiveText: '#ecfdf5',
                fillColor: '#05060a',
                fillOpacity: 100,
                strokeWeight: 0,
                fontColor: '#f4f4f5',
                fontSize: 16,
                cornerRadius: 14,
            },
            previewClassName: 'items-start overflow-visible px-8 py-10 min-h-[240px]',
        }),
    ],

    /* ── Popover ── */
    popover: [
        createBuilderExample({
            title: 'Migration Snapshot',
            kind: 'popover',
            presetId: 'migration-snapshot',
            pinOverlayOpen: true,
            previewClassName: 'items-start justify-start overflow-visible px-12 pt-10 pb-12 min-h-[260px]',
        }),
        createBuilderExample({
            title: 'Automation Panel',
            kind: 'popover',
            presetId: 'automation-panel',
            pinOverlayOpen: true,
            previewClassName: 'items-start justify-start overflow-visible px-12 pt-10 pb-12 min-h-[280px]',
        }),
        createBuilderExample({
            title: 'Profile Menu',
            kind: 'popover',
            presetId: 'profile-menu',
            overrides: {
                fillColor: '#f8fafc',
                fillOpacity: 100,
                fontColor: '#111827',
                strokeWeight: 1,
                strokeColor: '#e2e8f0',
                strokeOpacity: 100,
                cornerRadius: 14,
            },
            pinOverlayOpen: true,
            previewClassName: 'items-start justify-start overflow-visible px-12 pt-10 pb-12 min-h-[240px]',
        }),
    ],

    /* ── Progress ── */
    progress: [
        {
            title: 'Linear Amber',
            preview: <ProgressLinearAmber />,
            code: `<Progress
  value={65}
  trackColor="var(--j6-neutral-600-dark)"
  indicatorColor="var(--j6-amber-400-light)"
  size="md"
/>`,
        },
        {
            title: 'Linear With Label',
            preview: <ProgressLinearWithLabel />,
            code: `<Progress
  value={42}
  showLabel
  trackColor="var(--j6-neutral-600-dark)"
  indicatorColor="var(--j6-accent-emerald-light)"
  labelColor="var(--j6-neutral-200-light)"
  size="lg"
/>`,
        },
        {
            title: 'Circular Violet',
            preview: <ProgressCircularViolet />,
            code: `<Progress
  value={72}
  variant="circular"
  circularSize={56}
  circularStrokeWidth={5}
  trackColor="#3a3a3f"
  indicatorColor="var(--j6-violet-400)"
  showLabel
  labelColor="#c4a8ff"
/>`,
        },
        {
            title: 'Circular Small',
            preview: <ProgressCircularSmall />,
            code: `<Progress
  value={85}
  variant="circular"
  circularSize={40}
  circularStrokeWidth={3}
  trackColor="#2a2a2e"
  indicatorColor="var(--j6-accent-sky-light)"
/>`,
        },
        {
            title: 'Entry Blur Fade',
            preview: <ProgressEntryBlurFade />,
            code: `<motion.div
  initial={{ filter: 'blur(4px)', opacity: 0 }}
  animate={{ filter: 'blur(0px)', opacity: 1 }}
  transition={{ duration: 0.55, ease: 'easeInOut' }}
>
  <Progress value={55} trackColor="#2a2a2e"
    indicatorColor="var(--j6-accent-pink-light)" size="md" />
</motion.div>`,
        },
    ],

    /* ── Slider ── */
    slider: [
        {
            title: 'Dark',
            preview: <SliderDark />,
            code: `<div className="flex flex-col gap-3">
  <Label>Volume</Label>
  <Slider defaultValue={[50]} max={100} className="w-[200px]" />
</div>`,
        },
        {
            title: 'Range',
            preview: <SliderRange />,
            code: `<div className="flex flex-col gap-3">
  <Label>Price Range</Label>
  <Slider defaultValue={[25, 75]} max={100} className="w-[200px]" />
</div>`,
        },
        {
            title: 'Entry Blur Fade',
            preview: <SliderEntryBlurFade />,
            code: `<motion.div
  initial={{ filter: 'blur(4px)', opacity: 0 }}
  animate={{ filter: 'blur(0px)', opacity: 1 }}
  transition={{ duration: 0.55, ease: 'easeInOut' }}
>
  <Label>Brightness</Label>
  <Slider defaultValue={[70]} max={100} />
</motion.div>`,
        },
    ],

    /* ── Stateful Button ── */
    'stateful-button': [
        createBuilderExample({
            title: 'Brand Success',
            kind: 'stage-button',
            presetId: 'brand',
            overrides: {
                buttonPreviewState: 'active',
                effectLoadingActiveEnabled: true,
                effectLoadingOutcome: 'success',
                effectLoadingPosition: 'left',
                buttonShowText: true,
            },
            previewClassName: 'min-h-[180px]',
        }),
        createBuilderExample({
            title: 'Contrast Warning',
            kind: 'stage-button',
            presetId: 'contrast',
            overrides: {
                buttonPreviewState: 'active',
                effectLoadingActiveEnabled: true,
                effectLoadingOutcome: 'warning',
                effectLoadingPosition: 'right',
                buttonShowText: true,
            },
            previewClassName: 'min-h-[180px]',
        }),
        createBuilderExample({
            title: 'Sunset Failure',
            kind: 'stage-button',
            presetId: 'sunset',
            overrides: {
                buttonPreviewState: 'active',
                effectLoadingActiveEnabled: true,
                effectLoadingOutcome: 'failure',
                effectLoadingPosition: 'left',
                buttonShowText: true,
            },
            previewClassName: 'min-h-[180px]',
        }),
        createBuilderExample({
            title: 'Glass Success',
            kind: 'stage-button',
            presetId: 'glass',
            overrides: {
                buttonPreviewState: 'active',
                effectLoadingActiveEnabled: true,
                effectLoadingOutcome: 'success',
                effectLoadingPosition: 'left',
                buttonShowText: true,
            },
            previewClassName: 'min-h-[180px]',
        }),
    ],

    /* ── Switch ── */
    switch: [
        {
            title: 'Amber',
            preview: <SwitchAmber />,
            code: `<Switch
  trackColor="#3a3a3f"
  trackActiveColor="var(--j6-amber-400-light)"
  thumbColor="#e2e8f0"
/>`,
        },
        {
            title: 'Emerald',
            preview: <SwitchEmerald />,
            code: `<Switch
  trackColor="#3a3a3f"
  trackActiveColor="var(--j6-accent-emerald-light)"
  thumbColor="#e2e8f0"
/>`,
        },
        {
            title: 'Violet Small',
            preview: <SwitchVioletSmall />,
            code: `<Switch
  size="sm"
  trackColor="#3a3a3f"
  trackActiveColor="var(--j6-violet-500-light)"
  thumbColor="#e2e8f0"
/>`,
        },
        {
            title: 'Hover Scale',
            preview: <SwitchHoverScale />,
            code: `<motion.div whileHover={{ scale: 1.08, transition: { type: 'spring', stiffness: 400, damping: 20 } }}>
  <Switch
    trackColor="#3a3a3f"
    trackActiveColor="var(--j6-accent-sky-light)"
    thumbColor="#ffffff"
  />
</motion.div>`,
        },
    ],

    /* ── Tabs ── */
    tabs: [
        {
            title: 'Default Dark',
            preview: <TabsDefaultDark />,
            code: `<Tabs defaultValue="tab1">
  <TabsList variant="default" listBg="#2a2a2e">
    <TabsTrigger value="tab1"
      activeBg="var(--j6-amber-400-light)"
      activeTextColor="#1a1a1d"
      inactiveTextColor="#8a8a94">Overview</TabsTrigger>
    <TabsTrigger value="tab2" ...>Features</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Overview content</TabsContent>
</Tabs>`,
        },
        {
            title: 'Line Violet',
            preview: <TabsLineViolet />,
            code: `<Tabs defaultValue="tab1">
  <TabsList variant="line">
    <TabsTrigger value="tab1"
      indicatorColor="var(--j6-violet-400)"
      activeTextColor="#c4a8ff"
      inactiveTextColor="#8a8a94">Design</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Design tab</TabsContent>
</Tabs>`,
        },
        {
            title: 'Pill Emerald',
            preview: <TabsPillEmerald />,
            code: `<Tabs defaultValue="tab1">
  <TabsList variant="pill">
    <TabsTrigger value="tab1"
      activeBg="var(--j6-accent-emerald-light)"
      activeTextColor="#ffffff"
      inactiveTextColor="#8a8a94">Active</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Active items</TabsContent>
</Tabs>`,
        },
        {
            title: 'Segment Entry',
            preview: <TabsSegmentEntry />,
            code: `<motion.div
  initial={{ filter: 'blur(4px)', opacity: 0 }}
  animate={{ filter: 'blur(0px)', opacity: 1 }}
  transition={{ duration: 0.55, ease: 'easeInOut' }}
>
  <Tabs defaultValue="tab1">
    <TabsList variant="segment">
      <TabsTrigger value="tab1"
        activeBg="var(--j6-accent-sky-light)"
        activeTextColor="#ffffff">Day</TabsTrigger>
    </TabsList>
    <TabsContent value="tab1">Daily view</TabsContent>
  </Tabs>
</motion.div>`,
        },
    ],

    /* ── Tooltip ── */
    tooltip: [
        {
            title: 'Default',
            preview: <TooltipDefault />,
            code: `<Tooltip>
  <TooltipTrigger className="bg-[var(--j6-neutral-600-dark)] border border-[#5a5a64]">
    Hover me
  </TooltipTrigger>
  <TooltipContent>Tooltip content</TooltipContent>
</Tooltip>`,
        },
        {
            title: 'Inverse',
            preview: <TooltipInverse />,
            code: `<Tooltip>
  <TooltipTrigger className="bg-[var(--j6-amber-400-light)]">
    Hover me
  </TooltipTrigger>
  <TooltipContent inverse>Inverse tooltip</TooltipContent>
</Tooltip>`,
        },
        {
            title: 'No Arrow',
            preview: <TooltipNoArrow />,
            code: `<Tooltip>
  <TooltipTrigger className="bg-[var(--j6-violet-500-light)]">
    No arrow
  </TooltipTrigger>
  <TooltipContent arrow={false}>Tooltip without arrow</TooltipContent>
</Tooltip>`,
        },
    ],

    /* ── Area Chart Card ── */
    'area-chart-card': [
        {
            title: 'Area Chart Card',
            preview: (
                <div style={{ width: 320 }}>
                    <AreaChartCard title="Revenue" total={1544} totalFormat="currency" subtitle="+12.5% from last month" data={CHART_DEMO_DATA} color="hsl(142 76% 36%)" />
                </div>
            ),
            code: `<AreaChartCard title="Revenue" total={1544} totalFormat="currency" data={data} color="hsl(142 76% 36%)" />`,
        },
    ],

    /* ── Bar Chart Card ── */
    'bar-chart-card': [
        {
            title: 'Bar Chart Card',
            preview: (
                <div style={{ width: 320 }}>
                    <BarChartCard title="Orders" total={1234} totalFormat="number" subtitle="This week" data={CHART_DEMO_DATA} color="hsl(221 83% 53%)" highlightStrategy="max" />
                </div>
            ),
            code: `<BarChartCard title="Orders" total={1234} data={data} highlightStrategy="max" />`,
        },
    ],

    /* ── Line Chart Card ── */
    'line-chart-card': [
        {
            title: 'Line Chart Card',
            preview: (
                <div style={{ width: 320 }}>
                    <LineChartCard title="Conversions" subtitle="Last 7 days" data={CHART_DEMO_DATA} color="hsl(262 83% 58%)" curveType="bump" glowIntensity={8} />
                </div>
            ),
            code: `<LineChartCard title="Conversions" data={data} color="hsl(262 83% 58%)" curveType="bump" />`,
        },
    ],

    /* ── Radial Chart Card ── */
    'radial-chart-card': [
        {
            title: 'Radial Chart Card',
            preview: (
                <div style={{ width: 360 }}>
                    <RadialChartCard title="Traffic Sources" total={1000} data={CHART_PIE_DATA} showLegend />
                </div>
            ),
            code: `<RadialChartCard title="Traffic Sources" total={1000} data={data} showLegend />`,
        },
    ],

    /* ── Rounded Pie Chart Card ── */
    'rounded-pie-chart-card': [
        {
            title: 'Pie Chart Card',
            preview: (
                <div style={{ width: 360 }}>
                    <RoundedPieChartCard title="Device Breakdown" total={1000} data={CHART_PIE_DATA} showLegend />
                </div>
            ),
            code: `<RoundedPieChartCard title="Device Breakdown" total={1000} data={data} showLegend />`,
        },
    ],

    /* ── Dotted Multi-Line Chart Card ── */
    'dotted-multi-line-chart-card': [
        {
            title: 'Multi-Line Chart Card',
            preview: (
                <div style={{ width: 320 }}>
                    <DottedMultiLineChartCard title="Revenue vs Expenses" total={1224} data={CHART_MULTI_LINE_DATA} primaryLabel="Revenue" secondaryLabel="Expenses" />
                </div>
            ),
            code: `<DottedMultiLineChartCard title="Revenue vs Expenses" total={1224} data={data} />`,
        },
    ],

    /* ── Metric Card ── */
    'metric-card': [
        {
            title: 'Small (Compact)',
            preview: (
                <div className="grid gap-3" style={{ width: 340 }}>
                    <MetricCard size="sm" title="Active Users" value={2847} format="number" trend={{ value: 12, isPositive: true }} variant="accent-left" accentColor="hsl(142 76% 36%)" />
                    <MetricCard size="sm" title="Revenue" value={12450} format="currency" trend={{ value: 8, isPositive: true }} variant="accent-left" accentColor="hsl(221 83% 53%)" icon={<span>£</span>} />
                    <MetricCard size="sm" title="Churn" value={3.2} format="percentage" trend={{ value: 5, isPositive: false }} variant="bordered" accentColor="hsl(0 84% 60%)" />
                </div>
            ),
            code: `<MetricCard size="sm" title="Active Users" value={2847} format="number" trend={{ value: 12, isPositive: true }} variant="accent-left" />`,
        },
        {
            title: 'Medium with Sparkline',
            preview: (
                <div className="grid grid-cols-2 gap-3" style={{ width: 600 }}>
                    <MetricCard size="md" title="Revenue" value={12450} format="currency" trend={{ value: 12, isPositive: true }} sparkline={{ data: METRIC_SPARK_DATA, type: 'area' }} accentColor="hsl(142 76% 36%)" />
                    <MetricCard size="md" title="Orders" value={847} format="number" trend={{ value: 5, isPositive: false }} sparkline={{ data: METRIC_SPARK_DATA, type: 'bar' }} accentColor="hsl(221 83% 53%)" variant="accent-top" />
                </div>
            ),
            code: `<MetricCard size="md" title="Revenue" value={12450} format="currency" sparkline={{ data, type: 'area' }} />`,
        },
        {
            title: 'Large with CountUp',
            preview: (
                <div style={{ width: 320 }}>
                    <MetricCard size="lg" title="Total Revenue" value={45200} format="currency" animate trend={{ value: 18, isPositive: true }} subtitle="Q1 2026 total" sparkline={{ data: METRIC_SPARK_DATA, type: 'line' }} accentColor="hsl(262 83% 58%)" variant="glass" />
                </div>
            ),
            code: `<MetricCard size="lg" title="Total Revenue" value={45200} format="currency" animate sparkline={{ data, type: 'line' }} />`,
        },
    ],

    /* ── Compact SM Variants ── */
    'compact-sm-variants': [
        {
            title: 'Live Activity',
            preview: (
                <div style={{ width: 340 }}>
                    <LiveActivityCompactCard latestUpdate="New deployment to production" footerHint="2 minutes ago" isLive />
                </div>
            ),
            code: `<LiveActivityCompactCard latestUpdate="New deployment to production" isLive />`,
        },
        {
            title: 'Next Event',
            preview: (
                <div style={{ width: 340 }}>
                    <NextEventCompactCard eventName="Sprint Planning" eventTime="Thu · 14:00 – 15:00" status="Confirmed" isOnlineMeeting attendees={COMPACT_DEMO_USERS.slice(0, 3)} location="Google Meet" />
                </div>
            ),
            code: `<NextEventCompactCard eventName="Sprint Planning" eventTime="Thu · 14:00 – 15:00" isOnlineMeeting />`,
        },
        {
            title: "Who's Online",
            preview: (
                <div style={{ width: 340 }}>
                    <WhosOnlineCompactCard users={COMPACT_DEMO_USERS} countLabel="5 active in workspace" />
                </div>
            ),
            code: `<WhosOnlineCompactCard users={users} countLabel="5 active in workspace" />`,
        },
        {
            title: 'Spark Stats',
            preview: (
                <div style={{ width: 340 }}>
                    <SparkStatsCompactCard title="CPU Usage" value={72.4} format="percentage" statLabel="+0.6% over last 8 samples" data={COMPACT_SPARK_POINTS} chartType="area" />
                </div>
            ),
            code: `<SparkStatsCompactCard title="CPU Usage" value={72.4} format="percentage" data={sparkPoints} />`,
        },
    ],
};
