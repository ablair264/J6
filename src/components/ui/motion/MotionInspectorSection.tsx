import { type CSSProperties, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { Switch } from 'radix-ui';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { FlatSelect } from '@/components/ui/ui-studio/inspector';
import { cn } from '@/lib/utils';
import type {
    ComponentStyleConfig,
    MotionEaseOption,
    MotionTransitionType,
    StaggerDirection,
    UIComponentKind,
} from '@/components/ui/ui-studio.types';
import { supportsStaggerMotion } from '@/components/ui/ui-studio/utilities';

export type MotionPresetOption = { id: string; label: string; description: string; values?: Partial<ComponentStyleConfig> };

type MotionTriggerTab = 'hover' | 'tap' | 'overlay';

interface MotionControlTuning {
    hoverScaleMin: number;
    hoverScaleMax: number;
    hoverOffset: number;
    hoverRotateRange: number;
    tapScaleMin: number;
    tapScaleMax: number;
    tapOffset: number;
    tapRotateRange: number;
    overlayOffset: number;
    overlayRotateRange: number;
}

const DEFAULT_MOTION_CONTROL_TUNING: MotionControlTuning = {
    hoverScaleMin: 80,
    hoverScaleMax: 140,
    hoverOffset: 40,
    hoverRotateRange: 20,
    tapScaleMin: 70,
    tapScaleMax: 110,
    tapOffset: 20,
    tapRotateRange: 20,
    overlayOffset: 120,
    overlayRotateRange: 30,
};

const MOTION_CONTROL_TUNING_BY_KIND: Partial<Record<UIComponentKind, Partial<MotionControlTuning>>> = {
    button: {
        hoverScaleMin: 92,
        hoverScaleMax: 118,
        hoverOffset: 24,
        tapScaleMin: 85,
        tapScaleMax: 104,
        tapOffset: 14,
    },
    'stage-button': {
        hoverScaleMin: 92,
        hoverScaleMax: 118,
        hoverOffset: 24,
        tapScaleMin: 85,
        tapScaleMax: 104,
        tapOffset: 14,
    },
    badge: {
        hoverScaleMin: 92,
        hoverScaleMax: 116,
        hoverOffset: 18,
        tapScaleMin: 86,
        tapScaleMax: 105,
        tapOffset: 12,
    },
    input: {
        hoverScaleMin: 96,
        hoverScaleMax: 108,
        hoverOffset: 12,
        hoverRotateRange: 10,
        tapScaleMin: 92,
        tapScaleMax: 104,
        tapOffset: 10,
        tapRotateRange: 10,
    },
    tabs: {
        hoverScaleMin: 94,
        hoverScaleMax: 112,
        hoverOffset: 14,
        tapScaleMin: 90,
        tapScaleMax: 106,
        tapOffset: 10,
    },
    checkbox: {
        hoverScaleMin: 90,
        hoverScaleMax: 120,
        hoverOffset: 14,
        tapScaleMin: 82,
        tapScaleMax: 108,
        tapOffset: 10,
    },
    slider: {
        hoverScaleMin: 96,
        hoverScaleMax: 110,
        hoverOffset: 10,
        hoverRotateRange: 8,
        tapScaleMin: 90,
        tapScaleMax: 106,
        tapOffset: 8,
        tapRotateRange: 8,
    },
    tooltip: {
        hoverScaleMin: 94,
        hoverScaleMax: 110,
        hoverOffset: 10,
        tapScaleMin: 92,
        tapScaleMax: 106,
        tapOffset: 8,
        overlayOffset: 80,
    },
    popover: {
        hoverScaleMin: 94,
        hoverScaleMax: 110,
        hoverOffset: 12,
        tapScaleMin: 92,
        tapScaleMax: 106,
        tapOffset: 10,
        overlayOffset: 150,
    },
    dropdown: {
        hoverScaleMin: 94,
        hoverScaleMax: 110,
        hoverOffset: 12,
        tapScaleMin: 92,
        tapScaleMax: 106,
        tapOffset: 10,
        overlayOffset: 140,
    },
    dialog: {
        hoverScaleMin: 94,
        hoverScaleMax: 108,
        hoverOffset: 10,
        tapScaleMin: 92,
        tapScaleMax: 106,
        tapOffset: 8,
        overlayOffset: 200,
        overlayRotateRange: 18,
    },
};

function getMotionControlTuning(kind: UIComponentKind): MotionControlTuning {
    const override = MOTION_CONTROL_TUNING_BY_KIND[kind] ?? {};
    return {
        ...DEFAULT_MOTION_CONTROL_TUNING,
        ...override,
    };
}

function SpringCurve({ stiffness, damping }: { stiffness: number; damping: number }) {
    const w = 220;
    const h = 32;
    const points: string[] = [];
    const steps = 60;
    let x = 0;
    let v = 0;
    const dt = 0.016;
    const k = stiffness / 10000;
    const d = damping / 100;
    for (let i = 0; i <= steps; i++) {
        const px = Math.round((i / steps) * w);
        const a = -k * (x - 1) - d * v;
        v += a;
        x += v * dt * 60;
        const clamped = Math.max(0, Math.min(2, x));
        const py = Math.round(h - clamped * h * 0.85);
        points.push(`${px},${py}`);
    }
    return (
        <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="h-full w-full">
            <line x1="0" y1={h * 0.15} x2={w} y2={h * 0.15} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
            <polyline
                points={points.join(' ')}
                fill="none"
                stroke="#2dd4bf"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.85"
            />
        </svg>
    );
}

function MotionParamRow({
    label,
    hint,
    value,
    min,
    max,
    step = 1,
    unit,
    onChange,
}: {
    label: string;
    hint?: string;
    value: number;
    min: number;
    max: number;
    step?: number;
    unit?: string;
    onChange: (v: number) => void;
}) {
    const fill = max > min ? Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100)) : 0;
    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#8fa6c7]">
                    {label}
                    {hint ? <span className="ml-1 text-[10px] text-[#3d4f66]">- {hint}</span> : null}
                </span>
                <span className="font-mono text-[10px] text-[#64748b]">
                    {value}{unit ?? ''}
                </span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(event) => onChange(Number(event.target.value))}
                className="ui-studio-motion-range w-full"
                style={{ '--motion-fill-percent': `${fill}%` } as CSSProperties}
                aria-label={label}
            />
        </div>
    );
}

function XYPad({
    x,
    y,
    onXChange,
    onYChange,
    xMin = -120,
    xMax = 120,
    yMin = -120,
    yMax = 120,
    compact = false,
}: {
    x: number;
    y: number;
    onXChange: (value: number) => void;
    onYChange: (value: number) => void;
    xMin?: number;
    xMax?: number;
    yMin?: number;
    yMax?: number;
    compact?: boolean;
}) {
    const padRef = useRef<HTMLDivElement | null>(null);
    const [dragging, setDragging] = useState(false);

    const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

    const updateFromPointer = (clientX: number, clientY: number) => {
        const pad = padRef.current;
        if (!pad) {
            return;
        }
        const rect = pad.getBoundingClientRect();
        if (!rect.width || !rect.height) {
            return;
        }
        const xNorm = clamp((clientX - rect.left) / rect.width, 0, 1);
        const yNorm = clamp((clientY - rect.top) / rect.height, 0, 1);
        const nextX = Math.round(xMin + xNorm * (xMax - xMin));
        const nextY = Math.round(yMin + yNorm * (yMax - yMin));
        onXChange(nextX);
        onYChange(nextY);
    };

    useEffect(() => {
        if (!dragging) {
            return;
        }
        const handlePointerMove = (event: PointerEvent) => updateFromPointer(event.clientX, event.clientY);
        const handlePointerUp = () => setDragging(false);
        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);
        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
        };
    }, [dragging]);

    const xPercent = xMax > xMin ? ((clamp(x, xMin, xMax) - xMin) / (xMax - xMin)) * 100 : 50;
    const yPercent = yMax > yMin ? ((clamp(y, yMin, yMax) - yMin) / (yMax - yMin)) * 100 : 50;

    return (
        <div className="space-y-2">
            <div
                ref={padRef}
                className={cn(
                    'relative w-full touch-none overflow-hidden rounded-lg border border-white/7 bg-[#13161b] cursor-crosshair',
                    compact ? 'h-[82px]' : 'h-[100px]',
                )}
                onPointerDown={(event) => {
                    if (event.button !== 0) {
                        return;
                    }
                    event.preventDefault();
                    updateFromPointer(event.clientX, event.clientY);
                    setDragging(true);
                }}
            >
                <div className="pointer-events-none absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-white/8" />
                <div className="pointer-events-none absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-white/8" />
                <div className="pointer-events-none absolute bottom-1 right-2 text-[10px] text-[#334155]">X axis →</div>
                <div className="pointer-events-none absolute left-2 top-1 text-[10px] text-[#334155]">↓ Y</div>
                <div
                    className="pointer-events-none absolute size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#2dd4bf] shadow-[0_0_0_4px_rgba(45,212,191,0.15)]"
                    style={{ left: `${xPercent}%`, top: `${yPercent}%` }}
                />
            </div>
            <div className="grid grid-cols-2 gap-2">
                <div className="rounded-md bg-[#161c29] px-2 py-1 text-[12px] text-[#8fa6c7]">
                    X <span className="float-right font-mono text-[#d8e6fb]">{x}</span>
                </div>
                <div className="rounded-md bg-[#161c29] px-2 py-1 text-[12px] text-[#8fa6c7]">
                    Y <span className="float-right font-mono text-[#d8e6fb]">{y}</span>
                </div>
            </div>
        </div>
    );
}

function MotionPresetPreview({ presetId }: { presetId: string }) {
    const base = 'h-2.5 w-7 rounded-sm bg-[#2dd4bf]';
    switch (presetId) {
        case 'fade-in':
            return <motion.div className={base} animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }} />;
        case 'fade-scale':
            return <motion.div className={base} animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }} transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }} />;
        case 'scale-in':
            return <motion.div className={base} animate={{ scale: [0.72, 1.06, 1], opacity: [0.3, 1, 0.9] }} transition={{ duration: 1.1, repeat: Infinity, ease: 'easeOut' }} />;
        case 'slide-up':
            return <motion.div className={base} animate={{ y: [6, 0, 6], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }} />;
        case 'slide-up-left':
            return <motion.div className={base} animate={{ x: [-6, 0, -6], y: [6, 0, 6], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }} />;
        case 'slide-up-right':
            return <motion.div className={base} animate={{ x: [6, 0, 6], y: [6, 0, 6], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }} />;
        case 'slide-down':
            return <motion.div className={base} animate={{ y: [-6, 0, -6], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }} />;
        case 'slide-in-left':
            return <motion.div className={base} animate={{ x: [-8, 0, -8], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }} />;
        case 'slide-in-right':
            return <motion.div className={base} animate={{ x: [8, 0, 8], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }} />;
        case 'hover-lift':
            return <motion.div className={base} animate={{ y: [0, -4, 0], scale: [1, 1.03, 1] }} transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }} />;
        case 'hover-nudge-right':
            return <motion.div className={base} animate={{ x: [0, 5, 0] }} transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }} />;
        case 'card-hover':
            return <motion.div className={base} animate={{ y: [0, -6, 0], scale: [1, 1.05, 1] }} transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }} />;
        case 'tap-scale':
            return <motion.div className={base} animate={{ scale: [1, 0.92, 1] }} transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }} />;
        case 'tap-nudge-down':
            return <motion.div className={base} animate={{ y: [0, 4, 0] }} transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }} />;
        case 'button-press':
            return <motion.div className={base} animate={{ scale: [1, 0.9, 1] }} transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }} />;
        case 'motion-gradient-slide':
            return <motion.div className={base} animate={{ x: [-8, 8, -8] }} transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }} />;
        case 'motion-animated-border':
            return <motion.div className={base} animate={{ rotate: [0, 360] }} transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }} />;
        case 'motion-ripple-hover':
            return <motion.div className={base} animate={{ scale: [0.8, 1.3, 0.8], opacity: [0.7, 1, 0.7] }} transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }} />;
        case 'motion-loading-stack':
            return <motion.div className={base} animate={{ rotate: [0, 360] }} transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }} />;
        case 'motion-shiny-sweep':
            return <motion.div className={base} animate={{ x: [-10, 10, -10], opacity: [0.6, 1, 0.6] }} transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }} />;
        case 'motion-shimmer-orbit':
            return <motion.div className={base} animate={{ x: [-6, 6, -6], scale: [1, 1.08, 1] }} transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }} />;
        case 'motion-rainbow':
            return <motion.div className={base} animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.04, 1] }} transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }} />;
        default:
            return <motion.div className={base} animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }} />;
    }
}

function MotionPresetStrip({
    presets,
    onSelect,
    title = 'Quick presets',
    defaultOpen = true,
}: {
    presets: MotionPresetOption[];
    onSelect: (id: string) => void;
    title?: string;
    defaultOpen?: boolean;
}) {
    if (presets.length === 0) {
        return null;
    }
    return (
        <Collapsible defaultOpen={defaultOpen}>
            <div className="space-y-1.5">
                <CollapsibleTrigger className="group/presets flex w-full items-center justify-between text-left">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.07em] text-[#3d4f66]">{title}</p>
                    <ChevronDown className="size-3 text-[#526784] transition-transform duration-200 group-data-[state=open]/presets:rotate-180" />
                </CollapsibleTrigger>
                <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down data-[state=closed]:duration-150 data-[state=open]:duration-150">
                    <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                        {presets.map((preset) => (
                            <button
                                key={preset.id}
                                type="button"
                                onClick={() => onSelect(preset.id)}
                                className="rounded-md bg-[#111827] px-2 py-1.5 text-left transition hover:bg-[#162235]"
                            >
                                <div className="mb-1.5 flex h-8 items-center justify-center rounded bg-[#0b1220]">
                                    <MotionPresetPreview presetId={preset.id} />
                                </div>
                                <p className="truncate text-[10px] text-[#b7c8e4]">{preset.label}</p>
                            </button>
                        ))}
                    </div>
                </CollapsibleContent>
            </div>
        </Collapsible>
    );
}

function MotionTransitionCard({
    transitionType,
    ease,
    duration,
    delay,
    stiffness,
    damping,
    mass,
    customBezier,
    onTransitionTypeChange,
    onEaseChange,
    onDurationChange,
    onDelayChange,
    onStiffnessChange,
    onDampingChange,
    onMassChange,
    onCustomBezierChange,
}: {
    transitionType: MotionTransitionType;
    ease: MotionEaseOption;
    duration: number;
    delay: number;
    stiffness: number;
    damping: number;
    mass: number;
    customBezier?: [number, number, number, number];
    onTransitionTypeChange: (v: MotionTransitionType) => void;
    onEaseChange: (v: MotionEaseOption) => void;
    onDurationChange: (v: number) => void;
    onDelayChange: (v: number) => void;
    onStiffnessChange: (v: number) => void;
    onDampingChange: (v: number) => void;
    onMassChange: (v: number) => void;
    onCustomBezierChange?: (v: [number, number, number, number]) => void;
}) {
    return (
        <div className="space-y-2.5 border-t border-white/[0.08] pt-2">
            <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#8fa6c7]">Transition</span>
                <div className="flex gap-1">
                    {(['tween', 'spring'] as const).map((type) => (
                        <button
                            key={type}
                            type="button"
                            onClick={() => onTransitionTypeChange(type)}
                            className={cn(
                                'rounded px-2.5 py-1 text-[10px] font-semibold transition-colors',
                                transitionType === type
                                    ? 'bg-[rgba(45,212,191,0.12)] text-[#2dd4bf]'
                                    : 'text-[#64748b] hover:text-[#8fa6c7]',
                            )}
                        >
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {transitionType === 'spring' ? (
                <div className="h-8 overflow-hidden rounded bg-[#0b1220]">
                    <SpringCurve stiffness={stiffness} damping={damping} />
                </div>
            ) : null}

            {transitionType === 'spring' ? (
                <div className="space-y-2.5">
                    <MotionParamRow label="Stiffness" hint="how snappy" value={stiffness} min={40} max={600} step={5} onChange={onStiffnessChange} />
                    <MotionParamRow label="Damping" hint="bounce amount" value={damping} min={1} max={80} onChange={onDampingChange} />
                    <MotionParamRow label="Mass" value={mass} min={0.1} max={4} step={0.1} onChange={onMassChange} />
                </div>
            ) : (
                <div className="space-y-2.5">
                    <div className="space-y-1">
                        <span className="text-[11px] text-[#8fa6c7]">Easing</span>
                        <select
                            value={ease}
                            onChange={(event) => onEaseChange(event.target.value as MotionEaseOption)}
                            aria-label="Easing curve"
                            className="h-7 w-full rounded bg-[#111827] px-2 text-[11px] text-[#e2e8f0] outline-none focus:ring-1 focus:ring-[#2dd4bf]/40"
                        >
                            <optgroup label="Standard">
                                <option value="linear">Linear</option>
                                <option value="easeIn">Ease In</option>
                                <option value="easeOut">Ease Out</option>
                                <option value="easeInOut">Ease In Out</option>
                            </optgroup>
                            <optgroup label="Back">
                                <option value="backIn">Back In</option>
                                <option value="backOut">Back Out</option>
                                <option value="backInOut">Back In Out</option>
                            </optgroup>
                            <optgroup label="Circular">
                                <option value="circIn">Circ In</option>
                                <option value="circOut">Circ Out</option>
                                <option value="circInOut">Circ In Out</option>
                            </optgroup>
                            <optgroup label="Special">
                                <option value="anticipate">Anticipate</option>
                                <option value="cubicBezier">Custom Bezier</option>
                            </optgroup>
                        </select>
                    </div>
                    {ease === 'cubicBezier' && customBezier && onCustomBezierChange ? (
                        <div className="space-y-1">
                            <span className="text-[10px] text-[#64748b]">Control points</span>
                            <div className="grid grid-cols-4 gap-1">
                                {(['P1x', 'P1y', 'P2x', 'P2y'] as const).map((label, idx) => (
                                    <div key={label} className="space-y-0.5">
                                        <span className="text-[9px] text-[#475569]">{label}</span>
                                        <input
                                            type="number"
                                            value={customBezier[idx]}
                                            onChange={(event) => {
                                                const next = [...customBezier] as [number, number, number, number];
                                                next[idx] = Number.parseFloat(event.target.value) || 0;
                                                onCustomBezierChange(next);
                                            }}
                                            step={0.05}
                                            min={0}
                                            max={1}
                                            className="h-6 w-full rounded bg-[#111827] px-1.5 text-[10px] text-[#e2e8f0] outline-none focus:ring-1 focus:ring-[#2dd4bf]/40"
                                            aria-label={`Bezier ${label}`}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : null}
                    <MotionParamRow label="Duration" value={duration} min={0} max={2} step={0.05} unit="s" onChange={onDurationChange} />
                </div>
            )}

            <MotionParamRow label="Delay" value={delay} min={0} max={2} step={0.05} unit="s" onChange={onDelayChange} />
        </div>
    );
}

function MotionColorField({
    label,
    value,
    onChange,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
}) {
    const safeValue = /^#[0-9a-fA-F]{6}$/.test(value) ? value : '#22d3ee';
    return (
        <div className="space-y-1">
            <span className="text-[11px] text-[#8fa6c7]">{label}</span>
            <div className="grid grid-cols-[42px_minmax(0,1fr)] gap-2">
                <input
                    type="color"
                    value={safeValue}
                    onChange={(event) => onChange(event.target.value)}
                    className="h-8 w-full cursor-pointer rounded border border-white/10 bg-[#111827] p-1"
                    aria-label={label}
                />
                <input
                    type="text"
                    value={safeValue.toUpperCase()}
                    readOnly
                    className="h-8 rounded bg-[#111827] px-2 font-mono text-[11px] text-[#dbe7f8] outline-none focus:ring-1 focus:ring-[#2dd4bf]/40"
                    aria-label={`${label} hex`}
                />
            </div>
        </div>
    );
}

export function MotionInspectorSection({
    selectedStyle,
    componentKind,
    isOverlayComponent,
    supportsEntryMotion,
    supportsAdvancedHover,
    visualMotionPresets,
    interactionMotionPresets,
    surfaceMotionPresets,
    updateSelectedStyle,
    applyMotionComponentPreset,
    applyVisualMotionPreset,
    clearVisualMotionPreset,
}: {
    selectedStyle: ComponentStyleConfig;
    componentKind: UIComponentKind;
    isOverlayComponent: boolean;
    supportsEntryMotion: boolean;
    supportsAdvancedHover: boolean;
    visualMotionPresets: MotionPresetOption[];
    interactionMotionPresets: MotionPresetOption[];
    surfaceMotionPresets: MotionPresetOption[];
    updateSelectedStyle: <K extends keyof ComponentStyleConfig>(key: K, value: ComponentStyleConfig[K]) => void;
    applyMotionComponentPreset: (id: string) => void;
    applyVisualMotionPreset: (id: string) => void;
    clearVisualMotionPreset: () => void;
}) {
    const [activeTab, setActiveTab] = useState<MotionTriggerTab>(supportsEntryMotion ? 'overlay' : 'hover');
    const tuning = getMotionControlTuning(componentKind);
    const hasSplitOverlayMotion =
        componentKind === 'tooltip' ||
        componentKind === 'dialog' ||
        componentKind === 'popover' ||
        componentKind === 'dropdown';
    const showTriggerTabs = componentKind !== 'checkbox' && componentKind !== 'slider';
    const entryTabLabel = isOverlayComponent ? 'Overlay' : 'Entry';
    const entryHelperText = isOverlayComponent ? 'Runs when the overlay opens.' : 'Runs when the component appears.';
    const entryEnableLabel = isOverlayComponent ? 'Enable overlay motion' : 'Enable entry motion';
    const tabs: Array<{ id: MotionTriggerTab; icon: string; label: string }> = showTriggerTabs && supportsEntryMotion && !hasSplitOverlayMotion
        ? [
            { id: 'overlay', icon: '▣', label: entryTabLabel },
            { id: 'hover', icon: '✦', label: 'Hover' },
            { id: 'tap', icon: '◉', label: 'Tap' },
        ]
        : showTriggerTabs
            ? [
            { id: 'hover', icon: '✦', label: 'Hover' },
            { id: 'tap', icon: '◉', label: 'Tap' },
        ]
            : [];
    const overlayBodyPresetKey: keyof ComponentStyleConfig | null =
        componentKind === 'tooltip'
            ? 'tooltipBodyMotionPresetId'
            : componentKind === 'dialog'
                ? 'dialogBodyMotionPresetId'
                : componentKind === 'popover'
                    ? 'popoverBodyMotionPresetId'
                    : componentKind === 'dropdown'
                        ? 'dropdownBodyMotionPresetId'
                        : null;
    const overlayTextPresetKey: keyof ComponentStyleConfig | null =
        componentKind === 'tooltip'
            ? 'tooltipTextMotionPresetId'
            : componentKind === 'dialog'
                ? 'dialogTextMotionPresetId'
                : componentKind === 'popover'
                    ? 'popoverTextMotionPresetId'
                    : null;
    const hoverMotionPresets = useMemo(
        () =>
            interactionMotionPresets.filter(
                (preset) =>
                    preset.values?.motionHoverScale !== undefined ||
                    preset.values?.motionHoverX !== undefined ||
                    preset.values?.motionHoverY !== undefined ||
                    preset.values?.motionHoverRotate !== undefined ||
                    preset.values?.motionHoverOpacity !== undefined ||
                    preset.values?.motionHoverTransitionType !== undefined,
            ),
        [interactionMotionPresets],
    );
    const tapMotionPresets = useMemo(
        () =>
            interactionMotionPresets.filter(
                (preset) =>
                    preset.values?.motionTapScale !== undefined ||
                    preset.values?.motionTapX !== undefined ||
                    preset.values?.motionTapY !== undefined ||
                    preset.values?.motionTapRotate !== undefined ||
                    preset.values?.motionTapOpacity !== undefined ||
                    preset.values?.motionTapTransitionType !== undefined,
            ),
        [interactionMotionPresets],
    );
    const applyScopedInteractionPreset = (presetId: string, scope: 'hover' | 'tap') => {
        const preset = interactionMotionPresets.find((item) => item.id === presetId);
        if (!preset) {
            return;
        }
        if (scope === 'hover') {
            updateSelectedStyle('motionHoverEnabled', true);
            (Object.entries(preset.values ?? {}) as Array<[keyof ComponentStyleConfig, ComponentStyleConfig[keyof ComponentStyleConfig]]>).forEach(([key, value]) => {
                if (key === 'motionHoverEnabled' || String(key).startsWith('motionHover')) {
                    updateSelectedStyle(key, value);
                }
            });
            return;
        }
        updateSelectedStyle('motionTapEnabled', true);
        (Object.entries(preset.values ?? {}) as Array<[keyof ComponentStyleConfig, ComponentStyleConfig[keyof ComponentStyleConfig]]>).forEach(([key, value]) => {
            if (key === 'motionTapEnabled' || String(key).startsWith('motionTap')) {
                updateSelectedStyle(key, value);
            }
        });
    };
    const splitOverlayMotionOptions: MotionPresetOption[] = [
        {
            id: 'none',
            label: 'No motion',
            description: 'Keep this layer static with no entry animation.',
        },
        {
            id: 'custom',
            label: 'Custom',
            description: 'Use the manual controls below.',
        },
        ...surfaceMotionPresets,
    ];
    const renderSplitOverlayCustomControls = () => (
        <div className="space-y-2.5 rounded-md border border-white/[0.08] bg-[#0b1220]/50 p-2.5">
            <div className="space-y-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.07em] text-[#3d4f66]">Opacity</p>
                <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                        <span className="text-[10px] text-[#64748b]">From</span>
                        <MotionParamRow label="" value={selectedStyle.motionInitialOpacity} min={0} max={100} unit="%" onChange={(v) => updateSelectedStyle('motionInitialOpacity', v)} />
                    </div>
                    <div className="space-y-1">
                        <span className="text-[10px] text-[#64748b]">To</span>
                        <MotionParamRow label="" value={selectedStyle.motionAnimateOpacity} min={0} max={100} unit="%" onChange={(v) => updateSelectedStyle('motionAnimateOpacity', v)} />
                    </div>
                </div>
            </div>

            <div className="space-y-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.07em] text-[#3d4f66]">Transform</p>
                <XYPad
                    compact
                    x={selectedStyle.motionInitialX}
                    y={selectedStyle.motionInitialY}
                    xMin={-tuning.overlayOffset}
                    xMax={tuning.overlayOffset}
                    yMin={-tuning.overlayOffset}
                    yMax={tuning.overlayOffset}
                    onXChange={(value) => updateSelectedStyle('motionInitialX', value)}
                    onYChange={(value) => updateSelectedStyle('motionInitialY', value)}
                />
                <div className="grid grid-cols-2 gap-2">
                    <MotionParamRow label="End X" value={selectedStyle.motionAnimateX} min={-tuning.overlayOffset} max={tuning.overlayOffset} onChange={(v) => updateSelectedStyle('motionAnimateX', v)} />
                    <MotionParamRow label="End Y" value={selectedStyle.motionAnimateY} min={-tuning.overlayOffset} max={tuning.overlayOffset} onChange={(v) => updateSelectedStyle('motionAnimateY', v)} />
                </div>
                <MotionParamRow label="Rotate" value={selectedStyle.motionAnimateRotate} min={-tuning.overlayRotateRange} max={tuning.overlayRotateRange} unit="°" onChange={(v) => updateSelectedStyle('motionAnimateRotate', v)} />
            </div>

            <MotionTransitionCard
                transitionType={selectedStyle.motionTransitionType}
                ease={selectedStyle.motionEase}
                duration={selectedStyle.motionDuration}
                delay={selectedStyle.motionDelay}
                stiffness={selectedStyle.motionStiffness}
                damping={selectedStyle.motionDamping}
                mass={selectedStyle.motionMass}
                onTransitionTypeChange={(v) => updateSelectedStyle('motionTransitionType', v)}
                onEaseChange={(v) => updateSelectedStyle('motionEase', v)}
                onDurationChange={(v) => updateSelectedStyle('motionDuration', v)}
                onDelayChange={(v) => updateSelectedStyle('motionDelay', v)}
                onStiffnessChange={(v) => updateSelectedStyle('motionStiffness', v)}
                onDampingChange={(v) => updateSelectedStyle('motionDamping', v)}
                onMassChange={(v) => updateSelectedStyle('motionMass', v)}
                customBezier={selectedStyle.motionCustomBezier}
                onCustomBezierChange={(v) => updateSelectedStyle('motionCustomBezier', v)}
            />
        </div>
    );
    const advancedHoverEnabled =
        selectedStyle.motionHoverTiltEnabled ||
        selectedStyle.motionHoverGlareEnabled ||
        selectedStyle.motionHoverSpotlightEnabled;
    useEffect(() => {
        if ((!supportsEntryMotion || hasSplitOverlayMotion || !showTriggerTabs) && activeTab === 'overlay') {
            setActiveTab('hover');
        }
    }, [activeTab, supportsEntryMotion, hasSplitOverlayMotion, showTriggerTabs]);

    return (
        <div className="min-w-0 space-y-2.5">
            {showTriggerTabs ? (
                <div className="grid min-w-0 gap-1 py-1" style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}>
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                'flex flex-col items-center gap-0.5 rounded-md py-2 transition-all duration-150',
                                activeTab === tab.id
                                    ? 'bg-[rgba(45,212,191,0.1)]'
                                    : 'hover:bg-white/[0.04]',
                            )}
                        >
                            <span className={cn('text-sm leading-none', activeTab === tab.id ? 'text-[#2dd4bf]' : 'text-[#64748b]')}>
                                {tab.icon}
                            </span>
                            <span className={cn('text-[9px] font-semibold uppercase tracking-[0.06em]', activeTab === tab.id ? 'text-[#2dd4bf]' : 'text-[#64748b]')}>
                                {tab.label}
                            </span>
                        </button>
                    ))}
                </div>
            ) : null}

            {showTriggerTabs ? (
                <AnimatePresence mode="wait" initial={false}>
                {activeTab === 'overlay' && supportsEntryMotion ? (
                    <motion.div
                        key="overlay"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.14, ease: 'easeOut' }}
                        className="space-y-2.5"
                    >
                        <p className="text-[11px] text-[#8fa6c7]">{entryHelperText}</p>

                        <MotionPresetStrip presets={surfaceMotionPresets} onSelect={applyMotionComponentPreset} />

                        <div className="flex items-center justify-between">
                            <span className="text-[12px] text-[#e2e8f0]">{entryEnableLabel}</span>
                            <Switch.Root
                                checked={selectedStyle.motionEntryEnabled}
                                onCheckedChange={(checked) => {
                                    updateSelectedStyle('motionEntryEnabled', checked);
                                }}
                                aria-label={entryEnableLabel}
                                className={cn(
                                    'relative h-5 w-9 shrink-0 rounded-full border transition-colors duration-200 outline-none',
                                    'focus-visible:ring-2 focus-visible:ring-[#2dd4bf]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d0f12]',
                                    selectedStyle.motionEntryEnabled
                                        ? 'border-[#2dd4bf]/40 bg-[#2dd4bf]/20'
                                        : 'border-white/[0.12] bg-[#13161b]',
                                )}
                            >
                                <Switch.Thumb
                                    className={cn(
                                        'block size-3.5 rounded-full transition-transform duration-200 will-change-transform',
                                        selectedStyle.motionEntryEnabled ? 'translate-x-[18px] bg-[#2dd4bf]' : 'translate-x-[2px] bg-[#64748b]',
                                    )}
                                />
                            </Switch.Root>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-[12px] text-[#e2e8f0]">Enable exit motion</span>
                            <Switch.Root
                                checked={selectedStyle.motionExitEnabled}
                                onCheckedChange={(checked) => updateSelectedStyle('motionExitEnabled', checked)}
                                aria-label="Enable exit motion"
                                className={cn(
                                    'relative h-5 w-9 shrink-0 rounded-full border transition-colors duration-200 outline-none',
                                    'focus-visible:ring-2 focus-visible:ring-[#2dd4bf]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d0f12]',
                                    selectedStyle.motionExitEnabled
                                        ? 'border-[#2dd4bf]/40 bg-[#2dd4bf]/20'
                                        : 'border-white/[0.12] bg-[#13161b]',
                                )}
                            >
                                <Switch.Thumb
                                    className={cn(
                                        'block size-3.5 rounded-full transition-transform duration-200 will-change-transform',
                                        selectedStyle.motionExitEnabled ? 'translate-x-[18px] bg-[#2dd4bf]' : 'translate-x-[2px] bg-[#64748b]',
                                    )}
                                />
                            </Switch.Root>
                        </div>

                        <AnimatePresence initial={false}>
                            {selectedStyle.motionEntryEnabled || selectedStyle.motionExitEnabled ? (
                                <motion.div
                                    initial={{ opacity: 0, y: -4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -4 }}
                                    transition={{ duration: 0.15, ease: 'easeOut' }}
                                    className="space-y-2.5"
                                >
                                    <div className="space-y-2.5">
                                        <p className="text-[10px] font-semibold uppercase tracking-[0.07em] text-[#3d4f66]">Opacity</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="space-y-1">
                                                <span className="text-[10px] text-[#64748b]">From</span>
                                                <MotionParamRow label="" value={selectedStyle.motionInitialOpacity} min={0} max={100} unit="%" onChange={(v) => updateSelectedStyle('motionInitialOpacity', v)} />
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-[10px] text-[#64748b]">To</span>
                                                <MotionParamRow label="" value={selectedStyle.motionAnimateOpacity} min={0} max={100} unit="%" onChange={(v) => updateSelectedStyle('motionAnimateOpacity', v)} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2.5">
                                        <p className="text-[10px] font-semibold uppercase tracking-[0.07em] text-[#3d4f66]">Transform</p>
                                        <XYPad
                                            x={selectedStyle.motionInitialX}
                                            y={selectedStyle.motionInitialY}
                                            xMin={-tuning.overlayOffset}
                                            xMax={tuning.overlayOffset}
                                            yMin={-tuning.overlayOffset}
                                            yMax={tuning.overlayOffset}
                                            onXChange={(value) => updateSelectedStyle('motionInitialX', value)}
                                            onYChange={(value) => updateSelectedStyle('motionInitialY', value)}
                                        />
                                        <MotionParamRow label="Rotate" value={selectedStyle.motionAnimateRotate} min={-tuning.overlayRotateRange} max={tuning.overlayRotateRange} unit="°" onChange={(v) => updateSelectedStyle('motionAnimateRotate', v)} />
                                    </div>

                                    <MotionTransitionCard
                                        transitionType={selectedStyle.motionTransitionType}
                                        ease={selectedStyle.motionEase}
                                        duration={selectedStyle.motionDuration}
                                        delay={selectedStyle.motionDelay}
                                        stiffness={selectedStyle.motionStiffness}
                                        damping={selectedStyle.motionDamping}
                                        mass={selectedStyle.motionMass}
                                        onTransitionTypeChange={(v) => updateSelectedStyle('motionTransitionType', v)}
                                        onEaseChange={(v) => updateSelectedStyle('motionEase', v)}
                                        onDurationChange={(v) => updateSelectedStyle('motionDuration', v)}
                                        onDelayChange={(v) => updateSelectedStyle('motionDelay', v)}
                                        onStiffnessChange={(v) => updateSelectedStyle('motionStiffness', v)}
                                        onDampingChange={(v) => updateSelectedStyle('motionDamping', v)}
                                        onMassChange={(v) => updateSelectedStyle('motionMass', v)}
                                    />
                                </motion.div>
                            ) : null}
                        </AnimatePresence>
                    </motion.div>
                ) : null}

                {activeTab === 'hover' ? (
                    <motion.div
                        key="hover"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.14, ease: 'easeOut' }}
                        className="space-y-2.5"
                    >
                        <p className="text-[11px] text-[#8fa6c7]">Applies while hovered</p>

                        <MotionPresetStrip presets={hoverMotionPresets} onSelect={(id) => applyScopedInteractionPreset(id, 'hover')} title="Hover presets" defaultOpen={false} />

                        <div className="flex items-center justify-between">
                            <span className="text-[12px] text-[#e2e8f0]">Enable hover interaction</span>
                            <Switch.Root
                                checked={selectedStyle.motionHoverEnabled}
                                onCheckedChange={(checked) => updateSelectedStyle('motionHoverEnabled', checked)}
                                aria-label="Enable hover interaction"
                                className={cn(
                                    'relative h-5 w-9 shrink-0 rounded-full border transition-colors duration-200 outline-none',
                                    'focus-visible:ring-2 focus-visible:ring-[#2dd4bf]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d0f12]',
                                    selectedStyle.motionHoverEnabled
                                        ? 'border-[#2dd4bf]/40 bg-[#2dd4bf]/20'
                                        : 'border-white/[0.12] bg-[#13161b]',
                                )}
                            >
                                <Switch.Thumb
                                    className={cn(
                                        'block size-3.5 rounded-full transition-transform duration-200 will-change-transform',
                                        selectedStyle.motionHoverEnabled ? 'translate-x-[18px] bg-[#2dd4bf]' : 'translate-x-[2px] bg-[#64748b]',
                                    )}
                                />
                            </Switch.Root>
                        </div>

                        <AnimatePresence initial={false}>
                            {selectedStyle.motionHoverEnabled ? (
                                <motion.div
                                    initial={{ opacity: 0, y: -4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -4 }}
                                    transition={{ duration: 0.15, ease: 'easeOut' }}
                                    className="space-y-2.5"
                                >
                                    <div className="space-y-2.5">
                                        <p className="text-[10px] font-semibold uppercase tracking-[0.07em] text-[#3d4f66]">Transform</p>
                                        <MotionParamRow label="Scale" value={selectedStyle.motionHoverScale} min={tuning.hoverScaleMin} max={tuning.hoverScaleMax} unit="%" onChange={(v) => updateSelectedStyle('motionHoverScale', v)} />
                                        <XYPad
                                            compact
                                            x={selectedStyle.motionHoverX}
                                            y={selectedStyle.motionHoverY}
                                            xMin={-tuning.hoverOffset}
                                            xMax={tuning.hoverOffset}
                                            yMin={-tuning.hoverOffset}
                                            yMax={tuning.hoverOffset}
                                            onXChange={(value) => updateSelectedStyle('motionHoverX', value)}
                                            onYChange={(value) => updateSelectedStyle('motionHoverY', value)}
                                        />
                                        <MotionParamRow label="Rotate" value={selectedStyle.motionHoverRotate} min={-tuning.hoverRotateRange} max={tuning.hoverRotateRange} unit="°" onChange={(v) => updateSelectedStyle('motionHoverRotate', v)} />
                                        <MotionParamRow label="Opacity" value={selectedStyle.motionHoverOpacity} min={0} max={100} unit="%" onChange={(v) => updateSelectedStyle('motionHoverOpacity', v)} />
                                    </div>

                                    <MotionTransitionCard
                                        transitionType={selectedStyle.motionHoverTransitionType}
                                        ease={selectedStyle.motionHoverEase}
                                        duration={selectedStyle.motionHoverDuration}
                                        delay={selectedStyle.motionHoverDelay}
                                        stiffness={selectedStyle.motionHoverStiffness}
                                        damping={selectedStyle.motionHoverDamping}
                                        mass={selectedStyle.motionHoverMass}
                                        onTransitionTypeChange={(v) => updateSelectedStyle('motionHoverTransitionType', v)}
                                        onEaseChange={(v) => updateSelectedStyle('motionHoverEase', v)}
                                        onDurationChange={(v) => updateSelectedStyle('motionHoverDuration', v)}
                                        onDelayChange={(v) => updateSelectedStyle('motionHoverDelay', v)}
                                        onStiffnessChange={(v) => updateSelectedStyle('motionHoverStiffness', v)}
                                        onDampingChange={(v) => updateSelectedStyle('motionHoverDamping', v)}
                                        onMassChange={(v) => updateSelectedStyle('motionHoverMass', v)}
                                        customBezier={selectedStyle.motionCustomBezier}
                                        onCustomBezierChange={(v) => updateSelectedStyle('motionCustomBezier', v)}
                                    />
                                </motion.div>
                            ) : null}
                        </AnimatePresence>

                        {supportsAdvancedHover ? (
                            <Collapsible defaultOpen={advancedHoverEnabled}>
                                <div className="space-y-1.5 border-t border-white/[0.08] pt-2">
                                    <CollapsibleTrigger className="group/advanced-hover flex w-full items-center justify-between text-left">
                                        <p className="text-[10px] font-semibold uppercase tracking-[0.07em] text-[#3d4f66]">Advanced Hover</p>
                                        <ChevronDown className="size-3 text-[#526784] transition-transform duration-200 group-data-[state=open]/advanced-hover:rotate-180" />
                                    </CollapsibleTrigger>
                                    <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down data-[state=closed]:duration-150 data-[state=open]:duration-150">
                                        <div className="space-y-2.5 pt-1">
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between gap-3">
                                                    <span className="text-[11px] text-[#8fa6c7]">Tilt 3D</span>
                                                    <Switch.Root
                                                        checked={selectedStyle.motionHoverTiltEnabled}
                                                        onCheckedChange={(checked) => updateSelectedStyle('motionHoverTiltEnabled', checked)}
                                                        aria-label="Enable 3D tilt"
                                                        className={cn(
                                                            'relative h-5 w-9 shrink-0 rounded-full border transition-colors duration-200 outline-none',
                                                            'focus-visible:ring-2 focus-visible:ring-[#2dd4bf]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d0f12]',
                                                            selectedStyle.motionHoverTiltEnabled
                                                                ? 'border-[#2dd4bf]/40 bg-[#2dd4bf]/20'
                                                                : 'border-white/[0.12] bg-[#13161b]',
                                                        )}
                                                    >
                                                        <Switch.Thumb
                                                            className={cn(
                                                                'block size-3.5 rounded-full transition-transform duration-200 will-change-transform',
                                                                selectedStyle.motionHoverTiltEnabled ? 'translate-x-[18px] bg-[#2dd4bf]' : 'translate-x-[2px] bg-[#64748b]',
                                                            )}
                                                        />
                                                    </Switch.Root>
                                                </div>
                                                {selectedStyle.motionHoverTiltEnabled ? (
                                                    <MotionParamRow
                                                        label="Tilt Strength"
                                                        value={selectedStyle.motionHoverTiltStrength}
                                                        min={1}
                                                        max={45}
                                                        unit="°"
                                                        onChange={(v) => updateSelectedStyle('motionHoverTiltStrength', v)}
                                                    />
                                                ) : null}
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between gap-3">
                                                    <span className="text-[11px] text-[#8fa6c7]">Glare</span>
                                                    <Switch.Root
                                                        checked={selectedStyle.motionHoverGlareEnabled}
                                                        onCheckedChange={(checked) => updateSelectedStyle('motionHoverGlareEnabled', checked)}
                                                        aria-label="Enable glare"
                                                        className={cn(
                                                            'relative h-5 w-9 shrink-0 rounded-full border transition-colors duration-200 outline-none',
                                                            'focus-visible:ring-2 focus-visible:ring-[#2dd4bf]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d0f12]',
                                                            selectedStyle.motionHoverGlareEnabled
                                                                ? 'border-[#2dd4bf]/40 bg-[#2dd4bf]/20'
                                                                : 'border-white/[0.12] bg-[#13161b]',
                                                        )}
                                                    >
                                                        <Switch.Thumb
                                                            className={cn(
                                                                'block size-3.5 rounded-full transition-transform duration-200 will-change-transform',
                                                                selectedStyle.motionHoverGlareEnabled ? 'translate-x-[18px] bg-[#2dd4bf]' : 'translate-x-[2px] bg-[#64748b]',
                                                            )}
                                                        />
                                                    </Switch.Root>
                                                </div>
                                                {selectedStyle.motionHoverGlareEnabled ? (
                                                    <div className="space-y-2.5">
                                                        <MotionColorField
                                                            label="Glare Color"
                                                            value={selectedStyle.motionHoverGlareColor}
                                                            onChange={(value) => updateSelectedStyle('motionHoverGlareColor', value)}
                                                        />
                                                        <MotionParamRow
                                                            label="Glare Opacity"
                                                            value={selectedStyle.motionHoverGlareOpacity}
                                                            min={0.05}
                                                            max={1}
                                                            step={0.05}
                                                            onChange={(v) => updateSelectedStyle('motionHoverGlareOpacity', v)}
                                                        />
                                                    </div>
                                                ) : null}
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between gap-3">
                                                    <span className="text-[11px] text-[#8fa6c7]">Spotlight</span>
                                                    <Switch.Root
                                                        checked={selectedStyle.motionHoverSpotlightEnabled}
                                                        onCheckedChange={(checked) => updateSelectedStyle('motionHoverSpotlightEnabled', checked)}
                                                        aria-label="Enable spotlight"
                                                        className={cn(
                                                            'relative h-5 w-9 shrink-0 rounded-full border transition-colors duration-200 outline-none',
                                                            'focus-visible:ring-2 focus-visible:ring-[#2dd4bf]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d0f12]',
                                                            selectedStyle.motionHoverSpotlightEnabled
                                                                ? 'border-[#2dd4bf]/40 bg-[#2dd4bf]/20'
                                                                : 'border-white/[0.12] bg-[#13161b]',
                                                        )}
                                                    >
                                                        <Switch.Thumb
                                                            className={cn(
                                                                'block size-3.5 rounded-full transition-transform duration-200 will-change-transform',
                                                                selectedStyle.motionHoverSpotlightEnabled ? 'translate-x-[18px] bg-[#2dd4bf]' : 'translate-x-[2px] bg-[#64748b]',
                                                            )}
                                                        />
                                                    </Switch.Root>
                                                </div>
                                                {selectedStyle.motionHoverSpotlightEnabled ? (
                                                    <div className="space-y-2.5">
                                                        <MotionColorField
                                                            label="Spotlight Color"
                                                            value={selectedStyle.motionHoverSpotlightColor}
                                                            onChange={(value) => updateSelectedStyle('motionHoverSpotlightColor', value)}
                                                        />
                                                        <MotionParamRow
                                                            label="Spotlight Size"
                                                            value={selectedStyle.motionHoverSpotlightSize}
                                                            min={50}
                                                            max={600}
                                                            unit="px"
                                                            onChange={(v) => updateSelectedStyle('motionHoverSpotlightSize', v)}
                                                        />
                                                    </div>
                                                ) : null}
                                            </div>
                                        </div>
                                    </CollapsibleContent>
                                </div>
                            </Collapsible>
                        ) : null}
                    </motion.div>
                ) : null}

                {activeTab === 'tap' ? (
                    <motion.div
                        key="tap"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.14, ease: 'easeOut' }}
                        className="space-y-2.5"
                    >
                        <p className="text-[11px] text-[#8fa6c7]">Applies on press/tap</p>

                        <MotionPresetStrip presets={tapMotionPresets} onSelect={(id) => applyScopedInteractionPreset(id, 'tap')} title="Tap presets" defaultOpen={false} />

                        <div className="flex items-center justify-between">
                            <span className="text-[12px] text-[#e2e8f0]">Enable tap feedback</span>
                            <Switch.Root
                                checked={selectedStyle.motionTapEnabled}
                                onCheckedChange={(checked) => updateSelectedStyle('motionTapEnabled', checked)}
                                aria-label="Enable tap feedback"
                                className={cn(
                                    'relative h-5 w-9 shrink-0 rounded-full border transition-colors duration-200 outline-none',
                                    'focus-visible:ring-2 focus-visible:ring-[#2dd4bf]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d0f12]',
                                    selectedStyle.motionTapEnabled
                                        ? 'border-[#2dd4bf]/40 bg-[#2dd4bf]/20'
                                        : 'border-white/[0.12] bg-[#13161b]',
                                )}
                            >
                                <Switch.Thumb
                                    className={cn(
                                        'block size-3.5 rounded-full transition-transform duration-200 will-change-transform',
                                        selectedStyle.motionTapEnabled ? 'translate-x-[18px] bg-[#2dd4bf]' : 'translate-x-[2px] bg-[#64748b]',
                                    )}
                                />
                            </Switch.Root>
                        </div>

                        <AnimatePresence initial={false}>
                            {selectedStyle.motionTapEnabled ? (
                                <motion.div
                                    initial={{ opacity: 0, y: -4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -4 }}
                                    transition={{ duration: 0.15, ease: 'easeOut' }}
                                    className="space-y-2.5"
                                >
                                    <div className="space-y-2.5">
                                        <p className="text-[10px] font-semibold uppercase tracking-[0.07em] text-[#3d4f66]">Transform</p>
                                        <MotionParamRow label="Scale" value={selectedStyle.motionTapScale} min={tuning.tapScaleMin} max={tuning.tapScaleMax} unit="%" onChange={(v) => updateSelectedStyle('motionTapScale', v)} />
                                        <XYPad
                                            compact
                                            x={selectedStyle.motionTapX}
                                            y={selectedStyle.motionTapY}
                                            xMin={-tuning.tapOffset}
                                            xMax={tuning.tapOffset}
                                            yMin={-tuning.tapOffset}
                                            yMax={tuning.tapOffset}
                                            onXChange={(value) => updateSelectedStyle('motionTapX', value)}
                                            onYChange={(value) => updateSelectedStyle('motionTapY', value)}
                                        />
                                        <MotionParamRow label="Rotate" value={selectedStyle.motionTapRotate} min={-tuning.tapRotateRange} max={tuning.tapRotateRange} unit="°" onChange={(v) => updateSelectedStyle('motionTapRotate', v)} />
                                        <MotionParamRow label="Opacity" value={selectedStyle.motionTapOpacity} min={0} max={100} unit="%" onChange={(v) => updateSelectedStyle('motionTapOpacity', v)} />
                                    </div>

                                    <MotionTransitionCard
                                        transitionType={selectedStyle.motionTapTransitionType}
                                        ease={selectedStyle.motionTapEase}
                                        duration={selectedStyle.motionTapDuration}
                                        delay={selectedStyle.motionTapDelay}
                                        stiffness={selectedStyle.motionTapStiffness}
                                        damping={selectedStyle.motionTapDamping}
                                        mass={selectedStyle.motionTapMass}
                                        onTransitionTypeChange={(v) => updateSelectedStyle('motionTapTransitionType', v)}
                                        onEaseChange={(v) => {
                                            updateSelectedStyle('motionTapEase', v);
                                            if (selectedStyle.motionTapTransitionType === 'spring') {
                                                updateSelectedStyle('motionTapTransitionType', 'tween');
                                            }
                                        }}
                                        onDurationChange={(v) => updateSelectedStyle('motionTapDuration', v)}
                                        onDelayChange={(v) => updateSelectedStyle('motionTapDelay', v)}
                                        onStiffnessChange={(v) => updateSelectedStyle('motionTapStiffness', v)}
                                        onDampingChange={(v) => updateSelectedStyle('motionTapDamping', v)}
                                        onMassChange={(v) => updateSelectedStyle('motionTapMass', v)}
                                        customBezier={selectedStyle.motionCustomBezier}
                                        onCustomBezierChange={(v) => updateSelectedStyle('motionCustomBezier', v)}
                                    />
                                </motion.div>
                            ) : null}
                        </AnimatePresence>
                    </motion.div>
                ) : null}
                </AnimatePresence>
            ) : null}

            {hasSplitOverlayMotion ? (
                <Collapsible defaultOpen>
                    <div className="space-y-1.5 border-t border-white/[0.08] pt-2">
                        <CollapsibleTrigger className="group/split flex w-full items-center justify-between text-left">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.07em] text-[#3d4f66]">
                                {componentKind === 'dropdown' ? 'Dropdown Motion FX' : `${componentKind[0].toUpperCase()}${componentKind.slice(1)} Motion FX`}
                            </p>
                            <ChevronDown className="size-3 text-[#526784] transition-transform duration-200 group-data-[state=open]/split:rotate-180" />
                        </CollapsibleTrigger>
                        <CollapsibleContent className="space-y-2.5 overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down data-[state=closed]:duration-150 data-[state=open]:duration-150">
                            {overlayTextPresetKey ? (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-[11px] text-[#8fa6c7]">{`${componentKind[0].toUpperCase()}${componentKind.slice(1)} Text Motion`}</span>
                                        <Switch.Root
                                            checked={String(selectedStyle[overlayTextPresetKey]) !== 'none'}
                                            onCheckedChange={(checked) => {
                                                if (!checked) {
                                                    updateSelectedStyle(overlayTextPresetKey, 'none' as never);
                                                    return;
                                                }
                                                updateSelectedStyle(overlayTextPresetKey, 'custom' as never);
                                            }}
                                            aria-label={`Enable ${componentKind} text motion`}
                                            className={cn(
                                                'relative h-5 w-9 shrink-0 rounded-full border transition-colors duration-200 outline-none',
                                                'focus-visible:ring-2 focus-visible:ring-[#2dd4bf]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d0f12]',
                                                String(selectedStyle[overlayTextPresetKey]) !== 'none'
                                                    ? 'border-[#2dd4bf]/40 bg-[#2dd4bf]/20'
                                                    : 'border-white/[0.12] bg-[#13161b]',
                                            )}
                                        >
                                            <Switch.Thumb
                                                className={cn(
                                                    'block size-3.5 rounded-full transition-transform duration-200 will-change-transform',
                                                    String(selectedStyle[overlayTextPresetKey]) !== 'none'
                                                        ? 'translate-x-[18px] bg-[#2dd4bf]'
                                                        : 'translate-x-[2px] bg-[#64748b]',
                                                )}
                                            />
                                        </Switch.Root>
                                    </div>
                                    <FlatSelect
                                        value={String(selectedStyle[overlayTextPresetKey])}
                                        onValueChange={(value) => updateSelectedStyle(overlayTextPresetKey, value as never)}
                                        ariaLabel={`${componentKind} text motion preset`}
                                    >
                                        {splitOverlayMotionOptions.map((preset) => (
                                            <option key={preset.id} value={preset.id}>
                                                {preset.label}
                                            </option>
                                        ))}
                                    </FlatSelect>
                                    <p className="text-[10px] leading-relaxed text-[#64748b]">
                                        {splitOverlayMotionOptions.find((preset) => preset.id === String(selectedStyle[overlayTextPresetKey]))?.description ?? 'Select a motion preset.'}
                                    </p>
                                    {String(selectedStyle[overlayTextPresetKey]) === 'custom' ? renderSplitOverlayCustomControls() : null}
                                </div>
                            ) : null}
                            {overlayBodyPresetKey ? (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-[11px] text-[#8fa6c7]">
                                        {componentKind === 'dropdown' ? 'Dropdown Body Motion' : `${componentKind[0].toUpperCase()}${componentKind.slice(1)} Body Motion`}
                                        </span>
                                        <Switch.Root
                                            checked={String(selectedStyle[overlayBodyPresetKey]) !== 'none'}
                                            onCheckedChange={(checked) => {
                                                if (!checked) {
                                                    updateSelectedStyle(overlayBodyPresetKey, 'none' as never);
                                                    return;
                                                }
                                                updateSelectedStyle(overlayBodyPresetKey, 'custom' as never);
                                            }}
                                            aria-label={`Enable ${componentKind} body motion`}
                                            className={cn(
                                                'relative h-5 w-9 shrink-0 rounded-full border transition-colors duration-200 outline-none',
                                                'focus-visible:ring-2 focus-visible:ring-[#2dd4bf]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d0f12]',
                                                String(selectedStyle[overlayBodyPresetKey]) !== 'none'
                                                    ? 'border-[#2dd4bf]/40 bg-[#2dd4bf]/20'
                                                    : 'border-white/[0.12] bg-[#13161b]',
                                            )}
                                        >
                                            <Switch.Thumb
                                                className={cn(
                                                    'block size-3.5 rounded-full transition-transform duration-200 will-change-transform',
                                                    String(selectedStyle[overlayBodyPresetKey]) !== 'none'
                                                        ? 'translate-x-[18px] bg-[#2dd4bf]'
                                                        : 'translate-x-[2px] bg-[#64748b]',
                                                )}
                                            />
                                        </Switch.Root>
                                    </div>
                                    <FlatSelect
                                        value={String(selectedStyle[overlayBodyPresetKey])}
                                        onValueChange={(value) => updateSelectedStyle(overlayBodyPresetKey, value as never)}
                                        ariaLabel={`${componentKind} body motion preset`}
                                    >
                                        {splitOverlayMotionOptions.map((preset) => (
                                            <option key={preset.id} value={preset.id}>
                                                {preset.label}
                                            </option>
                                        ))}
                                    </FlatSelect>
                                    <p className="text-[10px] leading-relaxed text-[#64748b]">
                                        {splitOverlayMotionOptions.find((preset) => preset.id === String(selectedStyle[overlayBodyPresetKey]))?.description ?? 'Select a motion preset.'}
                                    </p>
                                    {String(selectedStyle[overlayBodyPresetKey]) === 'custom' ? renderSplitOverlayCustomControls() : null}
                                </div>
                            ) : null}

                            {componentKind === 'dropdown' ? (
                                <div className="space-y-2 rounded-md border border-white/[0.08] bg-[#0b1220]/50 p-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] text-[#8fa6c7]">Dropdown Option Hover</span>
                                        <Switch.Root
                                            checked={selectedStyle.dropdownOptionHoverEnabled}
                                            onCheckedChange={(checked) => updateSelectedStyle('dropdownOptionHoverEnabled', checked)}
                                            aria-label="Enable dropdown option hover motion"
                                            className={cn(
                                                'relative h-5 w-9 shrink-0 rounded-full border transition-colors duration-200 outline-none',
                                                selectedStyle.dropdownOptionHoverEnabled
                                                    ? 'border-[#2dd4bf]/40 bg-[#2dd4bf]/20'
                                                    : 'border-white/[0.12] bg-[#13161b]',
                                            )}
                                        >
                                            <Switch.Thumb className={cn('block size-3.5 rounded-full transition-transform duration-200', selectedStyle.dropdownOptionHoverEnabled ? 'translate-x-[18px] bg-[#2dd4bf]' : 'translate-x-[2px] bg-[#64748b]')} />
                                        </Switch.Root>
                                    </div>
                                    {selectedStyle.dropdownOptionHoverEnabled ? (
                                        <>
                                            <MotionParamRow label="Scale" value={selectedStyle.dropdownOptionHoverScale} min={90} max={115} unit="%" onChange={(v) => updateSelectedStyle('dropdownOptionHoverScale', v)} />
                                            <MotionParamRow label="Y Offset" value={selectedStyle.dropdownOptionHoverY} min={-12} max={12} unit="px" onChange={(v) => updateSelectedStyle('dropdownOptionHoverY', v)} />
                                        </>
                                    ) : null}
                                    <div className="h-px bg-white/[0.08]" />
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] text-[#8fa6c7]">Dropdown Option Tap</span>
                                        <Switch.Root
                                            checked={selectedStyle.dropdownOptionTapEnabled}
                                            onCheckedChange={(checked) => updateSelectedStyle('dropdownOptionTapEnabled', checked)}
                                            aria-label="Enable dropdown option tap motion"
                                            className={cn(
                                                'relative h-5 w-9 shrink-0 rounded-full border transition-colors duration-200 outline-none',
                                                selectedStyle.dropdownOptionTapEnabled
                                                    ? 'border-[#2dd4bf]/40 bg-[#2dd4bf]/20'
                                                    : 'border-white/[0.12] bg-[#13161b]',
                                            )}
                                        >
                                            <Switch.Thumb className={cn('block size-3.5 rounded-full transition-transform duration-200', selectedStyle.dropdownOptionTapEnabled ? 'translate-x-[18px] bg-[#2dd4bf]' : 'translate-x-[2px] bg-[#64748b]')} />
                                        </Switch.Root>
                                    </div>
                                    {selectedStyle.dropdownOptionTapEnabled ? (
                                        <>
                                            <MotionParamRow label="Scale" value={selectedStyle.dropdownOptionTapScale} min={85} max={110} unit="%" onChange={(v) => updateSelectedStyle('dropdownOptionTapScale', v)} />
                                            <MotionParamRow label="Y Offset" value={selectedStyle.dropdownOptionTapY} min={-12} max={12} unit="px" onChange={(v) => updateSelectedStyle('dropdownOptionTapY', v)} />
                                        </>
                                    ) : null}
                                </div>
                            ) : null}
                        </CollapsibleContent>
                    </div>
                </Collapsible>
            ) : null}

            {componentKind === 'alert' && selectedStyle.alertDismissible ? (
                <Collapsible defaultOpen>
                    <div className="space-y-1.5 border-t border-white/[0.08] pt-2">
                        <CollapsibleTrigger className="group/close-motion flex w-full items-center justify-between text-left">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.07em] text-[#3d4f66]">Close Button Motion</p>
                            <ChevronDown className="size-3 text-[#526784] transition-transform duration-200 group-data-[state=open]/close-motion:rotate-180" />
                        </CollapsibleTrigger>
                        <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down data-[state=closed]:duration-150 data-[state=open]:duration-150">
                            <div className="space-y-3 pt-1">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-[11px] text-[#8fa6c7]">Hover</span>
                                        <Switch.Root
                                            checked={selectedStyle.alertCloseHoverEnabled}
                                            onCheckedChange={(checked) => updateSelectedStyle('alertCloseHoverEnabled', checked)}
                                            aria-label="Enable hover motion for close button"
                                            className={cn(
                                                'relative h-5 w-9 shrink-0 rounded-full border transition-colors duration-200 outline-none',
                                                'focus-visible:ring-2 focus-visible:ring-[#2dd4bf]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d0f12]',
                                                selectedStyle.alertCloseHoverEnabled ? 'border-[#2dd4bf]/40 bg-[#2dd4bf]/20' : 'border-white/[0.12] bg-[#13161b]',
                                            )}
                                        >
                                            <Switch.Thumb
                                                className={cn(
                                                    'block size-3.5 rounded-full transition-transform duration-200 will-change-transform',
                                                    selectedStyle.alertCloseHoverEnabled ? 'translate-x-[18px] bg-[#2dd4bf]' : 'translate-x-[2px] bg-[#64748b]',
                                                )}
                                            />
                                        </Switch.Root>
                                    </div>
                                    {selectedStyle.alertCloseHoverEnabled ? (
                                        <MotionParamRow
                                            label="Hover Scale"
                                            value={selectedStyle.alertCloseHoverScale}
                                            min={90}
                                            max={118}
                                            unit="%"
                                            onChange={(value) => updateSelectedStyle('alertCloseHoverScale', value)}
                                        />
                                    ) : null}
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-[11px] text-[#8fa6c7]">Tap</span>
                                        <Switch.Root
                                            checked={selectedStyle.alertCloseTapEnabled}
                                            onCheckedChange={(checked) => updateSelectedStyle('alertCloseTapEnabled', checked)}
                                            aria-label="Enable tap motion for close button"
                                            className={cn(
                                                'relative h-5 w-9 shrink-0 rounded-full border transition-colors duration-200 outline-none',
                                                'focus-visible:ring-2 focus-visible:ring-[#2dd4bf]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d0f12]',
                                                selectedStyle.alertCloseTapEnabled ? 'border-[#2dd4bf]/40 bg-[#2dd4bf]/20' : 'border-white/[0.12] bg-[#13161b]',
                                            )}
                                        >
                                            <Switch.Thumb
                                                className={cn(
                                                    'block size-3.5 rounded-full transition-transform duration-200 will-change-transform',
                                                    selectedStyle.alertCloseTapEnabled ? 'translate-x-[18px] bg-[#2dd4bf]' : 'translate-x-[2px] bg-[#64748b]',
                                                )}
                                            />
                                        </Switch.Root>
                                    </div>
                                    {selectedStyle.alertCloseTapEnabled ? (
                                        <MotionParamRow
                                            label="Tap Scale"
                                            value={selectedStyle.alertCloseTapScale}
                                            min={80}
                                            max={110}
                                            unit="%"
                                            onChange={(value) => updateSelectedStyle('alertCloseTapScale', value)}
                                        />
                                    ) : null}
                                </div>
                            </div>
                        </CollapsibleContent>
                    </div>
                </Collapsible>
            ) : null}

            {componentKind === 'input' ? (
                <div className="space-y-2.5 border-t border-white/[0.08] pt-2">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] text-[#8fa6c7]">Autocomplete Dropdown</span>
                        <Switch.Root
                            checked={selectedStyle.inputAutocompleteEnabled}
                            onCheckedChange={(checked) => updateSelectedStyle('inputAutocompleteEnabled', checked)}
                            aria-label="Enable autocomplete dropdown"
                            className={cn(
                                'relative h-5 w-9 shrink-0 rounded-full border transition-colors duration-200 outline-none',
                                selectedStyle.inputAutocompleteEnabled
                                    ? 'border-[#2dd4bf]/40 bg-[#2dd4bf]/20'
                                    : 'border-white/[0.12] bg-[#13161b]',
                            )}
                        >
                            <Switch.Thumb className={cn('block size-3.5 rounded-full transition-transform duration-200', selectedStyle.inputAutocompleteEnabled ? 'translate-x-[18px] bg-[#2dd4bf]' : 'translate-x-[2px] bg-[#64748b]')} />
                        </Switch.Root>
                    </div>
                    {selectedStyle.inputAutocompleteEnabled ? (
                        <div className="space-y-1">
                            <span className="text-[11px] text-[#8fa6c7]">Autocomplete Body Motion</span>
                            <FlatSelect
                                value={selectedStyle.inputAutocompleteBodyMotionPresetId}
                                onValueChange={(value) => updateSelectedStyle('inputAutocompleteBodyMotionPresetId', value)}
                                ariaLabel="Autocomplete body motion preset"
                            >
                                {surfaceMotionPresets.map((preset) => (
                                    <option key={preset.id} value={preset.id}>
                                        {preset.label}
                                    </option>
                                ))}
                            </FlatSelect>
                        </div>
                    ) : null}
                </div>
            ) : null}

            {componentKind === 'tabs' ? (
                <div className="space-y-2.5 border-t border-white/[0.08] pt-2">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] text-[#8fa6c7]">Underline Motion</span>
                        <Switch.Root
                            checked={selectedStyle.tabsUnderlineMotionEnabled}
                            onCheckedChange={(checked) => updateSelectedStyle('tabsUnderlineMotionEnabled', checked)}
                            aria-label="Enable tab underline motion"
                            className={cn(
                                'relative h-5 w-9 shrink-0 rounded-full border transition-colors duration-200 outline-none',
                                selectedStyle.tabsUnderlineMotionEnabled
                                    ? 'border-[#2dd4bf]/40 bg-[#2dd4bf]/20'
                                    : 'border-white/[0.12] bg-[#13161b]',
                            )}
                        >
                            <Switch.Thumb className={cn('block size-3.5 rounded-full transition-transform duration-200', selectedStyle.tabsUnderlineMotionEnabled ? 'translate-x-[18px] bg-[#2dd4bf]' : 'translate-x-[2px] bg-[#64748b]')} />
                        </Switch.Root>
                    </div>
                    <div className="space-y-1">
                        <span className="text-[11px] text-[#8fa6c7]">Tab Body Motion</span>
                        <FlatSelect value={selectedStyle.tabsBodyMotionPresetId} onValueChange={(value) => updateSelectedStyle('tabsBodyMotionPresetId', value)} ariaLabel="Tab body motion preset">
                            {surfaceMotionPresets.map((preset) => (
                                <option key={preset.id} value={preset.id}>
                                    {preset.label}
                                </option>
                            ))}
                        </FlatSelect>
                    </div>
                    <div className="space-y-1">
                        <span className="text-[11px] text-[#8fa6c7]">Tab Text Motion</span>
                        <FlatSelect value={selectedStyle.tabsTextMotionPresetId} onValueChange={(value) => updateSelectedStyle('tabsTextMotionPresetId', value)} ariaLabel="Tab text motion preset">
                            {surfaceMotionPresets.map((preset) => (
                                <option key={preset.id} value={preset.id}>
                                    {preset.label}
                                </option>
                            ))}
                        </FlatSelect>
                    </div>
                </div>
            ) : null}

            {componentKind === 'switch' ? (
                <div className="space-y-2.5 border-t border-white/[0.08] pt-2">
                    <MotionParamRow
                        label="Transition Speed"
                        value={selectedStyle.switchAnimationSpeed}
                        min={0.05}
                        max={1}
                        step={0.05}
                        unit="s"
                        onChange={(value) => updateSelectedStyle('switchAnimationSpeed', value)}
                    />
                    <MotionParamRow
                        label="Thumb Scale (On)"
                        value={selectedStyle.switchThumbScale}
                        min={0.7}
                        max={1.3}
                        step={0.05}
                        unit="x"
                        onChange={(value) => updateSelectedStyle('switchThumbScale', value)}
                    />
                </div>
            ) : null}

            {componentKind === 'checkbox' ? (
                <div className="space-y-2.5 border-t border-white/[0.08] pt-2">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] text-[#8fa6c7]">Checkbox Hover</span>
                        <Switch.Root
                            checked={selectedStyle.checkboxHoverEnabled}
                            onCheckedChange={(checked) => updateSelectedStyle('checkboxHoverEnabled', checked)}
                            aria-label="Enable checkbox hover motion"
                            className={cn(
                                'relative h-5 w-9 shrink-0 rounded-full border transition-colors duration-200 outline-none',
                                selectedStyle.checkboxHoverEnabled
                                    ? 'border-[#2dd4bf]/40 bg-[#2dd4bf]/20'
                                    : 'border-white/[0.12] bg-[#13161b]',
                            )}
                        >
                            <Switch.Thumb className={cn('block size-3.5 rounded-full transition-transform duration-200', selectedStyle.checkboxHoverEnabled ? 'translate-x-[18px] bg-[#2dd4bf]' : 'translate-x-[2px] bg-[#64748b]')} />
                        </Switch.Root>
                    </div>
                    {selectedStyle.checkboxHoverEnabled ? (
                        <MotionParamRow label="Hover Scale" value={selectedStyle.checkboxHoverScale} min={90} max={130} unit="%" onChange={(v) => updateSelectedStyle('checkboxHoverScale', v)} />
                    ) : null}
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] text-[#8fa6c7]">Checkbox Tap</span>
                        <Switch.Root
                            checked={selectedStyle.checkboxTapEnabled}
                            onCheckedChange={(checked) => updateSelectedStyle('checkboxTapEnabled', checked)}
                            aria-label="Enable checkbox tap motion"
                            className={cn(
                                'relative h-5 w-9 shrink-0 rounded-full border transition-colors duration-200 outline-none',
                                selectedStyle.checkboxTapEnabled
                                    ? 'border-[#2dd4bf]/40 bg-[#2dd4bf]/20'
                                    : 'border-white/[0.12] bg-[#13161b]',
                            )}
                        >
                            <Switch.Thumb className={cn('block size-3.5 rounded-full transition-transform duration-200', selectedStyle.checkboxTapEnabled ? 'translate-x-[18px] bg-[#2dd4bf]' : 'translate-x-[2px] bg-[#64748b]')} />
                        </Switch.Root>
                    </div>
                    {selectedStyle.checkboxTapEnabled ? (
                        <MotionParamRow label="Tap Scale" value={selectedStyle.checkboxTapScale} min={80} max={110} unit="%" onChange={(v) => updateSelectedStyle('checkboxTapScale', v)} />
                    ) : null}
                    <div className="space-y-1">
                        <span className="text-[11px] text-[#8fa6c7]">Selection Icon</span>
                        <select value={selectedStyle.checkboxSelectionIcon} onChange={(event) => updateSelectedStyle('checkboxSelectionIcon', event.target.value as ComponentStyleConfig['checkboxSelectionIcon'])} className="h-8 w-full rounded bg-[#111827] px-2 text-[11px] text-[#e2e8f0] outline-none focus:ring-1 focus:ring-[#2dd4bf]/40">
                            <option value="tick">Tick</option>
                            <option value="cross">Cross</option>
                            <option value="solid">Solid</option>
                        </select>
                    </div>
                    <MotionParamRow label="Selection Speed" value={selectedStyle.checkboxSelectionAnimationSpeed} min={0.08} max={1} step={0.02} unit="s" onChange={(v) => updateSelectedStyle('checkboxSelectionAnimationSpeed', v)} />
                </div>
            ) : null}

            {componentKind === 'slider' ? (
                <div className="space-y-2.5 border-t border-white/[0.08] pt-2">
                    <MotionParamRow label="Thumb Hover Scale" value={selectedStyle.sliderThumbHoverScale} min={0.9} max={1.5} step={0.01} onChange={(v) => updateSelectedStyle('sliderThumbHoverScale', v)} />
                    <MotionParamRow label="Thumb Tap Bounce" value={selectedStyle.sliderThumbTapBounce} min={0} max={0.8} step={0.02} unit="s" onChange={(v) => updateSelectedStyle('sliderThumbTapBounce', v)} />
                    <MotionParamRow label="Bar Fill Speed" value={selectedStyle.sliderBarFillSpeed} min={0.05} max={1.2} step={0.01} unit="s" onChange={(v) => updateSelectedStyle('sliderBarFillSpeed', v)} />
                    <MotionParamRow label="Bar Scale" value={selectedStyle.sliderBarScale} min={0.9} max={1.5} step={0.01} onChange={(v) => updateSelectedStyle('sliderBarScale', v)} />
                    <MotionParamRow label="Bar Bounce" value={selectedStyle.sliderBarBounce} min={0} max={0.8} step={0.02} unit="s" onChange={(v) => updateSelectedStyle('sliderBarBounce', v)} />
                </div>
            ) : null}

            {supportsStaggerMotion(componentKind) ? (
                <div className="space-y-2.5 border-t border-white/[0.08] pt-2">
                    <div className="flex items-center justify-between">
                        <span className="text-[12px] text-[#e2e8f0]">Stagger children</span>
                        <Switch.Root
                            checked={selectedStyle.motionStaggerEnabled}
                            onCheckedChange={(checked) => updateSelectedStyle('motionStaggerEnabled', checked)}
                            aria-label="Enable stagger animation"
                            className={cn(
                                'relative h-5 w-9 shrink-0 rounded-full border transition-colors duration-200 outline-none',
                                'focus-visible:ring-2 focus-visible:ring-[#2dd4bf]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d0f12]',
                                selectedStyle.motionStaggerEnabled
                                    ? 'border-[#2dd4bf]/40 bg-[#2dd4bf]/20'
                                    : 'border-white/[0.12] bg-[#13161b]',
                            )}
                        >
                            <Switch.Thumb
                                className={cn(
                                    'block size-3.5 rounded-full transition-transform duration-200 will-change-transform',
                                    selectedStyle.motionStaggerEnabled
                                        ? 'translate-x-[18px] bg-[#2dd4bf]'
                                        : 'translate-x-[2px] bg-[#64748b]',
                                )}
                            />
                        </Switch.Root>
                    </div>
                    {selectedStyle.motionStaggerEnabled ? (
                        <div className="space-y-2.5">
                            <MotionParamRow label="Stagger Delay" value={selectedStyle.motionStaggerDelay} min={0.01} max={0.3} step={0.01} unit="s" onChange={(v) => updateSelectedStyle('motionStaggerDelay', v)} />
                            <div className="space-y-1">
                                <span className="text-[11px] text-[#8fa6c7]">Direction</span>
                                <div className="flex gap-1">
                                    {(['forward', 'reverse'] as const).map((dir) => (
                                        <button
                                            key={dir}
                                            type="button"
                                            onClick={() => updateSelectedStyle('motionStaggerDirection', dir as StaggerDirection)}
                                            className={cn(
                                                'rounded px-2.5 py-1 text-[10px] font-semibold transition-colors',
                                                selectedStyle.motionStaggerDirection === dir
                                                    ? 'bg-[rgba(45,212,191,0.12)] text-[#2dd4bf]'
                                                    : 'text-[#64748b] hover:text-[#8fa6c7]',
                                            )}
                                        >
                                            {dir.charAt(0).toUpperCase() + dir.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>
            ) : null}
        </div>
    );
}
