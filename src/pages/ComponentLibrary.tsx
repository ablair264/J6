import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription, AlertAction } from '@/components/ui/alert';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { DataTable } from '@/components/ui/data-table';
import { Tooltip, TooltipContent } from '@/components/ui/tooltip';
import { AnimatedText } from '@/components/ui/animated-text';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

/* ─── Theme tokens (dark mode from ui-studio.theme) ─── */
const T = {
    bg: '#0a0a0b',
    subtle: '#111113',
    surface: '#141416',
    elevated: '#1a1a1d',
    text: '#f0ede8',
    textSec: '#9a9aa3',
    textMuted: '#6b6b72',
    brand: '#f5a623',
    brandHover: '#ffba4a',
    brandDark: '#d4890a',
    interactive: '#7c3aed',
    interactiveHover: '#9f72ff',
    border: 'rgba(255,255,255,0.08)',
    borderStrong: 'rgba(255,255,255,0.15)',
    success: '#34d399',
    warning: '#facc15',
    error: '#fb7185',
    info: '#38bdf8',
    // showcase accents
    electric: '#22d3ee',
    bloom: '#f472b6',
    acid: '#a3e635',
    plasma: '#818cf8',
    inferno: '#fb923c',
    crimson: '#f43f5e',
    spearmint: '#10b981',
    solar: '#facc15',
} as const;

/* ─── Layout helpers ─── */
function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
    return (
        <section style={{ borderTop: `1px solid ${T.border}` }} className="py-16 px-6 md:px-12 lg:px-20">
            <div className="max-w-7xl mx-auto">
                <div className="mb-10">
                    <h2 className="text-2xl font-semibold tracking-tight" style={{ color: T.text }}>{title}</h2>
                    {description && <p className="mt-2 text-sm leading-relaxed" style={{ color: T.textSec }}>{description}</p>}
                </div>
                {children}
            </div>
        </section>
    );
}

function SubSection({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="mb-10">
            <p className="text-xs font-medium uppercase tracking-widest mb-4" style={{ color: T.textMuted }}>{label}</p>
            {children}
        </div>
    );
}

function ShowcaseRow({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return <div className={`flex flex-wrap items-center gap-4 ${className}`}>{children}</div>;
}

/* ─── Sample data ─── */
const TABLE_COLUMNS = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'role', label: 'Role' },
    { key: 'status', label: 'Status', variant: 'badge' as const },
    { key: 'email', label: 'Email' },
];

const TABLE_DATA = [
    { name: 'Ava Chen', role: 'Lead Engineer', status: 'Active', email: 'ava@company.io' },
    { name: 'Kai Nakamura', role: 'Designer', status: 'Active', email: 'kai@company.io' },
    { name: 'Zara Osei', role: 'PM', status: 'Away', email: 'zara@company.io' },
    { name: 'Liam Torres', role: 'Backend Dev', status: 'Offline', email: 'liam@company.io' },
];

const TABLE_BADGE_COLORS = {
    Active: { bg: T.spearmint, text: '#0a0a0b' },
    Away: { bg: T.solar, text: '#0a0a0b' },
    Offline: { bg: T.textMuted, text: '#f0ede8' },
};

/* ─── Main Component ─── */
export default function ComponentLibrary() {
    const [switchOn, setSwitchOn] = useState(true);
    const [checkboxChecked, setCheckboxChecked] = useState<boolean | 'indeterminate'>(true);
    const [sliderValue, setSliderValue] = useState([65]);

    return (
        <div style={{ background: T.bg, color: T.text, minHeight: '100vh' }}>
            {/* ━━━ Header ━━━ */}
            <header className="px-6 md:px-12 lg:px-20 pt-12 pb-16 max-w-7xl mx-auto">
                <Link to="/" className="inline-flex items-center gap-2 text-sm mb-8 transition-colors hover:opacity-80" style={{ color: T.textSec }}>
                    <ArrowLeftIcon className="size-4" />
                    Back to home
                </Link>
                <div className="flex items-end justify-between gap-8 flex-wrap">
                    <div>
                        <p className="text-xs font-medium uppercase tracking-[0.2em] mb-3" style={{ color: T.brand }}>Component Library</p>
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight" style={{ color: T.text }}>
                            UI Studio <span style={{ color: T.brand }}>OSS</span>
                        </h1>
                        <p className="mt-4 text-base leading-relaxed max-w-xl" style={{ color: T.textSec }}>
                            21 production-ready components built with Radix primitives, React Motion, and a warm amber &amp; violet design system.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="size-3 rounded-full" style={{ background: T.brand, boxShadow: `0 0 12px ${T.brand}40` }} />
                        <span className="text-xs font-mono" style={{ color: T.textMuted }}>v1.0 — March 2026</span>
                    </div>
                </div>
                {/* Color swatches */}
                <div className="mt-10 flex flex-wrap gap-2">
                    {[
                        { label: 'Brand', color: T.brand },
                        { label: 'Interactive', color: T.interactive },
                        { label: 'Success', color: T.success },
                        { label: 'Warning', color: T.warning },
                        { label: 'Error', color: T.error },
                        { label: 'Info', color: T.info },
                        { label: 'Electric', color: T.electric },
                        { label: 'Bloom', color: T.bloom },
                        { label: 'Acid', color: T.acid },
                        { label: 'Plasma', color: T.plasma },
                    ].map((s) => (
                        <div key={s.label} className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: T.elevated, border: `1px solid ${T.border}` }}>
                            <div className="size-3 rounded-full" style={{ background: s.color }} />
                            <span className="text-xs font-mono" style={{ color: T.textSec }}>{s.label}</span>
                        </div>
                    ))}
                </div>
            </header>

            {/* ━━━ BUTTONS ━━━ */}
            <Section title="Button" description="Primary actions, secondary options, and ghost controls. CVA variants with amber brand and violet interactive accents.">
                <SubSection label="Primary — Brand">
                    <ShowcaseRow>
                        <Button size="lg" style={{ background: T.brand, color: '#0a0a0b', borderRadius: 12 }}>Get Started</Button>
                        <Button size="default" style={{ background: T.brand, color: '#0a0a0b', borderRadius: 10 }}>Confirm</Button>
                        <Button size="sm" style={{ background: T.brand, color: '#0a0a0b', borderRadius: 8 }}>Save</Button>
                        <Button size="xs" style={{ background: T.brand, color: '#0a0a0b', borderRadius: 6 }}>Tiny</Button>
                    </ShowcaseRow>
                </SubSection>
                <SubSection label="Interactive — Violet">
                    <ShowcaseRow>
                        <Button style={{ background: T.interactive, color: '#fff', borderRadius: 10 }}>Publish</Button>
                        <Button style={{ background: T.interactiveHover, color: '#fff', borderRadius: 10 }}>Hover State</Button>
                        <Button disabled style={{ background: T.interactive, color: '#fff', borderRadius: 10, opacity: 0.4 }}>Disabled</Button>
                    </ShowcaseRow>
                </SubSection>
                <SubSection label="Secondary &amp; Ghost">
                    <ShowcaseRow>
                        <Button variant="outline" style={{ borderColor: T.borderStrong, color: T.text, borderRadius: 10 }}>Outline</Button>
                        <Button variant="secondary" style={{ background: T.elevated, color: T.text, borderRadius: 10 }}>Secondary</Button>
                        <Button variant="ghost" style={{ color: T.textSec, borderRadius: 10 }}>Ghost</Button>
                        <Button variant="destructive" style={{ background: T.error, color: '#fff', borderRadius: 10 }}>Delete</Button>
                    </ShowcaseRow>
                </SubSection>
            </Section>

            {/* ━━━ BADGE ━━━ */}
            <Section title="Badge" description="Status indicators, labels, and tags across the showcase palette.">
                <SubSection label="Showcase Accents">
                    <ShowcaseRow>
                        {[
                            { label: 'Electric', bg: T.electric, fg: '#0a0a0b' },
                            { label: 'Bloom', bg: T.bloom, fg: '#0a0a0b' },
                            { label: 'Acid', bg: T.acid, fg: '#0a0a0b' },
                            { label: 'Plasma', bg: T.plasma, fg: '#0a0a0b' },
                            { label: 'Inferno', bg: T.inferno, fg: '#0a0a0b' },
                            { label: 'Crimson', bg: T.crimson, fg: '#fff' },
                            { label: 'Spearmint', bg: T.spearmint, fg: '#0a0a0b' },
                            { label: 'Solar', bg: T.solar, fg: '#0a0a0b' },
                        ].map((b) => (
                            <Badge key={b.label} style={{ background: b.bg, color: b.fg, borderRadius: 999 }}>{b.label}</Badge>
                        ))}
                    </ShowcaseRow>
                </SubSection>
                <SubSection label="Status Variants">
                    <ShowcaseRow>
                        <Badge style={{ background: `${T.success}20`, color: T.success, border: `1px solid ${T.success}40`, borderRadius: 999 }}>Active</Badge>
                        <Badge style={{ background: `${T.warning}20`, color: T.warning, border: `1px solid ${T.warning}40`, borderRadius: 999 }}>Pending</Badge>
                        <Badge style={{ background: `${T.error}20`, color: T.error, border: `1px solid ${T.error}40`, borderRadius: 999 }}>Failed</Badge>
                        <Badge style={{ background: `${T.info}20`, color: T.info, border: `1px solid ${T.info}40`, borderRadius: 999 }}>Info</Badge>
                        <Badge variant="outline" style={{ borderColor: T.borderStrong, color: T.textSec, borderRadius: 999 }}>Draft</Badge>
                    </ShowcaseRow>
                </SubSection>
            </Section>

            {/* ━━━ INPUT ━━━ */}
            <Section title="Input" description="Text inputs with amber focus ring and warm neutral surfaces.">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl">
                    <div className="space-y-2">
                        <label className="text-sm font-medium" style={{ color: T.textSec }}>Email</label>
                        <Input
                            type="email"
                            placeholder="you@company.io"
                            style={{ background: T.surface, borderColor: T.borderStrong, color: T.text, borderRadius: 10, borderWidth: 1 }}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium" style={{ color: T.textSec }}>API Key</label>
                        <Input
                            type="password"
                            placeholder="sk-••••••••"
                            style={{ background: T.surface, borderColor: T.borderStrong, color: T.text, borderRadius: 10, borderWidth: 1 }}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium" style={{ color: T.textSec }}>Disabled</label>
                        <Input
                            disabled
                            placeholder="Not editable"
                            style={{ background: T.subtle, borderColor: T.border, color: T.textMuted, borderRadius: 10, borderWidth: 1, opacity: 0.5 }}
                        />
                    </div>
                </div>
            </Section>

            {/* ━━━ CHECKBOX & SWITCH ━━━ */}
            <Section title="Checkbox &amp; Switch" description="Toggle controls with amber active states.">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-3xl">
                    <SubSection label="Checkbox">
                        <div className="space-y-4">
                            {['Enable notifications', 'Auto-save drafts', 'Dark mode'].map((label, i) => (
                                <label key={label} className="flex items-center gap-3 cursor-pointer">
                                    <Checkbox
                                        defaultChecked={i < 2}
                                        checked={i === 0 ? checkboxChecked : undefined}
                                        onCheckedChange={i === 0 ? (v) => setCheckboxChecked(v as boolean | 'indeterminate') : undefined}
                                        style={{ borderColor: T.borderStrong, borderRadius: 4 }}
                                    />
                                    <span className="text-sm" style={{ color: T.text }}>{label}</span>
                                </label>
                            ))}
                        </div>
                    </SubSection>
                    <SubSection label="Switch">
                        <div className="space-y-4">
                            <label className="flex items-center justify-between gap-4 cursor-pointer">
                                <span className="text-sm" style={{ color: T.text }}>Feature flags</span>
                                <Switch
                                    checked={switchOn}
                                    onCheckedChange={setSwitchOn}
                                    trackColor={T.elevated}
                                    trackActiveColor={T.brand}
                                    thumbColor={T.textMuted}
                                    thumbActiveColor="#0a0a0b"
                                />
                            </label>
                            <label className="flex items-center justify-between gap-4 cursor-pointer">
                                <span className="text-sm" style={{ color: T.text }}>Analytics</span>
                                <Switch
                                    defaultChecked
                                    trackColor={T.elevated}
                                    trackActiveColor={T.interactive}
                                    thumbColor={T.textMuted}
                                    thumbActiveColor="#fff"
                                />
                            </label>
                            <label className="flex items-center justify-between gap-4 cursor-pointer">
                                <span className="text-sm" style={{ color: T.textMuted }}>Maintenance mode</span>
                                <Switch
                                    trackColor={T.elevated}
                                    trackActiveColor={T.error}
                                    thumbColor={T.textMuted}
                                    thumbActiveColor="#fff"
                                />
                            </label>
                        </div>
                    </SubSection>
                </div>
            </Section>

            {/* ━━━ SLIDER ━━━ */}
            <Section title="Slider" description="Range input with amber track highlight.">
                <div className="max-w-md space-y-8">
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                            <span style={{ color: T.textSec }}>Opacity</span>
                            <span className="font-mono" style={{ color: T.brand }}>{sliderValue[0]}%</span>
                        </div>
                        <Slider
                            value={sliderValue}
                            onValueChange={setSliderValue}
                            max={100}
                            step={1}
                        />
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                            <span style={{ color: T.textSec }}>Volume</span>
                            <span className="font-mono" style={{ color: T.textMuted }}>40%</span>
                        </div>
                        <Slider defaultValue={[40]} max={100} step={1} />
                    </div>
                </div>
            </Section>

            {/* ━━━ PROGRESS ━━━ */}
            <Section title="Progress" description="Linear and circular progress indicators with brand and status colors.">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <SubSection label="Linear">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span style={{ color: T.textSec }}>Upload</span>
                                    <span className="font-mono" style={{ color: T.brand }}>78%</span>
                                </div>
                                <Progress value={78} trackColor={T.elevated} indicatorColor={T.brand} />
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span style={{ color: T.textSec }}>Build</span>
                                    <span className="font-mono" style={{ color: T.success }}>100%</span>
                                </div>
                                <Progress value={100} trackColor={T.elevated} indicatorColor={T.success} />
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span style={{ color: T.textSec }}>Deploy</span>
                                    <span className="font-mono" style={{ color: T.interactive }}>45%</span>
                                </div>
                                <Progress value={45} trackColor={T.elevated} indicatorColor={T.interactive} />
                            </div>
                        </div>
                    </SubSection>
                    <SubSection label="Circular">
                        <ShowcaseRow>
                            <Progress variant="circular" value={78} indicatorColor={T.brand} trackColor={T.elevated} labelColor={T.text} showLabel circularSize={72} circularStrokeWidth={6} />
                            <Progress variant="circular" value={100} indicatorColor={T.success} trackColor={T.elevated} labelColor={T.text} showLabel circularSize={72} circularStrokeWidth={6} />
                            <Progress variant="circular" value={45} indicatorColor={T.interactive} trackColor={T.elevated} labelColor={T.text} showLabel circularSize={72} circularStrokeWidth={6} />
                            <Progress variant="circular" value={23} indicatorColor={T.error} trackColor={T.elevated} labelColor={T.text} showLabel circularSize={72} circularStrokeWidth={6} />
                        </ShowcaseRow>
                    </SubSection>
                </div>
            </Section>

            {/* ━━━ TABS ━━━ */}
            <Section title="Tabs" description="Navigation tabs with multiple variants and amber active indicators.">
                <div className="space-y-10">
                    <SubSection label="Line Variant">
                        <Tabs defaultValue="overview" style={{ maxWidth: 500 }}>
                            <TabsList variant="line" style={{ borderColor: T.border }}>
                                <TabsTrigger value="overview" indicatorColor={T.brand} activeTextColor={T.text} inactiveTextColor={T.textMuted}>Overview</TabsTrigger>
                                <TabsTrigger value="analytics" indicatorColor={T.brand} activeTextColor={T.text} inactiveTextColor={T.textMuted}>Analytics</TabsTrigger>
                                <TabsTrigger value="settings" indicatorColor={T.brand} activeTextColor={T.text} inactiveTextColor={T.textMuted}>Settings</TabsTrigger>
                            </TabsList>
                            <TabsContent value="overview" className="pt-4 text-sm" style={{ color: T.textSec }}>Overview content with project summary and key metrics.</TabsContent>
                            <TabsContent value="analytics" className="pt-4 text-sm" style={{ color: T.textSec }}>Analytics dashboard with charts and insights.</TabsContent>
                            <TabsContent value="settings" className="pt-4 text-sm" style={{ color: T.textSec }}>Configure project settings and preferences.</TabsContent>
                        </Tabs>
                    </SubSection>
                    <SubSection label="Pill Variant">
                        <Tabs defaultValue="all" style={{ maxWidth: 500 }}>
                            <TabsList variant="pill" listBg={T.elevated}>
                                <TabsTrigger value="all" activeBg={T.brand} activeTextColor="#0a0a0b" inactiveTextColor={T.textMuted}>All</TabsTrigger>
                                <TabsTrigger value="active" activeBg={T.brand} activeTextColor="#0a0a0b" inactiveTextColor={T.textMuted}>Active</TabsTrigger>
                                <TabsTrigger value="archived" activeBg={T.brand} activeTextColor="#0a0a0b" inactiveTextColor={T.textMuted}>Archived</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </SubSection>
                    <SubSection label="Segment Variant">
                        <Tabs defaultValue="monthly" style={{ maxWidth: 400 }}>
                            <TabsList variant="segment" listBg={T.elevated}>
                                <TabsTrigger value="monthly" activeBg={T.surface} activeTextColor={T.text} inactiveTextColor={T.textMuted}>Monthly</TabsTrigger>
                                <TabsTrigger value="yearly" activeBg={T.surface} activeTextColor={T.text} inactiveTextColor={T.textMuted}>Yearly</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </SubSection>
                </div>
            </Section>

            {/* ━━━ CARD ━━━ */}
            <Section title="Card" description="Surface containers with warm neutral backgrounds and amber accents.">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card style={{ background: T.surface, borderColor: T.border, borderRadius: 16 }}>
                        <CardHeader>
                            <CardTitle style={{ color: T.text }}>Default Card</CardTitle>
                            <CardDescription style={{ color: T.textSec }}>A basic surface with subtle border.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm" style={{ color: T.textMuted }}>Content area with flexible layout options and warm neutral styling.</p>
                        </CardContent>
                        <CardFooter className="flex gap-3">
                            <Button size="sm" style={{ background: T.brand, color: '#0a0a0b', borderRadius: 8 }}>Action</Button>
                            <Button size="sm" variant="ghost" style={{ color: T.textSec }}>Cancel</Button>
                        </CardFooter>
                    </Card>

                    <Card variant="elevated" style={{ background: T.elevated, borderColor: 'transparent', borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
                        <CardHeader>
                            <CardTitle style={{ color: T.text }}>Elevated Card</CardTitle>
                            <CardDescription style={{ color: T.textSec }}>Lifted surface with deep shadow.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-3">
                                <div className="size-10 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: `${T.interactive}30`, color: T.interactive }}>KN</div>
                                <div>
                                    <p className="text-sm font-medium" style={{ color: T.text }}>Kai Nakamura</p>
                                    <p className="text-xs" style={{ color: T.textMuted }}>Lead Designer</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card style={{ background: `linear-gradient(135deg, ${T.surface}, ${T.elevated})`, borderColor: T.border, borderRadius: 16 }}>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle style={{ color: T.text }}>Metrics</CardTitle>
                                <Badge style={{ background: `${T.success}20`, color: T.success, borderRadius: 999 }}>+12%</Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold tracking-tight" style={{ color: T.brand }}>$48,290</p>
                            <p className="text-xs mt-1" style={{ color: T.textMuted }}>Revenue this month</p>
                        </CardContent>
                    </Card>
                </div>
            </Section>

            {/* ━━━ ALERT ━━━ */}
            <Section title="Alert" description="Contextual feedback with status-colored variants.">
                <div className="space-y-4 max-w-2xl">
                    <Alert variant="info" showIcon style={{ background: `${T.info}10`, borderColor: `${T.info}30`, borderRadius: 12 }}>
                        <AlertTitle style={{ color: T.info }}>System update available</AlertTitle>
                        <AlertDescription style={{ color: T.textSec }}>A new version is ready. Review the changelog before updating.</AlertDescription>
                        <AlertAction>
                            <Button size="xs" style={{ background: T.info, color: '#0a0a0b', borderRadius: 6 }}>Update now</Button>
                        </AlertAction>
                    </Alert>

                    <Alert variant="success" showIcon style={{ background: `${T.success}10`, borderColor: `${T.success}30`, borderRadius: 12 }}>
                        <AlertTitle style={{ color: T.success }}>Deployment successful</AlertTitle>
                        <AlertDescription style={{ color: T.textSec }}>Production build deployed to all regions.</AlertDescription>
                    </Alert>

                    <Alert variant="warning" showIcon style={{ background: `${T.warning}10`, borderColor: `${T.warning}30`, borderRadius: 12 }}>
                        <AlertTitle style={{ color: T.warning }}>API rate limit approaching</AlertTitle>
                        <AlertDescription style={{ color: T.textSec }}>You've used 89% of your monthly quota.</AlertDescription>
                    </Alert>

                    <Alert variant="error" showIcon dismissible style={{ background: `${T.error}10`, borderColor: `${T.error}30`, borderRadius: 12 }}>
                        <AlertTitle style={{ color: T.error }}>Payment failed</AlertTitle>
                        <AlertDescription style={{ color: T.textSec }}>Your card ending in 4242 was declined. Please update your payment method.</AlertDescription>
                        <AlertAction>
                            <Button size="xs" variant="outline" style={{ borderColor: `${T.error}50`, color: T.error, borderRadius: 6 }}>Update card</Button>
                        </AlertAction>
                    </Alert>
                </div>
            </Section>

            {/* ━━━ ACCORDION ━━━ */}
            <Section title="Accordion" description="Collapsible content sections with warm dividers.">
                <div className="max-w-2xl" style={{ background: T.surface, borderRadius: 16, border: `1px solid ${T.border}`, overflow: 'hidden' }}>
                    <Accordion type="single" collapsible defaultValue="item-1" dividerEnabled dividerColor={T.border} dividerWeight={1}>
                        <AccordionItem value="item-1">
                            <AccordionTrigger triggerStyle={{ color: T.text, padding: '16px 20px' }}>What design tokens are included?</AccordionTrigger>
                            <AccordionContent contentStyle={{ color: T.textSec, padding: '0 20px 16px' }}>
                                The theme includes primitive colors (neutrals, amber, violet, cyan, rose, emerald, and more), semantic tokens for backgrounds, borders, text, brand, interactive states, and status indicators, plus 8 showcase accent palettes.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger triggerStyle={{ color: T.text, padding: '16px 20px' }}>How does dark mode work?</AccordionTrigger>
                            <AccordionContent contentStyle={{ color: T.textSec, padding: '0 20px 16px' }}>
                                The theme uses the <code className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: T.elevated, color: T.brand }}>.dark</code> class with CSS custom properties. Each token has light and dark variants that automatically resolve based on the active mode.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3">
                            <AccordionTrigger triggerStyle={{ color: T.text, padding: '16px 20px' }}>Can I customize the brand color?</AccordionTrigger>
                            <AccordionContent contentStyle={{ color: T.textSec, padding: '0 20px 16px' }}>
                                Yes — override the <code className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: T.elevated, color: T.brand }}>--ui-semantic-brand-*</code> CSS variables with your own hex values. All components that reference brand tokens will update automatically.
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
            </Section>

            {/* ━━━ AVATAR ━━━ */}
            <Section title="Avatar" description="User representations with fallback initials and status badges.">
                <SubSection label="Sizes &amp; Shapes">
                    <ShowcaseRow>
                        <Avatar size="sm" bgColor={T.interactive} badge badgeColor={T.success}>
                            <AvatarFallback fontColor="#fff">AC</AvatarFallback>
                        </Avatar>
                        <Avatar size="md" bgColor={T.brand} badge badgeColor={T.success}>
                            <AvatarFallback fontColor="#0a0a0b" fontBold>KN</AvatarFallback>
                        </Avatar>
                        <Avatar size="lg" bgColor={T.electric} badge badgeColor={T.error}>
                            <AvatarFallback fontColor="#0a0a0b" fontBold>ZO</AvatarFallback>
                        </Avatar>
                        <Avatar size="lg" shape="rounded" bgColor={T.bloom} badge badgeColor={T.brand}>
                            <AvatarFallback fontColor="#0a0a0b" fontBold>LT</AvatarFallback>
                        </Avatar>
                    </ShowcaseRow>
                </SubSection>
                <SubSection label="With Images">
                    <ShowcaseRow>
                        <Avatar size="md" strokeWeight={2} strokeColor={T.brand}>
                            <AvatarImage src="https://i.pravatar.cc/80?img=1" />
                            <AvatarFallback>U1</AvatarFallback>
                        </Avatar>
                        <Avatar size="md" strokeWeight={2} strokeColor={T.interactive}>
                            <AvatarImage src="https://i.pravatar.cc/80?img=5" />
                            <AvatarFallback>U2</AvatarFallback>
                        </Avatar>
                        <Avatar size="md" strokeWeight={2} strokeColor={T.electric}>
                            <AvatarImage src="https://i.pravatar.cc/80?img=8" />
                            <AvatarFallback>U3</AvatarFallback>
                        </Avatar>
                        <Avatar size="md" strokeWeight={2} strokeColor={T.bloom}>
                            <AvatarImage src="https://i.pravatar.cc/80?img=12" />
                            <AvatarFallback>U4</AvatarFallback>
                        </Avatar>
                    </ShowcaseRow>
                </SubSection>
            </Section>

            {/* ━━━ DATA TABLE ━━━ */}
            <Section title="Data Table" description="Sortable, striped data display with themed header and row colors.">
                <div className="max-w-3xl" style={{ borderRadius: 16, border: `1px solid ${T.border}`, overflow: 'hidden' }}>
                    <DataTable
                        columns={TABLE_COLUMNS}
                        data={TABLE_DATA}
                        sortable
                        striped
                        headerBg={T.elevated}
                        rowBg={T.surface}
                        stripedBg={T.subtle}
                        textColor={T.text}
                        headerTextColor={T.textSec}
                        borderColor={T.border}
                        badgeColors={TABLE_BADGE_COLORS}
                    />
                </div>
            </Section>

            {/* ━━━ TOOLTIP ━━━ */}
            <Section title="Tooltip" description="Contextual hints on hover with arrow indicators.">
                <ShowcaseRow>
                    <Tooltip>
                        <Button style={{ background: T.elevated, color: T.text, borderRadius: 10, border: `1px solid ${T.borderStrong}` }}>Hover me</Button>
                        <TooltipContent inverse>
                            <p>This is a tooltip with useful context.</p>
                        </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <Button style={{ background: T.brand, color: '#0a0a0b', borderRadius: 10 }}>Brand tooltip</Button>
                        <TooltipContent>
                            <p>Saves your current configuration.</p>
                        </TooltipContent>
                    </Tooltip>
                </ShowcaseRow>
            </Section>

            {/* ━━━ DIALOG (static preview) ━━━ */}
            <Section title="Dialog" description="Modal overlays for confirmations and forms. Shown as a static preview.">
                <div className="max-w-md" style={{
                    background: T.elevated,
                    borderRadius: 16,
                    border: `1px solid ${T.border}`,
                    boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
                    overflow: 'hidden',
                }}>
                    <div className="p-6 space-y-1" style={{ borderBottom: `1px solid ${T.border}` }}>
                        <h3 className="text-lg font-semibold" style={{ color: T.text }}>Confirm deployment</h3>
                        <p className="text-sm" style={{ color: T.textSec }}>This will push changes to production. Are you sure?</p>
                    </div>
                    <div className="p-6">
                        <p className="text-sm" style={{ color: T.textMuted }}>
                            Branch <code className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: T.surface, color: T.brand }}>main</code> will be deployed to all regions.
                            This action cannot be undone.
                        </p>
                    </div>
                    <div className="flex justify-end gap-3 p-6 pt-0">
                        <Button variant="ghost" style={{ color: T.textSec, borderRadius: 8 }}>Cancel</Button>
                        <Button style={{ background: T.brand, color: '#0a0a0b', borderRadius: 8 }}>Deploy</Button>
                    </div>
                </div>
            </Section>

            {/* ━━━ DRAWER (static preview) ━━━ */}
            <Section title="Drawer" description="Slide-in panels for navigation and settings. Shown as a static preview.">
                <div className="max-w-xs" style={{
                    background: T.elevated,
                    borderRadius: 16,
                    border: `1px solid ${T.border}`,
                    boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
                    height: 400,
                    overflow: 'hidden',
                }}>
                    <div className="p-6" style={{ borderBottom: `1px solid ${T.border}` }}>
                        <h3 className="text-lg font-semibold" style={{ color: T.text }}>Settings</h3>
                        <p className="text-sm mt-1" style={{ color: T.textSec }}>Configure your workspace.</p>
                    </div>
                    <div className="p-4 space-y-1">
                        {['General', 'Appearance', 'Notifications', 'Security', 'Billing'].map((item, i) => (
                            <div
                                key={item}
                                className="px-3 py-2.5 rounded-lg text-sm cursor-pointer transition-colors"
                                style={{
                                    background: i === 1 ? `${T.brand}15` : 'transparent',
                                    color: i === 1 ? T.brand : T.textSec,
                                }}
                            >
                                {item}
                            </div>
                        ))}
                    </div>
                </div>
            </Section>

            {/* ━━━ DROPDOWN (static preview) ━━━ */}
            <Section title="Dropdown" description="Action menus with keyboard shortcuts. Shown as a static preview.">
                <div className="max-w-[220px]" style={{
                    background: T.elevated,
                    borderRadius: 12,
                    border: `1px solid ${T.border}`,
                    boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
                    overflow: 'hidden',
                    padding: '4px',
                }}>
                    {[
                        { label: 'Edit', shortcut: '⌘E' },
                        { label: 'Duplicate', shortcut: '⌘D' },
                        { label: 'Move to...', shortcut: '⌘M' },
                        { divider: true },
                        { label: 'Archive', shortcut: '⌘⌫' },
                        { label: 'Delete', shortcut: '⇧⌘⌫', danger: true },
                    ].map((item, i) =>
                        'divider' in item ? (
                            <div key={i} className="my-1" style={{ height: 1, background: T.border }} />
                        ) : (
                            <div
                                key={item.label}
                                className="flex items-center justify-between px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors"
                                style={{ color: item.danger ? T.error : T.text }}
                            >
                                <span>{item.label}</span>
                                <span className="text-xs font-mono" style={{ color: T.textMuted }}>{item.shortcut}</span>
                            </div>
                        ),
                    )}
                </div>
            </Section>

            {/* ━━━ POPOVER (static preview) ━━━ */}
            <Section title="Popover" description="Floating content panels anchored to triggers. Shown as a static preview.">
                <div className="flex items-start gap-4">
                    <Button style={{ background: T.elevated, color: T.text, borderRadius: 10, border: `1px solid ${T.borderStrong}` }}>Trigger</Button>
                    <div style={{
                        background: T.elevated,
                        borderRadius: 12,
                        border: `1px solid ${T.border}`,
                        boxShadow: '0 16px 48px rgba(0,0,0,0.4)',
                        padding: '16px',
                        width: 280,
                    }}>
                        <p className="text-sm font-medium mb-2" style={{ color: T.text }}>Quick settings</p>
                        <div className="space-y-3">
                            <label className="flex items-center justify-between">
                                <span className="text-sm" style={{ color: T.textSec }}>Compact mode</span>
                                <Switch size="sm" trackColor={T.surface} trackActiveColor={T.brand} thumbColor={T.textMuted} thumbActiveColor="#0a0a0b" />
                            </label>
                            <label className="flex items-center justify-between">
                                <span className="text-sm" style={{ color: T.textSec }}>Sound effects</span>
                                <Switch size="sm" defaultChecked trackColor={T.surface} trackActiveColor={T.brand} thumbColor={T.textMuted} thumbActiveColor="#0a0a0b" />
                            </label>
                        </div>
                    </div>
                </div>
            </Section>

            {/* ━━━ NAVIGATION MENU (static preview) ━━━ */}
            <Section title="Navigation Menu" description="Horizontal and vertical navigation with active state indicators.">
                <div className="space-y-8">
                    <SubSection label="Horizontal">
                        <div className="inline-flex items-center gap-1 p-1 rounded-xl" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                            {['Dashboard', 'Projects', 'Team', 'Settings'].map((item, i) => (
                                <div
                                    key={item}
                                    className="px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors"
                                    style={{
                                        background: i === 0 ? T.brand : 'transparent',
                                        color: i === 0 ? '#0a0a0b' : T.textSec,
                                    }}
                                >
                                    {item}
                                </div>
                            ))}
                        </div>
                    </SubSection>
                    <SubSection label="Vertical">
                        <div className="inline-flex flex-col gap-1 p-2 rounded-xl" style={{ background: T.surface, border: `1px solid ${T.border}`, width: 200 }}>
                            {[
                                { label: 'Home', active: false },
                                { label: 'Components', active: true },
                                { label: 'Tokens', active: false },
                                { label: 'Export', active: false },
                            ].map((item) => (
                                <div
                                    key={item.label}
                                    className="px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors"
                                    style={{
                                        background: item.active ? `${T.brand}15` : 'transparent',
                                        color: item.active ? T.brand : T.textSec,
                                        borderLeft: item.active ? `2px solid ${T.brand}` : '2px solid transparent',
                                    }}
                                >
                                    {item.label}
                                </div>
                            ))}
                        </div>
                    </SubSection>
                </div>
            </Section>

            {/* ━━━ ANIMATED TEXT ━━━ */}
            <Section title="Animated Text" description="16 text animation variants — entry reveals, hover interactions, and continuous effects.">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {([
                        { variant: 'blur-in' as const, label: 'Blur In', text: 'Hello World', style: { fontSize: 32, fontWeight: 600, color: T.text } },
                        { variant: 'typewriter' as const, label: 'Typewriter', text: 'Building the future...', style: { fontSize: 24, fontWeight: 400, color: T.textSec } },
                        { variant: 'split-entrance' as const, label: 'Split Entrance', text: 'Design System', style: { fontSize: 32, fontWeight: 700, color: T.text } },
                        { variant: 'fade-up' as const, label: 'Fade Up', text: 'Amber & Violet', style: { fontSize: 28, fontWeight: 600, color: T.brand } },
                        { variant: 'letters-pull-up' as const, label: 'Letters Pull Up', text: 'UI Studio', style: { fontSize: 32, fontWeight: 700, color: T.text } },
                        { variant: 'decrypt' as const, label: 'Decrypt', text: 'ENCRYPTED', style: { fontSize: 28, fontWeight: 600, color: T.electric } },
                        { variant: 'gradient-sweep' as const, label: 'Gradient Sweep', text: 'Gradient', style: { fontSize: 36, fontWeight: 700 }, extra: { gradientColor1: T.brand, gradientColor2: T.interactive } },
                        { variant: 'shiny-text' as const, label: 'Shiny Text', text: 'Premium', style: { fontSize: 36, fontWeight: 700, color: T.textMuted } },
                        { variant: 'bounce' as const, label: 'Bounce (hover)', text: 'Hover me!', style: { fontSize: 32, fontWeight: 700, color: T.text } },
                        { variant: 'bubble' as const, label: 'Bubble (hover)', text: 'Proximity weight', style: { fontSize: 32, fontWeight: 400, color: T.text } },
                        { variant: 'disperse' as const, label: 'Disperse (hover)', text: 'Scatter', style: { fontSize: 32, fontWeight: 600, color: T.text } },
                        { variant: 'pattern' as const, label: 'Pattern', text: 'PATTERN', style: { fontSize: 48, fontWeight: 800, color: T.textMuted } },
                    ] as const).map((item) => (
                        <div
                            key={item.variant}
                            className="p-6 rounded-xl flex flex-col justify-between min-h-[120px]"
                            style={{ background: T.surface, border: `1px solid ${T.border}` }}
                        >
                            <p className="text-xs font-mono mb-3" style={{ color: T.textMuted }}>{item.label}</p>
                            <AnimatedText
                                text={item.text}
                                variant={item.variant}
                                speed={item.variant === 'typewriter' ? 1.2 : 0.4}
                                stagger={0.04}
                                splitBy="word"
                                trigger="mount"
                                style={item.style}
                                {...('extra' in item ? item.extra : {})}
                            />
                        </div>
                    ))}
                </div>
            </Section>

            {/* ━━━ Footer ━━━ */}
            <footer className="py-16 px-6 md:px-12 lg:px-20 text-center" style={{ borderTop: `1px solid ${T.border}` }}>
                <p className="text-sm" style={{ color: T.textMuted }}>
                    Built with UI Studio OSS — 21 components, 1 theme, infinite possibilities.
                </p>
                <p className="text-xs mt-2 font-mono" style={{ color: `${T.textMuted}80` }}>
                    Amber <span style={{ color: T.brand }}>&#9679;</span> &amp; Violet <span style={{ color: T.interactive }}>&#9679;</span> Design System
                </p>
            </footer>
        </div>
    );
}
