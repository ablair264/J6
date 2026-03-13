import { useState, type ReactNode } from 'react';
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
import { Avatar, AvatarImage, AvatarFallback, AvatarGroup, AvatarGroupCount } from '@/components/ui/avatar';
import { DataTable } from '@/components/ui/data-table';
import { Tooltip, TooltipContent } from '@/components/ui/tooltip';
import { AnimatedText } from '@/components/ui/animated-text';
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerClose } from '@/components/ui/drawer';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuShortcut } from '@/components/ui/dropdown-menu';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuTrigger as NavMenuTrigger, NavigationMenuContent, NavigationMenuLink } from '@/components/ui/navigation-menu';
import { AreaChartCard } from '@/components/ui/cards/area-chart-card';
import { BarChartCard } from '@/components/ui/cards/bar-chart-card';
import { LineChartCard } from '@/components/ui/cards/line-chart-card';
import { MetricCard } from '@/components/ui/cards/metric-card';
import { RadialChartCard } from '@/components/ui/cards/radial-chart-card';
import { RoundedPieChartCard } from '@/components/ui/cards/rounded-pie-chart-card';
import { DottedMultiLineChartCard } from '@/components/ui/cards/dotted-multi-line-chart-card';
import { LiveActivityCompactCard, NextEventCompactCard, WhosOnlineCompactCard, SparkStatsCompactCard } from '@/components/ui/cards/compact-sm-variants';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Theme tokens
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
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
    interactive: '#7c3aed',
    interactiveHover: '#9f72ff',
    border: 'rgba(255,255,255,0.08)',
    borderStrong: 'rgba(255,255,255,0.15)',
    success: '#34d399',
    warning: '#facc15',
    error: '#fb7185',
    info: '#38bdf8',
    electric: '#22d3ee',
    bloom: '#f472b6',
    acid: '#a3e635',
    plasma: '#818cf8',
    inferno: '#fb923c',
    crimson: '#f43f5e',
    spearmint: '#10b981',
    solar: '#facc15',
} as const;

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Types
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export interface LibraryExample {
    title: string;
    preview: ReactNode;
    code: string;
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   DataTable constants
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
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
const TABLE_BADGE_COLORS: Record<string, { bg: string; text: string }> = {
    Active: { bg: T.spearmint, text: '#0a0a0b' },
    Away: { bg: T.solar, text: '#0a0a0b' },
    Offline: { bg: T.textMuted, text: '#f0ede8' },
};

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Helper components
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function AvatarHoverCard() {
    const [hovered, setHovered] = useState(false);
    return (
        <div className="relative inline-block pt-4">
            <div
                className="cursor-pointer transition-transform duration-200"
                style={{ transform: hovered ? 'translateY(-2px) scale(1.06)' : 'none' }}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
            >
                <Avatar size="lg" bgColor={T.interactive} badge badgeColor={T.success}>
                    <AvatarImage src="https://i.pravatar.cc/80?img=5" />
                    <AvatarFallback fontColor="#fff" fontBold>KN</AvatarFallback>
                </Avatar>
            </div>
            {hovered && (
                <div
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-10 shadow-xl"
                    style={{
                        background: T.elevated,
                        border: `1px solid ${T.border}`,
                        borderRadius: 12,
                        padding: 12,
                        width: 200,
                        backdropFilter: 'blur(8px)',
                        opacity: 1,
                    }}
                    onMouseEnter={() => setHovered(true)}
                    onMouseLeave={() => setHovered(false)}
                >
                    <div className="flex items-center gap-2.5">
                        <Avatar customSize={36} bgColor={T.interactive}>
                            <AvatarImage src="https://i.pravatar.cc/80?img=5" />
                            <AvatarFallback fontColor="#fff" fontBold>KN</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                            <p className="truncate font-semibold leading-none text-[13px]" style={{ color: T.text }}>Kai Nakamura</p>
                            <p className="mt-1 truncate text-[11px]" style={{ color: T.textMuted }}>Lead Designer</p>
                            <div className="mt-1.5 flex items-center gap-2">
                                {['💬', '✉️', '📞'].map((icon) => (
                                    <button key={icon} className="p-1 rounded-md transition-opacity opacity-60 hover:opacity-100 text-[12px]">{icon}</button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function DialogExample() {
    const [open, setOpen] = useState(false);
    return (
        <>
            <Button onClick={() => setOpen(true)} style={{ background: T.brand, color: '#0a0a0b', borderRadius: 10 }}>Open Dialog</Button>
            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setOpen(false)}>
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                    <div className="relative z-10 w-[min(92vw,420px)] overflow-hidden rounded-2xl" style={{ background: T.elevated, border: `1px solid ${T.border}`, boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }} onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 space-y-1" style={{ borderBottom: `1px solid ${T.border}` }}>
                            <h3 className="text-base font-semibold" style={{ color: T.text }}>Confirm deployment</h3>
                            <p className="text-[13px]" style={{ color: T.textSec }}>This will push changes to production. Are you sure?</p>
                        </div>
                        <div className="p-6">
                            <p className="text-[13px]" style={{ color: T.textMuted }}>Branch <code className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: T.surface, color: T.brand }}>main</code> will be deployed to all regions.</p>
                        </div>
                        <div className="flex justify-end gap-3 px-6 pb-6">
                            <Button variant="ghost" size="sm" onClick={() => setOpen(false)} style={{ color: T.textSec, borderRadius: 8 }}>Cancel</Button>
                            <Button size="sm" onClick={() => setOpen(false)} style={{ background: T.brand, color: '#0a0a0b', borderRadius: 8 }}>Deploy</Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
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
            title: 'Default',
            preview: (
                <div className="w-full max-w-lg">
                    <Accordion type="single" collapsible defaultValue="item-1" dividerEnabled dividerColor={T.border} dividerWeight={1}>
                        <AccordionItem value="item-1">
                            <AccordionTrigger triggerStyle={{ color: T.text, padding: '14px 0' }}>What is a micro-interaction?</AccordionTrigger>
                            <AccordionContent contentStyle={{ color: T.textSec, paddingBottom: 14 }}>A micro-interaction is a small, contained product moment that revolves around a single use case.</AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger triggerStyle={{ color: T.text, padding: '14px 0' }}>Why should I use a micro-interaction?</AccordionTrigger>
                            <AccordionContent contentStyle={{ color: T.textSec, paddingBottom: 14 }}>They enhance user delight and provide contextual feedback for actions.</AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3">
                            <AccordionTrigger triggerStyle={{ color: T.text, padding: '14px 0' }}>How do I use a micro-interaction?</AccordionTrigger>
                            <AccordionContent contentStyle={{ color: T.textSec, paddingBottom: 14 }}>Integrate them at key interaction points like form submissions and state changes.</AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
            ),
            code: `<Accordion type="single" collapsible defaultValue="item-1">\n  <AccordionItem value="item-1">\n    <AccordionTrigger>What is a micro-interaction?</AccordionTrigger>\n    <AccordionContent>A micro-interaction is a small, contained product moment...</AccordionContent>\n  </AccordionItem>\n</Accordion>`,
        },
        {
            title: 'Bordered',
            preview: (
                <div className="w-full max-w-lg">
                    <Accordion type="single" collapsible dividerEnabled={false}>
                        {['What is a micro-interaction?', 'Why should I use a micro-interaction?', 'How do I use a micro-interaction?'].map((q, i) => (
                            <AccordionItem key={i} value={`b-${i}`}>
                                <AccordionTrigger triggerStyle={{ color: T.text, padding: '12px 16px', background: T.surface, borderRadius: 10, border: `1px solid ${T.border}`, marginBottom: 6 }}>{q}</AccordionTrigger>
                                <AccordionContent contentStyle={{ color: T.textSec, padding: '0 16px 12px' }}>Accordion content goes here.</AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            ),
            code: `<Accordion type="single" collapsible>\n  <AccordionItem value="item-1">\n    <AccordionTrigger style={{ background: 'var(--surface)', borderRadius: 10, border: '1px solid var(--border)' }}>\n      What is a micro-interaction?\n    </AccordionTrigger>\n    <AccordionContent>Content goes here.</AccordionContent>\n  </AccordionItem>\n</Accordion>`,
        },
    ],

    /* ── Alert ── */
    alert: [
        {
            title: 'Info',
            preview: (
                <Alert variant="info" showIcon style={{ background: `${T.info}10`, borderColor: `${T.info}30`, borderRadius: 12, maxWidth: 480 }}>
                    <AlertTitle style={{ color: T.info }}>System update available</AlertTitle>
                    <AlertDescription style={{ color: T.textSec }}>A new version is ready. Review the changelog before updating.</AlertDescription>
                    <AlertAction><Button size="xs" style={{ background: T.info, color: '#0a0a0b', borderRadius: 6 }}>Update now</Button></AlertAction>
                </Alert>
            ),
            code: `<Alert variant="info" showIcon>\n  <AlertTitle>System update available</AlertTitle>\n  <AlertDescription>A new version is ready.</AlertDescription>\n  <AlertAction><Button size="xs">Update now</Button></AlertAction>\n</Alert>`,
        },
        {
            title: 'Success',
            preview: (
                <Alert variant="success" showIcon style={{ background: `${T.success}10`, borderColor: `${T.success}30`, borderRadius: 12, maxWidth: 480 }}>
                    <AlertTitle style={{ color: T.success }}>Deployment successful</AlertTitle>
                    <AlertDescription style={{ color: T.textSec }}>Production build deployed to all regions.</AlertDescription>
                </Alert>
            ),
            code: `<Alert variant="success" showIcon>\n  <AlertTitle>Deployment successful</AlertTitle>\n  <AlertDescription>Production build deployed to all regions.</AlertDescription>\n</Alert>`,
        },
        {
            title: 'Warning',
            preview: (
                <Alert variant="warning" showIcon style={{ background: `${T.warning}10`, borderColor: `${T.warning}30`, borderRadius: 12, maxWidth: 480 }}>
                    <AlertTitle style={{ color: T.warning }}>API rate limit approaching</AlertTitle>
                    <AlertDescription style={{ color: T.textSec }}>You&apos;ve used 89% of your monthly quota.</AlertDescription>
                </Alert>
            ),
            code: `<Alert variant="warning" showIcon>\n  <AlertTitle>API rate limit approaching</AlertTitle>\n  <AlertDescription>You've used 89% of your monthly quota.</AlertDescription>\n</Alert>`,
        },
        {
            title: 'Error',
            preview: (
                <Alert variant="error" showIcon dismissible style={{ background: `${T.error}10`, borderColor: `${T.error}30`, borderRadius: 12, maxWidth: 480 }}>
                    <AlertTitle style={{ color: T.error }}>Payment failed</AlertTitle>
                    <AlertDescription style={{ color: T.textSec }}>Your card ending in 4242 was declined.</AlertDescription>
                    <AlertAction><Button size="xs" variant="outline" style={{ borderColor: `${T.error}50`, color: T.error, borderRadius: 6 }}>Update card</Button></AlertAction>
                </Alert>
            ),
            code: `<Alert variant="error" showIcon dismissible>\n  <AlertTitle>Payment failed</AlertTitle>\n  <AlertDescription>Your card ending in 4242 was declined.</AlertDescription>\n</Alert>`,
        },
    ],

    /* ── Avatar ── */
    avatar: [
        {
            title: 'Sizes',
            preview: (
                <div className="flex items-end gap-4">
                    <Avatar size="sm" bgColor={T.interactive}><AvatarFallback fontColor="#fff">SM</AvatarFallback></Avatar>
                    <Avatar size="md" bgColor={T.brand}><AvatarFallback fontColor="#0a0a0b" fontBold>MD</AvatarFallback></Avatar>
                    <Avatar size="lg" bgColor={T.electric}><AvatarFallback fontColor="#0a0a0b" fontBold>LG</AvatarFallback></Avatar>
                </div>
            ),
            code: `<Avatar size="sm" bgColor="#7c3aed"><AvatarFallback fontColor="#fff">SM</AvatarFallback></Avatar>\n<Avatar size="md" bgColor="#f5a623"><AvatarFallback fontColor="#0a0a0b">MD</AvatarFallback></Avatar>\n<Avatar size="lg" bgColor="#22d3ee"><AvatarFallback fontColor="#0a0a0b">LG</AvatarFallback></Avatar>`,
        },
        {
            title: 'With Images & Badges',
            preview: (
                <div className="flex items-center gap-4">
                    <Avatar size="md" strokeWeight={2} strokeColor={T.brand} badge badgeColor={T.success}><AvatarImage src="https://i.pravatar.cc/80?img=1" /><AvatarFallback>U1</AvatarFallback></Avatar>
                    <Avatar size="md" strokeWeight={2} strokeColor={T.interactive} badge badgeColor={T.success}><AvatarImage src="https://i.pravatar.cc/80?img=5" /><AvatarFallback>U2</AvatarFallback></Avatar>
                    <Avatar size="md" strokeWeight={2} strokeColor={T.electric} badge badgeColor={T.error}><AvatarImage src="https://i.pravatar.cc/80?img=8" /><AvatarFallback>U3</AvatarFallback></Avatar>
                    <Avatar size="md" shape="rounded" strokeWeight={2} strokeColor={T.bloom}><AvatarImage src="https://i.pravatar.cc/80?img=12" /><AvatarFallback>U4</AvatarFallback></Avatar>
                </div>
            ),
            code: `<Avatar size="md" strokeWeight={2} strokeColor="#f5a623" badge badgeColor="#34d399">\n  <AvatarImage src="https://i.pravatar.cc/80?img=1" />\n  <AvatarFallback>U1</AvatarFallback>\n</Avatar>`,
        },
        {
            title: 'Avatar Group',
            preview: (
                <AvatarGroup spacing={-8}>
                    {[
                        { img: 'https://i.pravatar.cc/80?img=3', fb: 'AC', color: T.interactive },
                        { img: 'https://i.pravatar.cc/80?img=7', fb: 'KN', color: T.brand },
                        { img: 'https://i.pravatar.cc/80?img=11', fb: 'ZO', color: T.electric },
                        { img: 'https://i.pravatar.cc/80?img=15', fb: 'LT', color: T.bloom },
                    ].map((a, i) => (
                        <Avatar key={i} size="md" strokeWeight={2} strokeColor={a.color}>
                            <AvatarImage src={a.img} /><AvatarFallback fontColor="#fff">{a.fb}</AvatarFallback>
                        </Avatar>
                    ))}
                    <AvatarGroupCount style={{ background: T.elevated, color: T.textSec, border: `2px solid ${T.surface}` }}>+5</AvatarGroupCount>
                </AvatarGroup>
            ),
            code: `<AvatarGroup spacing={-8}>\n  <Avatar size="md" strokeWeight={2} strokeColor="#7c3aed">\n    <AvatarImage src="..." />\n    <AvatarFallback>AC</AvatarFallback>\n  </Avatar>\n  {/* more avatars... */}\n  <AvatarGroupCount>+5</AvatarGroupCount>\n</AvatarGroup>`,
        },
        {
            title: 'Hover Contact Card',
            preview: (
                <div className="pb-24">
                    <AvatarHoverCard />
                    <p className="text-[11px] mt-2" style={{ color: T.textMuted }}>Hover the avatar</p>
                </div>
            ),
            code: `{/* Hover-activated contact card */}\n<Avatar size="lg" badge badgeColor="#34d399"\n  onMouseEnter={() => setHovered(true)}\n  onMouseLeave={() => setHovered(false)}\n>\n  <AvatarImage src="..." />\n  <AvatarFallback>KN</AvatarFallback>\n</Avatar>\n{hovered && (\n  <div className="popover-card">\n    <Avatar customSize={36} />\n    <p>Kai Nakamura</p>\n    <p>Lead Designer</p>\n  </div>\n)}`,
        },
        {
            title: 'Profile Menu Popover',
            preview: (
                <Popover>
                    <PopoverTrigger asChild>
                        <button className="cursor-pointer">
                            <Avatar size="lg" bgColor={T.interactive} badge badgeColor={T.success}>
                                <AvatarImage src="https://i.pravatar.cc/80?img=1" /><AvatarFallback fontColor="#fff" fontBold>AC</AvatarFallback>
                            </Avatar>
                        </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-56 p-0 overflow-hidden" style={{ background: T.elevated, borderColor: T.border }}>
                        <div className="p-4 space-y-2" style={{ borderBottom: `1px solid ${T.border}` }}>
                            <p className="text-sm font-medium" style={{ color: T.text }}>Ava Chen</p>
                            <p className="text-xs" style={{ color: T.textMuted }}>ava@company.io</p>
                        </div>
                        <div className="p-2">
                            {['View Profile', 'Settings', 'Sign Out'].map((item) => (
                                <div key={item} className="px-3 py-1.5 rounded-md text-[13px] cursor-pointer transition-colors" style={{ color: item === 'Sign Out' ? T.error : T.textSec }}>{item}</div>
                            ))}
                        </div>
                    </PopoverContent>
                </Popover>
            ),
            code: `<Popover>\n  <PopoverTrigger asChild>\n    <button>\n      <Avatar size="lg" badge badgeColor="#34d399">\n        <AvatarImage src="..." />\n        <AvatarFallback>AC</AvatarFallback>\n      </Avatar>\n    </button>\n  </PopoverTrigger>\n  <PopoverContent>\n    <p>Ava Chen</p>\n    <p>ava@company.io</p>\n    <div>View Profile</div>\n    <div>Settings</div>\n    <div>Sign Out</div>\n  </PopoverContent>\n</Popover>`,
        },
    ],

    /* ── Badge ── */
    badge: [
        {
            title: 'Showcase Colors',
            preview: (
                <div className="flex flex-wrap gap-3">
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
                        <Badge key={b.label} style={{ background: b.bg, color: b.fg, borderRadius: 999, fontSize: 11, padding: '2px 8px' }}>{b.label}</Badge>
                    ))}
                </div>
            ),
            code: `<Badge style={{ background: '#22d3ee', color: '#0a0a0b' }}>Electric</Badge>\n<Badge style={{ background: '#f472b6', color: '#0a0a0b' }}>Bloom</Badge>\n<Badge style={{ background: '#a3e635', color: '#0a0a0b' }}>Acid</Badge>`,
        },
        {
            title: 'Status Variants',
            preview: (
                <div className="flex flex-wrap gap-3">
                    <Badge style={{ background: `${T.success}20`, color: T.success, border: `1px solid ${T.success}40`, borderRadius: 999, fontSize: 11, padding: '2px 8px' }}>Active</Badge>
                    <Badge style={{ background: `${T.warning}20`, color: T.warning, border: `1px solid ${T.warning}40`, borderRadius: 999, fontSize: 11, padding: '2px 8px' }}>Pending</Badge>
                    <Badge style={{ background: `${T.error}20`, color: T.error, border: `1px solid ${T.error}40`, borderRadius: 999, fontSize: 11, padding: '2px 8px' }}>Failed</Badge>
                    <Badge style={{ background: `${T.info}20`, color: T.info, border: `1px solid ${T.info}40`, borderRadius: 999, fontSize: 11, padding: '2px 8px' }}>Info</Badge>
                    <Badge variant="outline" style={{ borderColor: T.borderStrong, color: T.textSec, borderRadius: 999, fontSize: 11, padding: '2px 8px' }}>Draft</Badge>
                </div>
            ),
            code: `<Badge style={{ background: 'rgba(52,211,153,0.12)', color: '#34d399', border: '1px solid rgba(52,211,153,0.25)' }}>Active</Badge>`,
        },
    ],

    /* ── Button ── */
    button: [
        {
            title: 'Variants',
            preview: (
                <div className="flex flex-wrap gap-3">
                    <Button style={{ background: T.brand, color: '#0a0a0b', borderRadius: 10 }}>Primary</Button>
                    <Button variant="secondary" style={{ background: T.elevated, color: T.text, borderRadius: 10 }}>Secondary</Button>
                    <Button variant="destructive" style={{ background: T.error, color: '#fff', borderRadius: 10 }}>Destructive</Button>
                    <Button variant="outline" style={{ borderColor: T.borderStrong, color: T.text, borderRadius: 10 }}>Outline</Button>
                    <Button variant="ghost" style={{ color: T.textSec, borderRadius: 10 }}>Ghost</Button>
                    <Button variant="link" style={{ color: T.brand }}>Link</Button>
                </div>
            ),
            code: `<Button>Primary</Button>\n<Button variant="secondary">Secondary</Button>\n<Button variant="destructive">Destructive</Button>\n<Button variant="outline">Outline</Button>\n<Button variant="ghost">Ghost</Button>\n<Button variant="link">Link</Button>`,
        },
        {
            title: 'Sizes',
            preview: (
                <div className="flex items-center gap-3">
                    <Button size="sm" style={{ background: T.interactive, color: '#fff', borderRadius: 8 }}>Small</Button>
                    <Button size="default" style={{ background: T.interactive, color: '#fff', borderRadius: 10 }}>Default</Button>
                    <Button size="lg" style={{ background: T.interactive, color: '#fff', borderRadius: 12 }}>Large</Button>
                </div>
            ),
            code: `<Button size="sm">Small</Button>\n<Button size="default">Default</Button>\n<Button size="lg">Large</Button>`,
        },
        {
            title: 'Disabled',
            preview: (
                <div className="flex items-center gap-3">
                    <Button disabled style={{ background: T.brand, color: '#0a0a0b', borderRadius: 10, opacity: 0.4 }}>Primary</Button>
                    <Button disabled variant="outline" style={{ borderColor: T.borderStrong, color: T.text, borderRadius: 10, opacity: 0.4 }}>Outline</Button>
                </div>
            ),
            code: `<Button disabled>Primary</Button>\n<Button disabled variant="outline">Outline</Button>`,
        },
        {
            title: 'Studio — Gradient',
            preview: (
                <div className="flex flex-wrap items-center gap-3">
                    <Button style={{ background: 'linear-gradient(135deg, rgba(85,157,230,1) 0%, rgba(85,157,230,1) 55%, rgba(13,49,89,1) 100%)', borderRadius: 5, color: 'rgba(232,229,224,1)', fontFamily: 'Open Sans', fontSize: 12, fontWeight: 500, minHeight: 28, height: 28, paddingInline: 12 }}>Small</Button>
                    <Button style={{ background: 'linear-gradient(135deg, rgba(85,157,230,1) 0%, rgba(85,157,230,1) 55%, rgba(13,49,89,1) 100%)', borderRadius: 5, color: 'rgba(232,229,224,1)', fontFamily: 'Open Sans', fontSize: 14, fontWeight: 500, minHeight: 38, height: 38, paddingInline: 14 }}>Medium</Button>
                    <Button style={{ background: 'linear-gradient(135deg, rgba(85,157,230,1) 0%, rgba(85,157,230,1) 55%, rgba(13,49,89,1) 100%)', borderRadius: 5, color: 'rgba(232,229,224,1)', fontFamily: 'Open Sans', fontSize: 17, fontWeight: 500, minHeight: 44, height: 44, paddingInline: 17 }}>Large</Button>
                    <Button style={{ background: 'linear-gradient(135deg, rgba(227,85,230,1) 0%, rgba(227,85,230,1) 55%, rgba(82,13,89,1) 100%)', borderRadius: 5, color: 'rgba(232,229,224,1)', fontFamily: 'Open Sans', fontSize: 12, fontWeight: 500, minHeight: 34, height: 34, paddingInline: 12 }}>Purple</Button>
                </div>
            ),
            code: `/* Blue Gradient — Small */\n.studio-button-1 {\n  background: linear-gradient(135deg, rgba(85,157,230,1) 0%, rgba(85,157,230,1) 55%, rgba(13,49,89,1) 100%);\n  border-radius: 5px;\n  color: rgba(232,229,224,1);\n  font-size: 12px;\n}`,
        },
        {
            title: 'Studio — Dark & Glow',
            preview: (
                <div className="flex flex-wrap items-center gap-3">
                    <Button style={{ background: 'linear-gradient(135deg, rgba(59,56,56,1) 0%, rgba(59,56,56,1) 55%, rgba(41,40,40,1) 100%)', border: '0.5px solid rgba(255,255,255,0.23)', borderRadius: 9, color: 'rgba(232,229,224,1)', fontFamily: 'Open Sans', fontSize: 14, fontWeight: 500, minHeight: 32, height: 32, paddingInline: 14, boxShadow: 'inset 6px 7px 4px -4px rgba(0,0,0,0.26)' }}>Inset Shadow</Button>
                    <Button style={{ background: 'transparent', border: '1.5px solid rgba(255,255,255,0.23)', borderRadius: 9, color: 'rgba(232,229,224,1)', fontFamily: 'Open Sans', fontSize: 14, fontWeight: 500, minHeight: 32, height: 32, paddingInline: 14 }}>Ghost</Button>
                    <Button style={{ background: 'radial-gradient(100% 100% at 50% 50%, rgba(27,17,214,0.45) 0%, transparent 70%), rgba(0,0,0,1)', border: '1.5px solid rgba(255,255,255,0)', borderRadius: 9, color: 'rgba(232,229,224,1)', fontFamily: 'Open Sans', fontSize: 14, fontWeight: 500, minHeight: 32, height: 32, paddingInline: 14 }}>Radial Glow</Button>
                </div>
            ),
            code: `/* Dark Inset Shadow */\n.studio-button-inset {\n  background: linear-gradient(135deg, rgba(59,56,56,1) 0%, rgba(59,56,56,1) 55%, rgba(41,40,40,1) 100%);\n  box-shadow: inset 6px 7px 4px -4px rgba(0,0,0,0.26);\n}\n\n/* Radial Glow */\n.studio-button-glow {\n  background: radial-gradient(100% 100% at 50% 50%, rgba(27,17,214,0.45) 0%, transparent 70%), rgba(0,0,0,1);\n}`,
        },
    ],

    /* ── Card ── */
    card: [
        {
            title: 'Default',
            preview: (
                <Card style={{ background: T.surface, borderColor: T.border, borderRadius: 16, maxWidth: 360 }}>
                    <CardHeader><CardTitle style={{ color: T.text }}>Default Card</CardTitle><CardDescription style={{ color: T.textSec }}>A surface with subtle border.</CardDescription></CardHeader>
                    <CardContent><p className="text-sm" style={{ color: T.textMuted }}>Flexible content area with warm neutral styling.</p></CardContent>
                    <CardFooter className="flex gap-3"><Button size="sm" style={{ background: T.brand, color: '#0a0a0b', borderRadius: 8 }}>Action</Button><Button size="sm" variant="ghost" style={{ color: T.textSec }}>Cancel</Button></CardFooter>
                </Card>
            ),
            code: `<Card>\n  <CardHeader>\n    <CardTitle>Default Card</CardTitle>\n    <CardDescription>A surface with subtle border.</CardDescription>\n  </CardHeader>\n  <CardContent><p>Flexible content area.</p></CardContent>\n  <CardFooter>\n    <Button size="sm">Action</Button>\n    <Button size="sm" variant="ghost">Cancel</Button>\n  </CardFooter>\n</Card>`,
        },
        {
            title: 'Elevated',
            preview: (
                <Card variant="elevated" style={{ background: T.elevated, borderColor: 'transparent', borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.4)', maxWidth: 360 }}>
                    <CardHeader><CardTitle style={{ color: T.text }}>Elevated Card</CardTitle><CardDescription style={{ color: T.textSec }}>Deep shadow for prominent surfaces.</CardDescription></CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: `${T.interactive}30`, color: T.interactive }}>KN</div>
                            <div><p className="text-sm font-medium" style={{ color: T.text }}>Kai Nakamura</p><p className="text-xs" style={{ color: T.textMuted }}>Lead Designer</p></div>
                        </div>
                    </CardContent>
                </Card>
            ),
            code: `<Card variant="elevated">\n  <CardHeader>\n    <CardTitle>Elevated Card</CardTitle>\n    <CardDescription>Deep shadow for prominent surfaces.</CardDescription>\n  </CardHeader>\n  <CardContent>...</CardContent>\n</Card>`,
        },
    ],

    /* ── Checkbox ── */
    checkbox: [
        {
            title: 'States',
            preview: (
                <div className="space-y-4">
                    {['Enable notifications', 'Auto-save drafts', 'Dark mode'].map((label, i) => (
                        <label key={label} className="flex items-center gap-3 cursor-pointer">
                            <Checkbox defaultChecked={i < 2} style={{ borderColor: T.borderStrong, borderRadius: 4 }} />
                            <span className="text-sm" style={{ color: T.text }}>{label}</span>
                        </label>
                    ))}
                </div>
            ),
            code: `<label className="flex items-center gap-3">\n  <Checkbox defaultChecked />\n  <span>Enable notifications</span>\n</label>`,
        },
        {
            title: 'Color Variants',
            preview: (
                <div className="space-y-4">
                    {[
                        { label: 'Brand accent', color: T.brand },
                        { label: 'Interactive violet', color: T.interactive },
                        { label: 'Electric cyan', color: T.electric },
                        { label: 'Success green', color: T.success },
                    ].map((item) => (
                        <label key={item.label} className="flex items-center gap-3 cursor-pointer">
                            <Checkbox defaultChecked className="data-[state=checked]:border-transparent" style={{ borderColor: T.borderStrong, borderRadius: 4, '--primary': item.color, '--primary-foreground': '#0a0a0b' } as React.CSSProperties} />
                            <span className="text-sm" style={{ color: T.text }}>{item.label}</span>
                        </label>
                    ))}
                </div>
            ),
            code: `<Checkbox defaultChecked style={{ '--primary': '#f5a623' }} />\n<Checkbox defaultChecked style={{ '--primary': '#7c3aed' }} />`,
        },
        {
            title: 'Disabled & Indeterminate',
            preview: (
                <div className="space-y-4">
                    <label className="flex items-center gap-3 cursor-not-allowed opacity-50">
                        <Checkbox disabled defaultChecked style={{ borderColor: T.borderStrong, borderRadius: 4 }} />
                        <span className="text-sm" style={{ color: T.textMuted }}>Disabled checked</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-not-allowed opacity-50">
                        <Checkbox disabled style={{ borderColor: T.borderStrong, borderRadius: 4 }} />
                        <span className="text-sm" style={{ color: T.textMuted }}>Disabled unchecked</span>
                    </label>
                </div>
            ),
            code: `<Checkbox disabled defaultChecked />\n<Checkbox disabled />`,
        },
    ],

    /* ── Data Table ── */
    'data-table': [
        {
            title: 'Sortable & Striped',
            preview: (
                <div style={{ borderRadius: 12, border: `1px solid ${T.border}`, overflow: 'hidden', maxWidth: 600 }}>
                    <DataTable columns={TABLE_COLUMNS} data={TABLE_DATA} sortable striped headerBg={T.elevated} rowBg={T.surface} stripedBg={T.subtle} textColor={T.text} headerTextColor={T.textSec} borderColor={T.border} badgeColors={TABLE_BADGE_COLORS} />
                </div>
            ),
            code: `<DataTable\n  columns={columns}\n  data={data}\n  sortable\n  striped\n  headerBg="#1a1a1d"\n  rowBg="#141416"\n  stripedBg="#111113"\n/>`,
        },
    ],

    /* ── Dialog ── */
    dialog: [
        {
            title: 'Confirmation',
            preview: <DialogExample />,
            code: `<Dialog>\n  <DialogTrigger>\n    <Button>Open Dialog</Button>\n  </DialogTrigger>\n  <ModalOverlay isDismissable>\n    <Modal>\n      <Dialog>\n        <DialogHeader title="Confirm deployment" />\n        <DialogBody>Branch main will be deployed.</DialogBody>\n        <DialogFooter>\n          <DialogClose>Cancel</DialogClose>\n          <Button>Deploy</Button>\n        </DialogFooter>\n      </Dialog>\n    </Modal>\n  </ModalOverlay>\n</Dialog>`,
        },
    ],

    /* ── Drawer ── */
    drawer: [
        {
            title: 'Navigation Drawer',
            preview: (
                <Drawer>
                    <DrawerTrigger asChild>
                        <Button style={{ background: T.brand, color: '#0a0a0b', borderRadius: 10 }}>Open Settings</Button>
                    </DrawerTrigger>
                    <DrawerContent side="right" style={{ background: T.elevated, borderColor: T.border }}>
                        <DrawerHeader style={{ borderBottom: `1px solid ${T.border}` }}>
                            <DrawerTitle style={{ color: T.text }}>Settings</DrawerTitle>
                            <DrawerDescription style={{ color: T.textSec }}>Configure your workspace.</DrawerDescription>
                        </DrawerHeader>
                        <div className="p-3 space-y-0.5">
                            {['General', 'Appearance', 'Notifications', 'Security', 'Billing'].map((item, i) => (
                                <div key={item} className="px-3 py-2 rounded-lg text-[13px] cursor-pointer transition-colors" style={{ background: i === 1 ? `${T.brand}15` : 'transparent', color: i === 1 ? T.brand : T.textSec }}>{item}</div>
                            ))}
                        </div>
                        <DrawerClose />
                    </DrawerContent>
                </Drawer>
            ),
            code: `<Drawer>\n  <DrawerTrigger asChild>\n    <Button>Open Settings</Button>\n  </DrawerTrigger>\n  <DrawerContent side="right">\n    <DrawerHeader>\n      <DrawerTitle>Settings</DrawerTitle>\n      <DrawerDescription>Configure your workspace.</DrawerDescription>\n    </DrawerHeader>\n    {/* Navigation items */}\n    <DrawerClose />\n  </DrawerContent>\n</Drawer>`,
        },
    ],

    /* ── Dropdown Menu ── */
    'dropdown-menu': [
        {
            title: 'With Shortcuts',
            preview: (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button style={{ background: T.elevated, color: T.text, borderRadius: 10, border: `1px solid ${T.borderStrong}` }}>Actions</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent style={{ background: T.elevated, borderColor: T.border }}>
                        <DropdownMenuItem style={{ color: T.text }}>Edit <DropdownMenuShortcut>⌘E</DropdownMenuShortcut></DropdownMenuItem>
                        <DropdownMenuItem style={{ color: T.text }}>Duplicate <DropdownMenuShortcut>⌘D</DropdownMenuShortcut></DropdownMenuItem>
                        <DropdownMenuItem style={{ color: T.text }}>Move to... <DropdownMenuShortcut>⌘M</DropdownMenuShortcut></DropdownMenuItem>
                        <DropdownMenuSeparator style={{ background: T.border }} />
                        <DropdownMenuItem style={{ color: T.text }}>Archive <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut></DropdownMenuItem>
                        <DropdownMenuItem variant="destructive">Delete <DropdownMenuShortcut>⇧⌘⌫</DropdownMenuShortcut></DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
            code: `<DropdownMenu>\n  <DropdownMenuTrigger asChild>\n    <Button>Actions</Button>\n  </DropdownMenuTrigger>\n  <DropdownMenuContent>\n    <DropdownMenuItem>Edit <DropdownMenuShortcut>⌘E</DropdownMenuShortcut></DropdownMenuItem>\n    <DropdownMenuItem>Duplicate <DropdownMenuShortcut>⌘D</DropdownMenuShortcut></DropdownMenuItem>\n    <DropdownMenuSeparator />\n    <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>\n  </DropdownMenuContent>\n</DropdownMenu>`,
        },
    ],

    /* ── Input ── */
    input: [
        {
            title: 'With Labels',
            preview: (
                <div className="grid grid-cols-2 gap-6 max-w-md">
                    <div className="space-y-2">
                        <label className="text-[13px] font-medium block" style={{ color: T.textSec }}>Email</label>
                        <Input placeholder="you@company.io" className="h-10 px-3 text-sm" style={{ background: T.surface, borderColor: T.borderStrong, color: T.text, borderRadius: 10, borderWidth: 1 }} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[13px] font-medium block" style={{ color: T.textSec }}>API Key</label>
                        <Input type="password" placeholder="sk-••••••••" className="h-10 px-3 text-sm" style={{ background: T.surface, borderColor: T.borderStrong, color: T.text, borderRadius: 10, borderWidth: 1 }} />
                    </div>
                </div>
            ),
            code: `<div className="space-y-2">\n  <label>Email</label>\n  <Input placeholder="you@company.io" />\n</div>`,
        },
        {
            title: 'Sizes',
            preview: (
                <div className="space-y-4 max-w-sm">
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-medium uppercase tracking-wider" style={{ color: T.textMuted }}>Small</label>
                        <Input placeholder="Small input" className="h-8 px-2.5 text-xs" style={{ background: T.surface, borderColor: T.borderStrong, color: T.text, borderRadius: 8, borderWidth: 1 }} />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-medium uppercase tracking-wider" style={{ color: T.textMuted }}>Default</label>
                        <Input placeholder="Default input" className="h-10 px-3 text-sm" style={{ background: T.surface, borderColor: T.borderStrong, color: T.text, borderRadius: 10, borderWidth: 1 }} />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-medium uppercase tracking-wider" style={{ color: T.textMuted }}>Large</label>
                        <Input placeholder="Large input" className="h-12 px-4 text-base" style={{ background: T.surface, borderColor: T.borderStrong, color: T.text, borderRadius: 12, borderWidth: 1 }} />
                    </div>
                </div>
            ),
            code: `<Input className="h-8 px-2.5 text-xs" placeholder="Small" />\n<Input className="h-10 px-3 text-sm" placeholder="Default" />\n<Input className="h-12 px-4 text-base" placeholder="Large" />`,
        },
        {
            title: 'Disabled',
            preview: (
                <div className="max-w-xs">
                    <Input disabled placeholder="Not editable" className="h-10 px-3 text-sm" style={{ background: T.subtle, borderColor: T.border, color: T.textMuted, borderRadius: 10, borderWidth: 1, opacity: 0.5 }} />
                </div>
            ),
            code: `<Input disabled placeholder="Not editable" />`,
        },
    ],

    /* ── Navigation Menu ── */
    'navigation-menu': [
        {
            title: 'Horizontal with Dropdown',
            preview: (
                <NavigationMenu hoverBg={`${T.brand}15`} hoverText={T.brand} activeBg={T.brand} activeText="#0a0a0b">
                    <NavigationMenuList>
                        <NavigationMenuItem>
                            <NavMenuTrigger style={{ color: T.text, background: 'transparent' }}>Products</NavMenuTrigger>
                            <NavigationMenuContent className="p-4" style={{ background: T.elevated, borderColor: T.border }}>
                                <div className="grid gap-2 w-[320px]">
                                    {['Analytics', 'Automation', 'Integrations'].map((item) => (
                                        <NavigationMenuLink key={item} className="block px-3 py-2 rounded-lg text-[13px] transition-colors cursor-pointer" style={{ color: T.textSec }}>
                                            <span className="font-medium block" style={{ color: T.text }}>{item}</span>
                                            <span className="text-xs" style={{ color: T.textMuted }}>Manage your {item.toLowerCase()}</span>
                                        </NavigationMenuLink>
                                    ))}
                                </div>
                            </NavigationMenuContent>
                        </NavigationMenuItem>
                        <NavigationMenuItem>
                            <NavigationMenuLink active activeBg={T.brand} activeText="#0a0a0b" className="px-4 py-2 rounded-lg text-[13px] font-medium cursor-pointer">Dashboard</NavigationMenuLink>
                        </NavigationMenuItem>
                        <NavigationMenuItem>
                            <NavigationMenuLink className="px-4 py-2 rounded-lg text-[13px] font-medium cursor-pointer" style={{ color: T.textSec }}>Settings</NavigationMenuLink>
                        </NavigationMenuItem>
                    </NavigationMenuList>
                </NavigationMenu>
            ),
            code: `<NavigationMenu>\n  <NavigationMenuList>\n    <NavigationMenuItem>\n      <NavigationMenuTrigger>Products</NavigationMenuTrigger>\n      <NavigationMenuContent>\n        <NavigationMenuLink>Analytics</NavigationMenuLink>\n        <NavigationMenuLink>Automation</NavigationMenuLink>\n      </NavigationMenuContent>\n    </NavigationMenuItem>\n    <NavigationMenuItem>\n      <NavigationMenuLink active>Dashboard</NavigationMenuLink>\n    </NavigationMenuItem>\n  </NavigationMenuList>\n</NavigationMenu>`,
        },
    ],

    /* ── Popover ── */
    popover: [
        {
            title: 'Settings Popover',
            preview: (
                <Popover>
                    <PopoverTrigger asChild>
                        <Button style={{ background: T.elevated, color: T.text, borderRadius: 10, border: `1px solid ${T.borderStrong}` }}>Quick Settings</Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-4" style={{ background: T.elevated, borderColor: T.border }}>
                        <p className="text-[13px] font-medium mb-3" style={{ color: T.text }}>Quick settings</p>
                        <div className="space-y-3">
                            <label className="flex items-center justify-between"><span className="text-[13px]" style={{ color: T.textSec }}>Compact mode</span><Switch size="sm" trackColor={T.surface} trackActiveColor={T.brand} thumbColor={T.textMuted} thumbActiveColor="#0a0a0b" /></label>
                            <label className="flex items-center justify-between"><span className="text-[13px]" style={{ color: T.textSec }}>Sound effects</span><Switch size="sm" defaultChecked trackColor={T.surface} trackActiveColor={T.brand} thumbColor={T.textMuted} thumbActiveColor="#0a0a0b" /></label>
                        </div>
                    </PopoverContent>
                </Popover>
            ),
            code: `<Popover>\n  <PopoverTrigger asChild>\n    <Button>Quick Settings</Button>\n  </PopoverTrigger>\n  <PopoverContent>\n    <p>Quick settings</p>\n    <Switch>Compact mode</Switch>\n    <Switch defaultChecked>Sound effects</Switch>\n  </PopoverContent>\n</Popover>`,
        },
    ],

    /* ── Progress ── */
    progress: [
        {
            title: 'Linear',
            preview: (
                <div className="space-y-6 w-full max-w-md">
                    {[{ label: 'Upload', value: 78, color: T.brand }, { label: 'Build', value: 100, color: T.success }, { label: 'Deploy', value: 45, color: T.interactive }].map((p) => (
                        <div key={p.label} className="space-y-2 w-full">
                            <div className="flex justify-between text-[13px] px-0.5"><span style={{ color: T.textSec }}>{p.label}</span><span className="font-mono text-[12px]" style={{ color: p.color }}>{p.value}%</span></div>
                            <Progress value={p.value} trackColor={T.elevated} indicatorColor={p.color} className="w-full" />
                        </div>
                    ))}
                </div>
            ),
            code: `<Progress value={78} trackColor="#1a1a1d" indicatorColor="#f5a623" />`,
        },
        {
            title: 'Circular',
            preview: (
                <div className="flex gap-6">
                    {[{ v: 78, c: T.brand }, { v: 100, c: T.success }, { v: 45, c: T.interactive }, { v: 23, c: T.error }].map((p) => (
                        <Progress key={p.v} variant="circular" value={p.v} indicatorColor={p.c} trackColor={T.elevated} labelColor={T.text} showLabel circularSize={68} circularStrokeWidth={5} />
                    ))}
                </div>
            ),
            code: `<Progress variant="circular" value={78} indicatorColor="#f5a623" showLabel circularSize={68} />`,
        },
    ],

    /* ── Slider ── */
    slider: [
        {
            title: 'Default',
            preview: (
                <div className="w-full max-w-sm space-y-8">
                    <div className="space-y-3 w-full">
                        <div className="flex justify-between text-[13px] px-0.5"><span style={{ color: T.textSec }}>Opacity</span><span className="font-mono text-[12px]" style={{ color: T.brand }}>65%</span></div>
                        <Slider defaultValue={[65]} max={100} step={1} className="w-full" />
                    </div>
                    <div className="space-y-3 w-full">
                        <div className="flex justify-between text-[13px] px-0.5"><span style={{ color: T.textSec }}>Volume</span><span className="font-mono text-[12px]" style={{ color: T.textMuted }}>40%</span></div>
                        <Slider defaultValue={[40]} max={100} step={1} className="w-full" />
                    </div>
                </div>
            ),
            code: `<Slider defaultValue={[65]} max={100} step={1} />`,
        },
    ],

    /* ── Switch ── */
    switch: [
        {
            title: 'Color Variants',
            preview: (
                <div className="space-y-4">
                    {[{ label: 'Feature flags', color: T.brand }, { label: 'Analytics', color: T.interactive }, { label: 'Maintenance', color: T.error }].map((s, i) => (
                        <label key={s.label} className="flex items-center justify-between gap-8 cursor-pointer" style={{ width: 260 }}>
                            <span className="text-[13px]" style={{ color: T.text }}>{s.label}</span>
                            <Switch defaultChecked={i < 2} trackColor={T.elevated} trackActiveColor={s.color} thumbColor={T.textMuted} thumbActiveColor={s.color === T.error ? '#fff' : '#0a0a0b'} />
                        </label>
                    ))}
                </div>
            ),
            code: `<Switch\n  trackColor="#1a1a1d"\n  trackActiveColor="#f5a623"\n  thumbColor="#6b6b72"\n  thumbActiveColor="#0a0a0b"\n/>`,
        },
    ],

    /* ── Tabs ── */
    tabs: [
        {
            title: 'Line',
            preview: (
                <Tabs defaultValue="overview" style={{ maxWidth: 460 }}>
                    <TabsList variant="line" style={{ borderColor: T.border }}>
                        {['overview', 'analytics', 'settings'].map((v) => (
                            <TabsTrigger key={v} value={v} indicatorColor={T.brand} activeTextColor={T.text} inactiveTextColor={T.textMuted}>{v.charAt(0).toUpperCase() + v.slice(1)}</TabsTrigger>
                        ))}
                    </TabsList>
                    <TabsContent value="overview" className="pt-4 text-[13px]" style={{ color: T.textSec }}>Overview content with project summary and key metrics.</TabsContent>
                    <TabsContent value="analytics" className="pt-4 text-[13px]" style={{ color: T.textSec }}>Analytics dashboard with charts and insights.</TabsContent>
                    <TabsContent value="settings" className="pt-4 text-[13px]" style={{ color: T.textSec }}>Configure project settings and preferences.</TabsContent>
                </Tabs>
            ),
            code: `<Tabs defaultValue="overview">\n  <TabsList variant="line">\n    <TabsTrigger value="overview">Overview</TabsTrigger>\n    <TabsTrigger value="analytics">Analytics</TabsTrigger>\n  </TabsList>\n  <TabsContent value="overview">Overview content...</TabsContent>\n</Tabs>`,
        },
        {
            title: 'Pill',
            preview: (
                <Tabs defaultValue="all" style={{ maxWidth: 400 }}>
                    <TabsList variant="pill" listBg={T.elevated}>
                        {['all', 'active', 'archived'].map((v) => (
                            <TabsTrigger key={v} value={v} activeBg={T.brand} activeTextColor="#0a0a0b" inactiveTextColor={T.textMuted}>{v.charAt(0).toUpperCase() + v.slice(1)}</TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
            ),
            code: `<Tabs defaultValue="all">\n  <TabsList variant="pill">\n    <TabsTrigger value="all">All</TabsTrigger>\n    <TabsTrigger value="active">Active</TabsTrigger>\n  </TabsList>\n</Tabs>`,
        },
    ],

    /* ── Tooltip ── */
    tooltip: [
        {
            title: 'Default & Inverse',
            preview: (
                <div className="flex gap-4">
                    <Tooltip>
                        <Button style={{ background: T.elevated, color: T.text, borderRadius: 10, border: `1px solid ${T.borderStrong}` }}>Hover me</Button>
                        <TooltipContent inverse><p>Useful context tooltip.</p></TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <Button style={{ background: T.brand, color: '#0a0a0b', borderRadius: 10 }}>Brand tooltip</Button>
                        <TooltipContent><p>Saves your configuration.</p></TooltipContent>
                    </Tooltip>
                </div>
            ),
            code: `<Tooltip>\n  <Button>Hover me</Button>\n  <TooltipContent inverse>\n    <p>Useful context tooltip.</p>\n  </TooltipContent>\n</Tooltip>`,
        },
    ],

    /* ── Animated Text ── */
    'animated-text': [
        {
            title: 'Entry Animations',
            preview: (
                <div className="grid grid-cols-2 gap-6">
                    {[
                        { v: 'blur-in' as const, text: 'Blur In', color: T.text },
                        { v: 'fade-up' as const, text: 'Fade Up', color: T.brand },
                        { v: 'split-entrance' as const, text: 'Split Entrance', color: T.text },
                        { v: 'letters-pull-up' as const, text: 'Letters Pull Up', color: T.text },
                    ].map((item) => (
                        <div key={item.v} className="p-4 rounded-xl" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                            <p className="text-[11px] font-mono mb-2" style={{ color: T.textMuted }}>{item.v}</p>
                            <AnimatedText text={item.text} variant={item.v} speed={0.4} stagger={0.04} splitBy="word" trigger="mount" style={{ fontSize: 24, fontWeight: 600, color: item.color }} />
                        </div>
                    ))}
                </div>
            ),
            code: `<AnimatedText text="Blur In" variant="blur-in" speed={0.4} stagger={0.04} />`,
        },
        {
            title: 'Continuous Effects',
            preview: (
                <div className="grid grid-cols-2 gap-6">
                    {[
                        { v: 'gradient-sweep' as const, text: 'Gradient', extra: { gradientColor1: T.brand, gradientColor2: T.interactive } },
                        { v: 'shiny-text' as const, text: 'Premium', style: { color: T.textMuted } },
                        { v: 'typewriter' as const, text: 'Building the future...', style: { color: T.textSec }, speed: 1.2 },
                        { v: 'decrypt' as const, text: 'ENCRYPTED', style: { color: T.electric }, speed: 1.5 },
                    ].map((item) => (
                        <div key={item.v} className="p-4 rounded-xl" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                            <p className="text-[11px] font-mono mb-2" style={{ color: T.textMuted }}>{item.v}</p>
                            <AnimatedText text={item.text} variant={item.v} speed={item.speed ?? 0.4} stagger={0.04} splitBy="word" trigger="mount" style={{ fontSize: 24, fontWeight: 700, ...item.style }} {...('extra' in item ? item.extra : {})} />
                        </div>
                    ))}
                </div>
            ),
            code: `<AnimatedText text="Gradient" variant="gradient-sweep" gradientColor1="#f5a623" gradientColor2="#7c3aed" />`,
        },
        {
            title: 'Hover Interactive',
            preview: (
                <div className="grid grid-cols-2 gap-6">
                    {[
                        { v: 'bounce' as const, text: 'Hover me!' },
                        { v: 'bubble' as const, text: 'Proximity' },
                        { v: 'disperse' as const, text: 'Scatter' },
                        { v: 'pattern' as const, text: 'PATTERN', style: { fontSize: 36, fontWeight: 800, color: T.textMuted } },
                    ].map((item) => (
                        <div key={item.v} className="p-4 rounded-xl" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                            <p className="text-[11px] font-mono mb-2" style={{ color: T.textMuted }}>{item.v}</p>
                            <AnimatedText text={item.text} variant={item.v} speed={0.4} stagger={0.04} splitBy="word" trigger="mount" style={{ fontSize: 28, fontWeight: 700, color: T.text, ...item.style }} />
                        </div>
                    ))}
                </div>
            ),
            code: `<AnimatedText text="Hover me!" variant="bounce" />\n<AnimatedText text="Proximity" variant="bubble" />\n<AnimatedText text="Scatter" variant="disperse" />\n<AnimatedText text="PATTERN" variant="pattern" />`,
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
