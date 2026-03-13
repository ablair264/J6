import type { ReactNode } from 'react';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Variation component imports
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
import { AccordionDarkAmber, AccordionLightSpaced, AccordionEntryBlurFade, AccordionMultipleOpen } from './examples/accordion-variations';
import { AlertInfo, AlertSuccess, AlertWarningDismissible, AlertError, AlertEntryBlurFade, AlertEntryScaleUp } from './examples/alert-variations';
import { AnimatedTextTypewriter, AnimatedTextBlurIn, AnimatedTextSplitEntrance, AnimatedTextGradientSweep, AnimatedTextShiny, AnimatedTextDecrypt, AnimatedTextCountingNumber, AnimatedTextWordRotate, AnimatedTextBounce } from './examples/animated-text-variations';
import { AvatarWithBadge, AvatarGroupStacked } from './examples/avatar-variations';
import { BadgeSolidDestructive, BadgeOutline, BadgePillSky, BadgeGrainBell, BadgeGrainPlain, BadgeGrainIconOnly, BadgeStatusSuccess, BadgeStatusWarning, BadgeStatusError, BadgeStatusInfo, BadgeEntryBlurFade, BadgeTapSpring } from './examples/badge-variations';
import { ButtonEntryScaleDown, ButtonEntryScaleUp, ButtonHoverLift, ButtonHoverTapCombo, ButtonGradientSlide, ButtonAnimatedBorder, ButtonRippleFill, ButtonBorderBeam, ButtonBorderBeamLarge, ButtonShineBorder, ButtonPulseRing, ButtonGlass } from './examples/button-variations';
import { CardDefault, CardElevatedAction, CardGlass, CardHoverLift, CardEntryScaleUp, CardBorderBeam } from './examples/card-variations';
import { CheckboxDefault } from './examples/checkbox-variations';
import { DataTableDarkStriped, DataTableAmberCompact, DataTableEntryBlurFade } from './examples/datatable-variations';
import { DialogTriggerDark, DialogTriggerAmber, DialogTriggerDestructive } from './examples/dialog-variations';
import { DrawerTriggerRight, DrawerTriggerSettings } from './examples/drawer-variations';
import { DropdownMenuTriggerDark, DropdownMenuTriggerAmber, DropdownMenuTriggerEffect } from './examples/dropdown-menu-variations';
import { InputDark, InputLight, InputEntryBlurFade, InputVioletFocus } from './examples/input-variations';
import { NavigationMenuDarkAmber, NavigationMenuViolet, NavigationMenuVertical } from './examples/navigation-menu-variations';
import { PopoverTriggerDark, PopoverTriggerAmber, PopoverTriggerVioletGrain } from './examples/popover-variations';
import { ProgressLinearAmber, ProgressLinearWithLabel, ProgressCircularViolet, ProgressCircularSmall, ProgressEntryBlurFade } from './examples/progress-variations';
import { SliderDark, SliderRange, SliderEntryBlurFade } from './examples/slider-variations';
import { StageButtonEmeraldSuccess, StageButtonAmberWarning, StageButtonRoseFailure, StageButtonVioletGrain } from './examples/stagebutton-variations';
import { SwitchAmber, SwitchEmerald, SwitchVioletSmall, SwitchHoverScale } from './examples/switch-variations';
import { TabsDefaultDark, TabsLineViolet, TabsPillEmerald, TabsSegmentEntry } from './examples/tabs-variations';
import { TooltipDefault, TooltipInverse, TooltipNoArrow } from './examples/tooltip-variations';

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
        {
            title: 'Dark Amber',
            preview: <AccordionDarkAmber />,
            code: `<Accordion type="single" collapsible
  dividerColor="var(--j6-amber-500-light)"
  className="bg-[var(--j6-neutral-600-dark)] rounded-md"
>
  <AccordionItem value="item-1">
    <AccordionTrigger>What is UI Studio?</AccordionTrigger>
    <AccordionContent>A visual component design tool.</AccordionContent>
  </AccordionItem>
</Accordion>`,
        },
        {
            title: 'Light Spaced',
            preview: <AccordionLightSpaced />,
            code: `<Accordion type="single" collapsible
  dividerEnabled={false}
  spacing={8}
  className="bg-[var(--j6-neutral-50-light)] rounded-md"
>
  <AccordionItem value="item-1">
    <AccordionTrigger>Features</AccordionTrigger>
    <AccordionContent>Visual preview, live editing, and export.</AccordionContent>
  </AccordionItem>
</Accordion>`,
        },
        {
            title: 'Entry Blur Fade',
            preview: <AccordionEntryBlurFade />,
            code: `<motion.div
  initial={{ filter: 'blur(4px)', opacity: 0 }}
  animate={{ filter: 'blur(0px)', opacity: 1 }}
  transition={{ duration: 0.55, ease: 'easeInOut' }}
>
  <Accordion type="single" collapsible dividerColor="#5a5a64">
    <AccordionItem value="item-1">
      <AccordionTrigger>Getting started</AccordionTrigger>
      <AccordionContent>Install via pnpm and start designing.</AccordionContent>
    </AccordionItem>
  </Accordion>
</motion.div>`,
        },
        {
            title: 'Multiple Open',
            preview: <AccordionMultipleOpen />,
            code: `<Accordion type="multiple"
  dividerColor="var(--j6-violet-400)"
  className="bg-[var(--j6-neutral-700-light)] rounded-md"
>
  <AccordionItem value="item-1">
    <AccordionTrigger>Design tokens</AccordionTrigger>
    <AccordionContent>Primitives, semantics, and showcase themes.</AccordionContent>
  </AccordionItem>
  <AccordionItem value="item-2">
    <AccordionTrigger>Motion system</AccordionTrigger>
    <AccordionContent>Entry, hover, tap, and exit animations.</AccordionContent>
  </AccordionItem>
</Accordion>`,
        },
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
        {
            title: 'Typewriter',
            preview: <AnimatedTextTypewriter />,
            code: `<AnimatedText
  text="Welcome to UI Studio"
  variant="typewriter"
  speed={1.2}
  style={{ color: 'var(--j6-amber-400-light)' }}
/>`,
        },
        {
            title: 'Blur In',
            preview: <AnimatedTextBlurIn />,
            code: `<AnimatedText
  text="Design components visually"
  variant="blur-in"
  speed={0.3}
  stagger={0.06}
  splitBy="word"
/>`,
        },
        {
            title: 'Split Entrance',
            preview: <AnimatedTextSplitEntrance />,
            code: `<AnimatedText
  text="Preview in real-time"
  variant="split-entrance"
  speed={0.3}
  stagger={0.03}
  splitBy="char"
/>`,
        },
        {
            title: 'Gradient Sweep',
            preview: <AnimatedTextGradientSweep />,
            code: `<AnimatedText
  text="Export clean code"
  variant="gradient-sweep"
  speed={3}
  gradientColor1="var(--j6-accent-cyan-light)"
  gradientColor2="var(--j6-violet-400)"
/>`,
        },
        {
            title: 'Shiny',
            preview: <AnimatedTextShiny />,
            code: `<AnimatedText
  text="Premium components"
  variant="shiny-text"
  speed={2}
  gradientColor1="var(--j6-amber-500-light)"
  gradientColor2="rgba(255,255,255,0.9)"
/>`,
        },
        {
            title: 'Decrypt',
            preview: <AnimatedTextDecrypt />,
            code: `<AnimatedText
  text="SYSTEM ONLINE"
  variant="decrypt"
  speed={1}
  style={{ color: 'var(--j6-accent-emerald-light)', fontFamily: 'JetBrains Mono' }}
/>`,
        },
        {
            title: 'Counting Number',
            preview: <AnimatedTextCountingNumber />,
            code: `<AnimatedText
  text="1247"
  variant="counting-number"
  speed={1.5}
  className="text-3xl font-bold"
  style={{ color: 'var(--j6-amber-400-light)' }}
/>`,
        },
        {
            title: 'Word Rotate',
            preview: <AnimatedTextWordRotate />,
            code: `<AnimatedText
  text="Design, Preview, Export, Ship"
  variant="word-rotate"
  speed={2}
/>`,
        },
        {
            title: 'Bounce',
            preview: <AnimatedTextBounce />,
            code: `<AnimatedText
  text="Hover me!"
  variant="bounce"
  style={{ color: 'var(--j6-violet-400)' }}
/>`,
        },
    ],

    /* ── Avatar ── */
    avatar: [
        {
            title: 'With Badge',
            preview: <AvatarWithBadge />,
            code: `<motion.div whileHover={{ scale: 1.02 }}>
  <Avatar customSize={62} radius={999} badge badgeColor="#22c55e">
    <AvatarImage src="/images/avatar.jpg" alt="User" />
    <AvatarFallback>JD</AvatarFallback>
  </Avatar>
</motion.div>`,
        },
        {
            title: 'Group Stacked',
            preview: <AvatarGroupStacked />,
            code: `<motion.div whileHover={{ y: -2, scale: 1.04 }}>
  <AvatarGroup spacing={-8}>
    <Avatar customSize={48} radius={999} strokeWeight={1} strokeColor="#ffda80">
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
    <Avatar customSize={48} radius={999} strokeWeight={1} strokeColor="#ffda80">
      <AvatarFallback>LR</AvatarFallback>
    </Avatar>
    {/* ... */}
  </AvatarGroup>
</motion.div>`,
        },
    ],

    /* ── Badge ── */
    badge: [
        {
            title: 'Solid Destructive',
            preview: <BadgeSolidDestructive />,
            code: `<Badge
  className="rounded-md text-xs font-medium"
  style={{ background: 'rgba(239, 68, 68, 1)' }}
>
  <Ban size={12} /> Badge token
</Badge>`,
        },
        {
            title: 'Outline',
            preview: <BadgeOutline />,
            code: `<Badge
  className="border border-solid rounded-md text-xs"
  style={{ borderColor: 'rgba(203, 213, 225, 1)' }}
>
  Badge token
</Badge>`,
        },
        {
            title: 'Pill Sky',
            preview: <BadgePillSky />,
            code: `<Badge className="rounded-full bg-[var(--j6-accent-sky-light)] text-xs">
  Badge token
</Badge>`,
        },
        {
            title: 'Grain Bell',
            preview: <BadgeGrainBell />,
            code: `<Badge
  className="rounded-full ui-studio-effect-grain bg-[var(--j6-accent-sky-light)]"
  style={{ '--ui-effect-grain-opacity': '0.25', '--ui-effect-grain-size': '200' }}
>
  <Bell size={11} /> Badge token
</Badge>`,
        },
        {
            title: 'Grain Plain',
            preview: <BadgeGrainPlain />,
            code: `<Badge
  className="rounded-full ui-studio-effect-grain bg-[var(--j6-accent-sky-light)]"
  style={{ '--ui-effect-grain-opacity': '0.25', '--ui-effect-grain-size': '200' }}
>
  Badge token
</Badge>`,
        },
        {
            title: 'Grain Icon Only',
            preview: <BadgeGrainIconOnly />,
            code: `<Badge
  className="rounded-full ui-studio-effect-grain bg-[var(--j6-accent-sky-light)]"
  style={{ '--ui-effect-grain-opacity': '0.25' }}
>
  <Search size={11} />
</Badge>`,
        },
        {
            title: 'Status Success',
            preview: <BadgeStatusSuccess />,
            code: `<Badge
  className="border border-[#059669]/30 rounded-md"
  style={{ background: 'rgba(236, 253, 245, 1)', color: 'rgba(6, 95, 70, 1)' }}
>
  <Check size={10} /> Badge token
</Badge>`,
        },
        {
            title: 'Status Warning',
            preview: <BadgeStatusWarning />,
            code: `<Badge
  className="border border-[#ca8a04]/30 rounded-md"
  style={{ background: 'rgba(254, 252, 232, 1)', color: 'rgba(133, 77, 14, 1)' }}
>
  <Shield size={13} /> Badge token
</Badge>`,
        },
        {
            title: 'Status Error',
            preview: <BadgeStatusError />,
            code: `<Badge
  className="border border-[#dc2626]/20 rounded-md"
  style={{ background: 'rgba(254, 242, 242, 1)', color: 'rgba(153, 27, 27, 1)' }}
>
  <X size={12} /> Badge token
</Badge>`,
        },
        {
            title: 'Status Info',
            preview: <BadgeStatusInfo />,
            code: `<Badge
  className="border border-[#3b82f6]/30 rounded-md"
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
            title: 'Entry Scale Down',
            preview: <ButtonEntryScaleDown />,
            code: `<motion.div
  initial={{ scale: 1.11 }}
  animate={{ scale: 1 }}
  transition={{ duration: 0.55, ease: 'easeInOut' }}
>
  <Button className="bg-[var(--j6-amber-400-light)] rounded-sm">
    Primary action
  </Button>
</motion.div>`,
        },
        {
            title: 'Entry Scale Up',
            preview: <ButtonEntryScaleUp />,
            code: `<motion.div
  initial={{ scale: 0.92 }}
  animate={{ scale: 1 }}
  transition={{ duration: 0.55, ease: 'easeInOut' }}
>
  <Button className="bg-[var(--j6-amber-400-light)] rounded-sm">
    Primary action
  </Button>
</motion.div>`,
        },
        {
            title: 'Hover Lift',
            preview: <ButtonHoverLift />,
            code: `<motion.div
  whileHover={{ y: 1, scale: 1.04, transition: { type: 'spring', stiffness: 485, damping: 20 } }}
>
  <Button className="bg-[var(--j6-amber-400-light)] rounded-sm">
    Primary action
  </Button>
</motion.div>`,
        },
        {
            title: 'Hover + Tap Combo',
            preview: <ButtonHoverTapCombo />,
            code: `<motion.div
  whileHover={{ y: 1, scale: 1.04 }}
  whileTap={{ scale: 0.96 }}
>
  <Button className="bg-[var(--j6-amber-400-light)] rounded-sm">
    Primary action
  </Button>
</motion.div>`,
        },
        {
            title: 'Gradient Slide',
            preview: <ButtonGradientSlide />,
            code: `<Button
  className="ui-studio-effect-gradient-slide bg-[var(--j6-amber-400-light)] rounded-sm"
  style={{
    '--ui-motion-gradient-from': '#eb5a0c',
    '--ui-motion-gradient-to': '#ff8a05',
    '--ui-effect-gs-speed': '0.32s',
  }}
>
  <Bookmark size={18} /> Primary action
</Button>`,
        },
        {
            title: 'Animated Border',
            preview: <ButtonAnimatedBorder />,
            code: `<Button
  className="ui-studio-effect-animated-border border-2 rounded-sm"
  style={{
    '--ui-effect-border-speed': '2.8s',
    '--ui-effect-border-1': '#6d28d9',
    '--ui-effect-border-2': '#3b0e87',
    '--ui-effect-border-3': '#9f72ff',
  }}
>
  <Bookmark size={18} /> Primary action
</Button>`,
        },
        {
            title: 'Ripple Fill',
            preview: <ButtonRippleFill />,
            code: `<Button
  className="ui-studio-effect-ripple-fill bg-[var(--j6-violet-400)] rounded-sm"
  style={{
    '--ui-motion-ripple-color': '#3b0e87',
    '--ui-effect-ripple-speed': '0.5s',
  }}
>
  Primary action
</Button>`,
        },
        {
            title: 'Border Beam',
            preview: <ButtonBorderBeam />,
            code: `<Button
  className="ui-studio-effect-border-beam bg-[var(--j6-neutral-600-dark)] rounded-sm"
  style={{
    '--ui-effect-beam-speed': '6s',
    '--ui-effect-beam-from': '#f472b6',
    '--ui-effect-beam-to': '#db2777',
  }}
>
  Primary action
</Button>`,
        },
        {
            title: 'Border Beam Large',
            preview: <ButtonBorderBeamLarge />,
            code: `<Button
  className="ui-studio-effect-border-beam bg-[var(--j6-neutral-600-dark)] text-base min-h-[44px]"
  style={{
    '--ui-effect-beam-speed': '6s',
    '--ui-effect-beam-from': '#f472b6',
    '--ui-effect-beam-to': '#db2777',
  }}
>
  Primary action
</Button>`,
        },
        {
            title: 'Shine Border',
            preview: <ButtonShineBorder />,
            code: `<Button
  className="ui-studio-effect-shine-border bg-[var(--j6-accent-indigo-light)] rounded-sm"
  style={{
    '--ui-effect-shine-speed': '4s',
    '--ui-effect-shine-color': '#ffffff',
    '--ui-effect-shine-width': '2px',
  }}
>
  Primary action
</Button>`,
        },
        {
            title: 'Pulse Ring',
            preview: <ButtonPulseRing />,
            code: `<Button
  className="ui-studio-effect-pulse-ring bg-[var(--j6-accent-sky-light)] rounded-sm"
  style={{
    '--ui-effect-pulse-speed': '1.5s',
    '--ui-effect-pulse-color': '#22d3ee',
  }}
>
  Primary action
</Button>`,
        },
        {
            title: 'Glass',
            preview: <ButtonGlass />,
            code: `<motion.div whileHover={{ y: 1, scale: 1.04 }}>
  <Button
    className="bg-[#000000]/0 rounded-sm backdrop-[blur(40px)_saturate(160%)]"
    style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.14)' }}
  >
    Primary action
  </Button>
</motion.div>`,
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
        {
            title: 'Default',
            preview: <CheckboxDefault />,
            code: `<div className="flex items-center gap-2">
  <Checkbox
    id="checkbox-demo"
    defaultChecked
    style={{ '--ui-checkbox-selection-speed': '0.22s' }}
  />
  <Label htmlFor="checkbox-demo">Enable notifications</Label>
</div>`,
        },
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
        {
            title: 'Trigger Dark',
            preview: <DialogTriggerDark />,
            code: `<Button
  className="bg-[var(--j6-neutral-600-dark)] border border-[#5a5a64] rounded-sm"
  style={{ color: 'rgba(226, 232, 240, 1)' }}
>
  Open Dialog
</Button>`,
        },
        {
            title: 'Trigger Amber',
            preview: <DialogTriggerAmber />,
            code: `<Button
  className="bg-[var(--j6-amber-400-light)] border border-[#c4800a]/50 rounded-sm"
  style={{ color: 'var(--j6-neutral-600-dark)' }}
>
  Confirm Action
</Button>`,
        },
        {
            title: 'Trigger Destructive',
            preview: <DialogTriggerDestructive />,
            code: `<Button
  className="bg-[var(--j6-accent-rose-light)] rounded-sm"
  style={{ color: 'var(--j6-neutral-0-light)' }}
>
  Delete Item
</Button>`,
        },
    ],

    /* ── Drawer ── */
    drawer: [
        {
            title: 'Trigger Right',
            preview: <DrawerTriggerRight />,
            code: `<Button
  className="bg-[var(--j6-neutral-600-dark)] border border-[#5a5a64] rounded-sm"
  style={{ color: 'rgba(226, 232, 240, 1)' }}
>
  Open Drawer
</Button>`,
        },
        {
            title: 'Trigger Settings',
            preview: <DrawerTriggerSettings />,
            code: `<Button
  className="bg-[var(--j6-amber-400-light)] border border-[#c4800a]/50 rounded-sm"
  style={{ color: 'var(--j6-neutral-600-dark)' }}
>
  Settings
</Button>`,
        },
    ],

    /* ── Dropdown Menu ── */
    'dropdown-menu': [
        {
            title: 'Trigger Dark',
            preview: <DropdownMenuTriggerDark />,
            code: `<Button
  className="bg-[var(--j6-neutral-600-dark)] border border-[#5a5a64] rounded-sm"
  style={{ color: 'rgba(226, 232, 240, 1)' }}
>
  Options <ChevronDown size={14} />
</Button>`,
        },
        {
            title: 'Trigger Amber',
            preview: <DropdownMenuTriggerAmber />,
            code: `<motion.div whileHover={{ y: -1, scale: 1.03 }}>
  <Button className="bg-[var(--j6-amber-400-light)] rounded-sm">
    Actions <ChevronDown size={14} />
  </Button>
</motion.div>`,
        },
        {
            title: 'Trigger Effect',
            preview: <DropdownMenuTriggerEffect />,
            code: `<Button
  className="ui-studio-effect-gradient-slide bg-[var(--j6-violet-500-light)] rounded-sm"
  style={{
    '--ui-motion-gradient-from': '#6d28d9',
    '--ui-motion-gradient-to': '#9f72ff',
    '--ui-effect-gs-speed': '0.32s',
  }}
>
  Menu <ChevronDown size={14} />
</Button>`,
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
        {
            title: 'Dark Amber',
            preview: <NavigationMenuDarkAmber />,
            code: `<NavigationMenu
  hoverBg="rgba(255, 186, 74, 0.15)"
  hoverText="var(--j6-amber-400-light)"
>
  <NavigationMenuList>
    <NavigationMenuItem>
      <NavigationMenuLink href="#" navigationItem>Home</NavigationMenuLink>
    </NavigationMenuItem>
    <NavigationMenuItem>
      <NavigationMenuLink href="#" navigationItem active
        activeBg="rgba(255, 186, 74, 0.2)"
        activeText="var(--j6-amber-400-light)">Docs</NavigationMenuLink>
    </NavigationMenuItem>
  </NavigationMenuList>
</NavigationMenu>`,
        },
        {
            title: 'Violet',
            preview: <NavigationMenuViolet />,
            code: `<NavigationMenu
  hoverBg="rgba(159, 114, 255, 0.15)"
  hoverText="var(--j6-violet-400)"
>
  <NavigationMenuList>
    <NavigationMenuItem>
      <NavigationMenuLink href="#" navigationItem>Overview</NavigationMenuLink>
    </NavigationMenuItem>
  </NavigationMenuList>
</NavigationMenu>`,
        },
        {
            title: 'Vertical',
            preview: <NavigationMenuVertical />,
            code: `<NavigationMenu
  orientation="vertical"
  hoverBg="rgba(52, 211, 153, 0.12)"
  hoverText="var(--j6-accent-emerald-dark)"
>
  <NavigationMenuList>
    <NavigationMenuItem>
      <NavigationMenuLink href="#" navigationItem>Dashboard</NavigationMenuLink>
    </NavigationMenuItem>
    <NavigationMenuItem>
      <NavigationMenuLink href="#" navigationItem active
        activeBg="rgba(52, 211, 153, 0.15)">Settings</NavigationMenuLink>
    </NavigationMenuItem>
  </NavigationMenuList>
</NavigationMenu>`,
        },
    ],

    /* ── Popover ── */
    popover: [
        {
            title: 'Trigger Dark',
            preview: <PopoverTriggerDark />,
            code: `<Button
  className="bg-[var(--j6-neutral-600-dark)] border border-[#5a5a64] rounded-sm"
  style={{ color: 'rgba(226, 232, 240, 1)' }}
>
  More Info
</Button>`,
        },
        {
            title: 'Trigger Amber',
            preview: <PopoverTriggerAmber />,
            code: `<Button
  className="bg-[var(--j6-amber-400-light)] rounded-sm"
  style={{ color: 'var(--j6-neutral-600-dark)' }}
>
  Details
</Button>`,
        },
        {
            title: 'Trigger Violet Grain',
            preview: <PopoverTriggerVioletGrain />,
            code: `<Button
  className="ui-studio-effect-grain bg-[var(--j6-violet-500-light)] rounded-sm"
  style={{
    color: 'var(--j6-neutral-0-light)',
    '--ui-effect-grain-opacity': '0.2',
    '--ui-effect-grain-size': '200',
  }}
>
  Settings
</Button>`,
        },
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
        {
            title: 'Emerald Success',
            preview: <StageButtonEmeraldSuccess />,
            code: `<StatefulButton
  className="bg-[var(--j6-accent-emerald-light)] rounded-md"
  autoPlay
  resultState="success"
  loadingDurationMs={600}
  resetDelayMs={1600}
>
  Submit
</StatefulButton>`,
        },
        {
            title: 'Amber Warning',
            preview: <StageButtonAmberWarning />,
            code: `<StatefulButton
  className="bg-[var(--j6-amber-400-light)] rounded-md"
  autoPlay
  resultState="warning"
  loadingDurationMs={800}
>
  Validate
</StatefulButton>`,
        },
        {
            title: 'Rose Failure',
            preview: <StageButtonRoseFailure />,
            code: `<motion.div whileHover={{ y: -1, scale: 1.03 }}>
  <StatefulButton
    className="bg-[var(--j6-accent-rose-light)] rounded-md"
    autoPlay
    resultState="failure"
    loadingDurationMs={500}
  >
    Delete
  </StatefulButton>
</motion.div>`,
        },
        {
            title: 'Violet Grain',
            preview: <StageButtonVioletGrain />,
            code: `<StatefulButton
  className="ui-studio-effect-grain bg-[var(--j6-violet-500-light)] rounded-md"
  style={{ '--ui-effect-grain-opacity': '0.2', '--ui-effect-grain-size': '200' }}
  autoPlay
  resultState="success"
>
  Confirm
</StatefulButton>`,
        },
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
